import { PrismaClient } from '@prisma/client'
import { getLocalDbClient } from './lib/localStore.js'

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
    console.warn('⚠️ DATABASE_URL not set — using resilient local storage.')
    useLocalFallback = true
    return getLocalDb()
  }

  try {
    const rawPrisma = new PrismaClient()
    return rawPrisma
  } catch (err) {
    console.warn('⚠️ PrismaClient initialization failed, falling back to local database:', err.message)
    useLocalFallback = true
    return getLocalDb()
  }
}

prismaInstance = globalThis.__prisma ?? initPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prismaInstance
}

// Resilient Proxy that catches DB connection failures on any Prisma call
// and seamlessly delegates to the local storage fallback.
const resilientPrisma = new Proxy(prismaInstance, {
  get(target, prop, receiver) {
    if (useLocalFallback) {
      const local = getLocalDb()
      return local[prop] || target[prop]
    }

    const orig = Reflect.get(target, prop, receiver)

    // Handle top-level Prisma methods like $connect, $disconnect, $queryRaw, $transaction
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
            console.warn(`⚠️ PostgreSQL unavailable (${msg.split('\n')[0]}). Switching seamlessly to local database.`)
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

    // If the model is not found on raw prisma instance or not an object, fallback to local store
    if (!orig) {
      const local = getLocalDb()
      return local[prop]
    }

    // Handle model access (e.g. prisma.admin, prisma.client, prisma.project, prisma.activityLog)
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
                  console.warn(`⚠️ Database note on prisma.${String(prop)}.${String(modelProp)}. Using resilient local storage fallback.`)
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
