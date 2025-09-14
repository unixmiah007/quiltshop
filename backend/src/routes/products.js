// backend/src/routes/products.js
import express from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const prisma = new PrismaClient()
const router = express.Router()

function clampLimit(n, def = 100, max = 100) {
  const num = Number(n ?? def)
  if (!Number.isFinite(num) || num < 1) return def
  return Math.min(num, max)
}

function toBool(v) {
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v !== 0
  const s = String(v ?? '').trim().toLowerCase()
  return ['1', 'true', 'yes', 'on'].includes(s)
}

/** Check if the Product table has the `featuredHome` column (handles Product/product). */
async function hasFeaturedColumn() {
  try {
    const rows = await prisma.$queryRaw`
      SELECT TABLE_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND COLUMN_NAME = 'featuredHome'
        AND TABLE_NAME IN ('Product','product')
      LIMIT 1
    `
    return Array.isArray(rows) && rows.length > 0 ? String(rows[0].TABLE_NAME) : null
  } catch {
    return null
  }
}

/* -------------------------
   Public list & read
--------------------------*/

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const { featuredHome, limit } = req.query
    const take = clampLimit(limit, 100, 100)

    if (featuredHome !== undefined && toBool(featuredHome)) {
      // Only query featured if the column actually exists
      const table = await hasFeaturedColumn()
      if (table) {
        const rows = await prisma.$queryRawUnsafe(
          `SELECT * FROM \`${table}\` WHERE featuredHome = 1 ORDER BY createdAt DESC LIMIT ?`,
          take
        )
        return res.json({ products: rows })
      }
      // Column missing → return empty featured list instead of 500
      return res.json({ products: [] })
    }

    // Normal Prisma path
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take,
    })
    res.json({ products })
  } catch (e) {
    next(e)
  }
})

// Optional: GET /api/products/featured-home
router.get('/featured-home', async (req, res, next) => {
  try {
    const take = clampLimit(req.query.limit, 12, 50)
    const table = await hasFeaturedColumn()
    if (!table) return res.json({ products: [] })

    const rows = await prisma.$queryRawUnsafe(
      `SELECT * FROM \`${table}\` WHERE featuredHome = 1 ORDER BY createdAt DESC LIMIT ?`,
      take
    )
    res.json({ products: rows })
  } catch (e) {
    next(e)
  }
})

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' })
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return res.status(404).json({ error: 'Not found' })
    res.json({ product })
  } catch (e) {
    next(e)
  }
})

/* -------------------------
   Admin create/update/delete
--------------------------*/

// POST /api/products
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { title, description, priceCents, stock, imageUrl, featuredHome } = req.body
    if (!title || !description || priceCents == null) {
      return res.status(400).json({ error: 'Missing fields' })
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        priceCents: Number(priceCents),
        stock: Number(stock ?? 0),
        imageUrl: imageUrl || null,
        // If Prisma model already has featuredHome, this is fine (no-op otherwise)
        ...(prisma.product?.fields?.featuredHome ? { featuredHome: toBool(featuredHome) } : {}),
      },
    })

    // If Prisma model lacks the field but DB has it, update via raw SQL
    if (!prisma.product?.fields?.featuredHome && featuredHome !== undefined) {
      const table = await hasFeaturedColumn()
      if (table) {
        await prisma.$executeRawUnsafe(
          `UPDATE \`${table}\` SET featuredHome = ? WHERE id = ?`,
          toBool(featuredHome) ? 1 : 0,
          product.id
        )
        const rows = await prisma.$queryRawUnsafe(
          `SELECT * FROM \`${table}\` WHERE id = ? LIMIT 1`,
          product.id
        )
        if (Array.isArray(rows) && rows.length) return res.json({ product: rows[0] })
      }
    }

    res.json({ product })
  } catch (e) {
    next(e)
  }
})

// PUT /api/products/:id
router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' })

    const { title, description, priceCents, stock, imageUrl, featuredHome } = req.body

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(priceCents !== undefined ? { priceCents: Number(priceCents) } : {}),
        ...(stock !== undefined ? { stock: Number(stock) } : {}),
        ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}),
        ...(prisma.product?.fields?.featuredHome && featuredHome !== undefined
          ? { featuredHome: toBool(featuredHome) }
          : {}),
      },
    })

    if (!prisma.product?.fields?.featuredHome && featuredHome !== undefined) {
      const table = await hasFeaturedColumn()
      if (table) {
        await prisma.$executeRawUnsafe(
          `UPDATE \`${table}\` SET featuredHome = ? WHERE id = ?`,
          toBool(featuredHome) ? 1 : 0,
          id
        )
        const rows = await prisma.$queryRawUnsafe(
          `SELECT * FROM \`${table}\` WHERE id = ? LIMIT 1`,
          id
        )
        if (Array.isArray(rows) && rows.length) return res.json({ product: rows[0] })
      }
    }

    res.json({ product: updated })
  } catch (e) {
    next(e)
  }
})

// DELETE /api/products/:id
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' })
    await prisma.product.delete({ where: { id } })
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

export default router
