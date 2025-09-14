import express from 'express'
import { listOrders, setOrderStatus, setTracking } from '../repos/orderRepo.js'

// Simple admin guard: assumes you already set req.user via your auth middleware
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' })
  }
  next()
}

const router = express.Router()

router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const { status, q, take, cursor, from, to } = req.query
    const out = await listOrders({
      status,
      q: q?.trim() || '',
      take: take ? Number(take) : 20,
      cursorId: cursor ? Number(cursor) : undefined,
      from: from ? new Date(from) : undefined,
      to:   to   ? new Date(to)   : undefined,
    })
    res.json(out)
  } catch (e) { next(e) }
})

router.patch('/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const { status } = req.body
    const allowed = ['PENDING', 'PAID', 'SHIPPED', 'DONE', 'CANCELED']
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' })
    const order = await setOrderStatus({ id, status, actorId: req.user?.id })
    res.json({ order })
  } catch (e) { next(e) }
})

router.patch('/:id/tracking', requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const { carrier, trackingNo } = req.body
    if (!trackingNo) return res.status(400).json({ error: 'trackingNo required' })
    const order = await setTracking({ id, carrier, trackingNo, actorId: req.user?.id })
    res.json({ order })
  } catch (e) { next(e) }
})

router.get('/export.csv', requireAdmin, async (req, res, next) => {
  try {
    // Reuse list function with a large take
    const { status } = req.query
    const { orders } = await listOrders({ status, take: 1000 })
    const header = ['id','createdAt','status','totalCents','customerName','customerEmail','carrier','trackingNo','shippedAt','fulfilledAt']
    const lines = orders.map(o => [
      o.id,
      new Date(o.createdAt).toISOString(),
      o.status,
      o.totalCents,
      JSON.stringify(o.user?.name || ''),
      JSON.stringify(o.user?.email || ''),
      JSON.stringify(o.carrier || ''),
      JSON.stringify(o.trackingNo || ''),
      o.shippedAt ? new Date(o.shippedAt).toISOString() : '',
      o.fulfilledAt ? new Date(o.fulfilledAt).toISOString() : ''
    ].join(','))
    const csv = [header.join(','), ...lines].join('\n')
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"')
    res.send(csv)
  } catch (e) { next(e) }
})

export default router
