// backend/src/index.js
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
// Keep Prisma only if other routes use it; otherwise you can remove the import.
// import { PrismaClient } from '@prisma/client'

// ROUTES (existing)
import productRoutes from './routes/products.js'
import uploadRoutes from './routes/uploads.js'
import checkoutRoutes from './routes/checkout.js'
import checkoutSaveRoutes from './routes/checkout.save.sql.js'
import orderRoutes from './routes/orders.js'

// AUTH (non-Prisma)
import authRoutes from './routes/auth.sql.js'
import { setUserFromToken } from './middlewares/auth.js'

// ADMIN (non-Prisma)
import adminProducts from './routes/adminProducts.sql.js'
import adminOrders from './routes/adminOrders.sql.js' // or ./routes/adminOrders.js if you prefer

// const prisma = new PrismaClient() // uncomment only if used elsewhere

const app = express()
const PORT = process.env.PORT || 4000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ---- Middleware (order matters) ----
app.use(morgan('dev'))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

// CORS: allowlist via CORS_ORIGINS or FRONTEND_URL (comma-separated)
const raw = process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173'
const allowlist = raw.split(',').map(s => s.trim()).filter(Boolean)
app.use(
  cors({
    origin(origin, cb) {
      // allow same-origin / no-origin (curl, server-to-server)
      if (!origin) return cb(null, true)
      if (allowlist.includes(origin)) return cb(null, true)
      return cb(new Error(`Not allowed by CORS: ${origin}`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)
app.options('*', cors()) // handle preflights

// Attach req.user if JWT cookie present (needed before admin routes)
app.use(setUserFromToken)

// Static: /uploads -> backend/uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// ---- Routes ----
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/checkout', checkoutSaveRoutes)
app.use('/api/orders', orderRoutes)

// Admin routes (require req.user from middleware above)
app.use('/api/admin/orders', adminOrders)
app.use('/api/admin/products', adminProducts)

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }))

// Basic error handler (helps surface CORS/guard errors)
app.use((err, _req, res, _next) => {
  console.error(err?.stack || err)
  const msg = typeof err?.message === 'string' ? err.message : 'Server error'
  res.status(500).json({ error: msg })
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
  console.log('CORS allowlist:', allowlist.join(', ') || '(none)')
})

export default app
