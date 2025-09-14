// /var/www/quiltshop/backend/src/db/mysql.js
import 'dotenv/config'
import mysql from 'mysql2/promise'

const url = process.env.MYSQL_URL
if (!url) {
  throw new Error('Missing MYSQL_URL in .env (e.g. mysql://quilt:PASS@127.0.0.1:3306/quiltshop)')
}

export const pool = mysql.createPool({
  uri: url,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  timezone: 'Z', // UTC
})
