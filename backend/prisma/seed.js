import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const BASE = process.env.BACKEND_URL || 'http://localhost:4000';

async function upsertProductByTitle(p) {
  const existing = await prisma.product.findFirst({ where: { title: p.title } });
  if (existing) {
    await prisma.product.update({
      where: { id: existing.id },
      data: {
        description: p.description,
        priceCents: p.priceCents,
        stock: p.stock,
        imageUrl: p.imageUrl,
      },
    });
    console.log('Updated product:', p.title);
  } else {
    await prisma.product.create({ data: p });
    console.log('Created product:', p.title);
  }
}

async function main() {
  // Admin user
  const adminEmail = 'admin@quilt.shop';
  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!adminExists) {
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
      },
    });
    console.log('Seeded admin user:', adminEmail, '/ admin123');
  }

  // Products with local thumbnails served from backend/uploads
  const products = [
    {
      title: 'Sunset Patchwork',
      description: 'Handmade queen-size quilt blending warm sunset tones in traditional patchwork blocks. 100% cotton, machine quilted for durability.',
      priceCents: 22900,
      stock: 5,
      imageUrl: `${BASE}/uploads/quilt1.png`,
    },
    {
      title: 'Ocean Breeze',
      description: 'Cool blues and crisp whites in a calming geometric layout. Lightweight batting—perfect for spring and summer evenings.',
      priceCents: 19900,
      stock: 7,
      imageUrl: `${BASE}/uploads/quilt2.png`,
    },
    {
      title: 'Countryside Charm',
      description: 'Classic florals with a cozy cottage feel. Each block is hand-cut and pieced for a timeless, heirloom look.',
      priceCents: 18900,
      stock: 4,
      imageUrl: `${BASE}/uploads/quilt3.png`,
    },
    {
      title: 'Starry Night Sampler',
      description: 'Sampler of star blocks in midnight blues and silver grays. Soft-to-the-touch backing and precision stitching.',
      priceCents: 24900,
      stock: 3,
      imageUrl: `${BASE}/uploads/quilt4.png`,
    },
    {
      title: 'Autumn Leaves Throw',
      description: 'Warm earth tones and leaf motifs—ideal throw size for the couch or reading nook. Pre-washed for softness.',
      priceCents: 14900,
      stock: 8,
      imageUrl: `${BASE}/uploads/quilt5.png`,
    },
    {
      title: 'Modern Minimal Herringbone',
      description: 'Clean lines in neutral shades arranged in a bold herringbone pattern. Contemporary look, classic craftsmanship.',
      priceCents: 21900,
      stock: 6,
      imageUrl: `${BASE}/uploads/quilt6.png`,
    },
  ];

  for (const p of products) {
    await upsertProductByTitle(p);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
