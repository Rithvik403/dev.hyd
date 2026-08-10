import { PrismaClient } from '@prisma/client'
import { getLocalDbClient } from './localStore.js'

let prismaInstance = null
let useLocalFallback = false
let localDb = null

function getLocalDb() {
  if (!localDb) {
    localDb = getLocalDbClient()
  }
  return localDb
}

function initPrismaClient() {
  if (!process.env.DATABASE_URL) {
    useLocalFallback = true
    return getLocalDb()
  }

  try {
    const rawPrisma = new PrismaClient()
    return rawPrisma
  } catch (err) {
    useLocalFallback = true
    return getLocalDb()
  }
}

prismaInstance = globalThis.__prisma ?? initPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prismaInstance
}

const resilientPrisma = new Proxy(prismaInstance, {
  get(target, prop, receiver) {
    if (useLocalFallback) {
      const local = getLocalDb()
      return local[prop] || target[prop]
    }

    const orig = Reflect.get(target, prop, receiver)

    if (typeof orig === 'function') {
      return async function (...args) {
        try {
          return await orig.apply(target, args)
        } catch (err) {
          const msg = err?.message || ''
          if (
            msg.includes('ENOTFOUND') ||
            msg.includes('ECONNREFUSED') ||
            msg.includes('tenant/user') ||
            msg.includes('PrismaClientInitializationError') ||
            msg.includes('Can\'t reach database server') ||
            msg.includes('P1001')
          ) {
            useLocalFallback = true
            const local = getLocalDb()
            if (typeof local[prop] === 'function') {
              return await local[prop](...args)
            }
            return true
          }
          throw err
        }
      }
    }

    if (!orig) {
      const local = getLocalDb()
      return local[prop]
    }

    if (typeof orig === 'object' && orig !== null) {
      return new Proxy(orig, {
        get(modelTarget, modelProp) {
          const modelMethod = modelTarget[modelProp]
          if (typeof modelMethod === 'function') {
            return async function (...args) {
              if (useLocalFallback) {
                const local = getLocalDb()
                const localModel = local[prop]
                if (localModel && typeof localModel[modelProp] === 'function') {
                  return await localModel[modelProp](...args)
                }
              }

              try {
                return await modelMethod.apply(modelTarget, args)
              } catch (err) {
                const msg = err?.message || ''
                if (
                  msg.includes('ENOTFOUND') ||
                  msg.includes('ECONNREFUSED') ||
                  msg.includes('tenant/user') ||
                  msg.includes('PrismaClientInitializationError') ||
                  msg.includes('Can\'t reach database server') ||
                  msg.includes('P1001') ||
                  msg.includes('does not exist')
                ) {
                  useLocalFallback = true
                  const local = getLocalDb()
                  const localModel = local[prop]
                  if (localModel && typeof localModel[modelProp] === 'function') {
                    return await localModel[modelProp](...args)
                  }
                  return null
                }
                throw err
              }
            }
          }
          return modelMethod
        }
      })
    }

    return orig
  }
})

export default resilientPrisma
