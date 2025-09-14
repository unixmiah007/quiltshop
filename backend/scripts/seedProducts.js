import 'dotenv/config'
import mysql from 'mysql2/promise'

const url = process.env.MYSQL_URL || 'mysql://quilt:QuiltPass123!@127.0.0.1:3306/quiltshop'
const rows = [
  ['Sunset Patchwork','Warm sunset tones, 100% cotton.',22900,5,'http://3.82.218.69/uploads/quilt1.png'],
  ['Ocean Breeze','Cool blues and crisp whites.',19900,7,'http://3.82.218.69/uploads/quilt2.png'],
  ['Countryside Charm','Classic florals, cozy cottage feel.',18900,4,'http://3.82.218.69/uploads/quilt3.png'],
  ['Starry Night Sampler','Midnight blues and silver grays.',24900,3,'http://3.82.218.69/uploads/quilt4.png'],
  ['Autumn Leaves Throw','Warm earth tones, throw size.',14900,8,'http://3.82.218.69/uploads/quilt5.png'],
  ['Modern Minimal Herringbone','Neutral herringbone pattern.',21900,6,'http://3.82.218.69/uploads/quilt6.png'],
]

const sql = `INSERT INTO Product (title,description,priceCents,stock,imageUrl)
             VALUES (?,?,?,?,?)
             ON DUPLICATE KEY UPDATE
               description=VALUES(description),
               priceCents=VALUES(priceCents),
               stock=VALUES(stock),
               imageUrl=VALUES(imageUrl)`

const run = async () => {
  const conn = await mysql.createConnection({ uri: url, namedPlaceholders: true })
  for (const r of rows) await conn.query(sql, r)
  await conn.end()
  console.log('Seeded products.')
}
run().catch(e => { console.error(e); process.exit(1) })
