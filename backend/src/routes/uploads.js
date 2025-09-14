// backend/src/routes/uploads.js
import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

const uploadDir = path.join(__dirname, '..', '..', 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ts = Date.now()
    const ext = path.extname(file.originalname || '').toLowerCase()
    cb(null, `img_${ts}${ext || '.png'}`)
  }
})
const upload = multer({ storage })

// POST /api/uploads  (field name must be 'image')
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  // public URL via nginx static /uploads
  const url = `${process.env.PUBLIC_ORIGIN || 'http://3.82.218.69'}/uploads/${req.file.filename}`
  res.json({ url })
})

export default router
