import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import sharp from 'sharp'
import crypto from 'crypto'
import { authenticate } from '../middleware/auth.js'
import { env } from '../config/env.js'
import { BadRequestError } from '../utils/errors.js'
import type { AuthRequest } from '../types/index.js'

const router = Router()

// Ensure upload directory exists
await fs.mkdir(env.UPLOAD_DIR, { recursive: true })
await fs.mkdir(path.join(env.UPLOAD_DIR, 'thumbnails'), { recursive: true })

// Multer configuration
const storage = multer.memoryStorage()

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new BadRequestError(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(env.MAX_FILE_SIZE, 10),
  },
})

router.use(authenticate)

// POST /api/upload
router.post(
  '/',
  upload.single('file'),
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.file) {
        throw new BadRequestError('No file uploaded')
      }

      // Generate unique filename
      const ext = path.extname(req.file.originalname).toLowerCase() || '.jpg'
      const randomName = crypto.randomBytes(16).toString('hex')
      const filename = `${randomName}${ext}`
      const thumbnailFilename = `${randomName}_thumb.webp`

      // Process image with sharp
      const image = sharp(req.file.buffer)
      const metadata = await image.metadata()

      // Remove EXIF data and resize if needed
      let processedImage = image
        .rotate() // Auto-rotate based on EXIF
        .withMetadata({ orientation: undefined }) // Remove orientation metadata

      // Resize if larger than 2048px
      if (metadata.width && metadata.width > 2048) {
        processedImage = processedImage.resize(2048, null, { withoutEnlargement: true })
      }

      // Save original (with stripped EXIF)
      const processedBuffer = await processedImage.toBuffer()
      const filePath = path.join(env.UPLOAD_DIR, filename)
      await fs.writeFile(filePath, processedBuffer)

      // Generate thumbnail
      const thumbnailBuffer = await sharp(processedBuffer)
        .resize(300, 300, { fit: 'cover' })
        .webp({ quality: 80 })
        .toBuffer()

      const thumbnailPath = path.join(env.UPLOAD_DIR, 'thumbnails', thumbnailFilename)
      await fs.writeFile(thumbnailPath, thumbnailBuffer)

      // Get final dimensions
      const finalMetadata = await sharp(processedBuffer).metadata()

      res.status(201).json({
        data: {
          filePath: `/uploads/${filename}`,
          thumbnailPath: `/uploads/thumbnails/${thumbnailFilename}`,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          fileSize: processedBuffer.length,
          width: finalMetadata.width,
          height: finalMetadata.height,
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

// DELETE /api/upload/:filename
router.delete('/:filename', async (req: AuthRequest, res, next) => {
  try {
    const { filename } = req.params

    // Validate filename to prevent directory traversal
    if (filename.includes('/') || filename.includes('..')) {
      throw new BadRequestError('Invalid filename')
    }

    const filePath = path.join(env.UPLOAD_DIR, filename)
    const thumbnailPath = path.join(
      env.UPLOAD_DIR,
      'thumbnails',
      filename.replace(/\.[^.]+$/, '_thumb.webp')
    )

    // Delete both files
    try {
      await fs.unlink(filePath)
    } catch {
      // File might not exist, ignore
    }

    try {
      await fs.unlink(thumbnailPath)
    } catch {
      // Thumbnail might not exist, ignore
    }

    res.json({ data: { message: 'File deleted successfully' } })
  } catch (error) {
    next(error)
  }
})

export default router
