import { pool } from '../db/mysql.js'

export async function listOrders({ status, q, take = 20, cursorId, from, to }) {
  const params = {}
  let where = 'WHERE 1=1'

  if (status && status !== 'ALL') {
    where += ' AND o.status = :status'
    params.status = status
  }
  if (from) { where += ' AND o.createdAt >= :from'; params.from = from }
  if (to)   { where += ' AND o.createdAt <= :to';   params.to   = to }
  if (q) {
    where += ` AND (
      u.email LIKE :q OR u.name LIKE :q OR
      EXISTS (SELECT 1 FROM OrderItem oi JOIN Product p ON p.id=oi.productId
              WHERE oi.orderId=o.id AND p.title LIKE :q) OR
      o.trackingNo LIKE :q
    )`
    params.q = `%${q}%`
  }
  if (cursorId) {
    // keyset pagination: createdAt/id
    where += ' AND (o.createdAt < (SELECT createdAt FROM `Order` WHERE id=:cursorId) OR (o.createdAt = (SELECT createdAt FROM `Order` WHERE id=:cursorId) AND o.id < :cursorId))'
    params.cursorId = Number(cursorId)
  }

  const sql = `
    SELECT o.*, u.name AS userName, u.email AS userEmail
    FROM \`Order\` o
    JOIN \`User\` u ON u.id = o.userId
    ${where}
    ORDER BY o.createdAt DESC, o.id DESC
    LIMIT :take
  `
  params.take = Math.min(Number(take||20), 100)

  const [rows] = await pool.query(sql, params)

  // Attach items (one additional query for all)
  const ids = rows.map(r => r.id)
  let itemsByOrder = {}
  if (ids.length) {
    const [items] = await pool.query(`
      SELECT oi.*, p.title, p.imageUrl
      FROM OrderItem oi
      JOIN Product p ON p.id = oi.productId
      WHERE oi.orderId IN (${ids.map(()=>'?').join(',')})
      ORDER BY oi.id ASC
    `, ids)

    itemsByOrder = items.reduce((acc, it) => {
      (acc[it.orderId] ||= []).push(it)
      return acc
    }, {})
  }

  const orders = rows.map(r => ({
    ...r,
    user: { name: r.userName, email: r.userEmail },
    items: itemsByOrder[r.id] || []
  }))
  const nextCursor = orders.length === params.take ? orders[orders.length - 1].id : null
  return { orders, nextCursor }
}

export async function setOrderStatus({ id, status, actorId }) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const data = []
    let setParts = ['status=?']
    data.push(status)

    if (status === 'SHIPPED') { setParts.push('shippedAt=UTC_TIMESTAMP(3)') }
    if (status === 'DONE')    { setParts.push('fulfilledAt=UTC_TIMESTAMP(3)') }

    data.push(id)
    await conn.query(`UPDATE \`Order\` SET ${setParts.join(', ')} WHERE id=?`, data)
    await conn.query(`INSERT INTO OrderAudit (orderId, actorId, action, note) VALUES (?,?,?,?)`,
      [id, actorId || null, 'STATUS_UPDATE', status])
    await conn.commit()
  } catch (e) {
    await conn.rollback(); throw e
  } finally { conn.release() }

  const [rows] = await pool.query(`SELECT * FROM \`Order\` WHERE id=?`, [id])
  return rows[0]
}

export async function setTracking({ id, carrier, trackingNo, actorId }) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    await conn.query(`
      UPDATE \`Order\`
      SET carrier=?, trackingNo=?, shippedAt=IFNULL(shippedAt, UTC_TIMESTAMP(3)), status='SHIPPED'
      WHERE id=?`, [carrier || null, trackingNo, id])
    await conn.query(`INSERT INTO OrderAudit (orderId, actorId, action, note) VALUES (?,?,?,?)`,
      [id, actorId || null, 'TRACKING_SET', `${carrier||''} ${trackingNo}`.trim()])
    await conn.commit()
  } catch (e) {
    await conn.rollback(); throw e
  } finally { conn.release() }

  const [rows] = await pool.query(`SELECT * FROM \`Order\` WHERE id=?`, [id])
  return rows[0]
}
