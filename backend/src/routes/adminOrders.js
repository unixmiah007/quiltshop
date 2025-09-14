import express from 'express'
import prisma from '../utils/prisma.js'

// simple admin guard; adjust to your auth
function requireAdmin(req, res, next) {
  // assuming req.user is set by your auth middleware
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' })
  }
  next()
}

const router = express.Router()

// List orders (with basic filters)
router.get('/', requireAdmin, async (req, res) => {
  const { status, q } = req.query
  const where = {}

  if (status && status !== 'ALL') where.status = status
  if (q) {
    where.OR = [
      { user: { email: { contains: q, mode: 'insensitive' } } },
      { user: { name:  { contains: q, mode: 'insensitive' } } },
      { items: { some: { product: { title: { contains: q, mode: 'insensitive' } } } } },
    ]
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user:  { select: { id: true, name: true, email: true } },
      items: {
        include: { product: { select: { id: true, title: true, imageUrl: true } } }
      },
    },
  })
  res.json({ orders })
})

// Update status (PENDING/PAID/SHIPPED/DONE/CANCELED)
router.patch('/:id/status', requireAdmin, async (req, res) => {
  const id = Number(req.params.id)
  const { status } = req.body
  const allowed = ['PENDING','PAID','SHIPPED','DONE','CANCELED']
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' })

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      user:  { select: { id: true, name: true, email: true } },
      items: { include: { product: true } },
    }
  })
  res.json({ order: updated })
})

export default router
