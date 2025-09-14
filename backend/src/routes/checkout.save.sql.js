import express from 'express'
import { requireAuth } from '../middlewares/auth.js'
import { pool } from '../db/mysql.js'

const router = express.Router()

// body: { items: [{productId, quantity}], shipping:{...}, billing:{...} }
router.post('/save', requireAuth, async (req, res, next) => {
  const userId = req.user.id
  const { items = [], shipping = {}, billing = {} } = req.body

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items' })
  }

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    // Load product prices from DB to prevent tampering
    const ids = items.map(i => Number(i.productId)).filter(Boolean)
    if (!ids.length) throw new Error('Invalid items')

    const [prods] = await conn.query(
      `SELECT id, priceCents FROM Product WHERE id IN (${ids.map(()=>'?').join(',')})`,
      ids
    )
    const priceMap = Object.fromEntries(prods.map(p => [p.id, p.priceCents]))

    const normalized = items.map(it => ({
      productId: Number(it.productId),
      quantity:  Math.max(1, Number(it.quantity || 1)),
      unitCents: priceMap[Number(it.productId)] ?? 0,
    })).filter(it => it.unitCents > 0)

    if (!normalized.length) throw new Error('No valid items')

    const totalCents = normalized.reduce((sum, it) => sum + it.unitCents * it.quantity, 0)

    // Insert order (PENDING)
    const [r] = await conn.query(
      `INSERT INTO \`Order\`
       (userId, totalCents, status,
        shippingName, shippingAddr1, shippingAddr2, shippingCity, shippingState, shippingPostal, shippingCountry,
        billingName,  billingAddr1,  billingAddr2,  billingCity,  billingState,  billingPostal,  billingCountry)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        userId, totalCents, 'PENDING',
        shipping.name || null, shipping.addr1 || null, shipping.addr2 || null, shipping.city || null,
        shipping.state || null, shipping.postal || null, shipping.country || null,
        billing.name || null,  billing.addr1 || null,  billing.addr2 || null,  billing.city || null,
        billing.state || null,  billing.postal || null,  billing.country || null,
      ]
    )

    const orderId = r.insertId

    // Insert items
    const values = normalized.flatMap(it => [orderId, it.productId, it.quantity, it.unitCents])
    await conn.query(
      `INSERT INTO OrderItem (orderId, productId, quantity, unitCents)
       VALUES ${normalized.map(()=>'(?, ?, ?, ?)').join(',')}`,
      values
    )

    await conn.commit()
    return res.json({ ok: true, orderId, totalCents })
  } catch (e) {
    await conn.rollback()
    return next(e)
  } finally {
    conn.release()
  }
})

export default router
