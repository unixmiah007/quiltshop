import 'dotenv/config'
import mysql from 'mysql2/promise'

const url = process.env.MYSQL_URL
if (!url) throw new Error('Missing MYSQL_URL in .env')

export const pool = mysql.createPool({
  uri: url,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  timezone: 'Z', // UTC
})
