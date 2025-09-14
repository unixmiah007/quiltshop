import express from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db/mysql.js'
import { authCookieName } from '../middlewares/auth.js'

const router = express.Router()
const days = Number(process.env.JWT_EXPIRES_DAYS || 14)

function tokenFor(user) {
  const payload = { id: user.id, email: user.email, role: user.role, name: user.name }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: `${days}d` })
}

// after creating JWT `token`
function sendSession(res, user) {
  const token = tokenFor(user)
  // SameSite=Lax works for your same-origin setup (HTTP). Set secure:true when you move to HTTPS.
res.cookie('token', token, {
  httpOnly: true,
  secure: false,       // ← false on HTTP (set true only with HTTPS)
  sameSite: 'Lax',     // ← 'None' requires HTTPS; Lax is fine for same-origin XHR
  path: '/',
  maxAge: 30*24*3600*1000,
})

}
res.json({ ok:true, user:{ id:user.id, email:user.email, name:user.name, role:user.role } })

router.post(
  '/register',
  body('name').trim().isLength({ min: 2 }).withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg })

    const { name, email, password } = req.body
    const [exists] = await pool.query('SELECT id FROM `User` WHERE email=?', [email])
    if (exists.length) return res.status(409).json({ error: 'Email already registered' })

    const hash = await bcrypt.hash(password, 10)
    const [r] = await pool.query(
      'INSERT INTO `User` (name,email,password,role) VALUES (?,?,?,?)',
      [name, email, hash, 'USER']
    )
    const [rows] = await pool.query('SELECT id,name,email,role FROM `User` WHERE id=?', [r.insertId])
    const user = rows[0]
    sendSession(res, user)
    res.json({ user })
  }
)

router.post(
  '/login',
  body('email').isEmail(),
  body('password').isLength({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid credentials' })

    const { email, password } = req.body
    const [rows] = await pool.query('SELECT * FROM `User` WHERE email=?', [email])
    const user = rows[0]
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' })

    sendSession(res, { id: user.id, name: user.name, email: user.email, role: user.role })
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  }
)

router.post('/logout', (req, res) => {
  res.clearCookie(authCookieName, { path: '/' })
  res.json({ ok: true })
})

router.get('/me', (req, res) => {
  // setUserFromToken should have populated req.user
  res.json({ user: req.user || null })
})

export default router
