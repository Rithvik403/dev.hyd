import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let supabase = null
try {
  const isSupabaseConfigured = Boolean(
    process.env.SUPABASE_URL && 
    process.env.SUPABASE_URL.startsWith('http') && 
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  if (isSupabaseConfigured) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('☁️ Supabase Storage configured for file uploads')
  } else {
    console.log('📁 Local disk fallback configured for file uploads')
  }
} catch (err) {
  console.warn('⚠️ Supabase Storage init warning (using local fallback):', err.message)
}

// Multer memory storage (allows us to decide where to send the buffer)
const storage = multer.memoryStorage()
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|pdf|docx|txt|zip/
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new Error('File upload only supports images, PDFs, docs, text, and zip files.'))
  }
})

// Core helper function to upload a buffer and return URL
export async function uploadFileToStorage(file) {
  if (!file) return null

  if (supabase) {
    try {
      const bucket = process.env.SUPABASE_BUCKET || 'uploads'
      const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`
      const { error } = await supabase.storage.from(bucket).upload(uniqueFilename, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      })

      if (!error) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(uniqueFilename)
        return data?.publicUrl || null
      }

      console.error('Supabase upload failed, trying local fallback:', error.message)
    } catch (err) {
      console.error('Supabase upload failed, trying local fallback:', err)
    }
  }

  try {
    const uploadDir = path.join(__dirname, '../public/uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`
    const filePath = path.join(uploadDir, uniqueFilename)

    await fs.promises.writeFile(filePath, file.buffer)
    return `/uploads/${uniqueFilename}`
  } catch (err) {
    console.error('Local file write failed:', err)
    throw new Error('Failed to save uploaded file')
  }
}
