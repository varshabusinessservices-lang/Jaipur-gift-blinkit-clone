import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting backend seed for Jaipur Gifting Enterprise...');
  
  // Jaipur Main Store
  const store = await prisma.store.upsert({
    where: { code: 'JPR-MAIN' },
    update: {},
    create: {
      name: 'Jaipur Main Store',
      code: 'JPR-MAIN',
      slug: 'jaipur-main-store',
      mode: 'SINGLE_STORE',
      status: 'ACTIVE',
    }
  });
  console.log('Upserted Store:', store.name);

  // Categories: Customised Gifts, No Customised, Jewellery, Mugs, Photo Frame, Mouse Pad, Bottle
  const categoriesList = [
    { name: 'Customised Gifts', slug: 'customised', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500&q=80' },
    { name: 'No Customised', slug: 'no-customised', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80' },
    { name: 'Jewellery', slug: 'jewellery', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80' },
    { name: 'Mugs', slug: 'mugs', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80' },
    { name: 'Photo Frame', slug: 'photo-frame', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80' },
    { name: 'Mouse Pad', slug: 'mouse-pad', image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80' },
    { name: 'Bottle', slug: 'bottle', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80' }
  ];

  for (const cat of categoriesList) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: {
        storeId: store.id,
        name: cat.name,
        slug: cat.slug,
        status: 'ACTIVE',
        showOnHomepage: true,
        sortOrder: 0
      }
    });
  }
  console.log('Upserted Categories successfully');

  // Development Admin
  if (process.env.NODE_ENV !== 'production') {
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    const admin = await prisma.adminUser.upsert({
      where: { email: 'admin@example.com' },
      update: {
        passwordHash,
        status: 'ACTIVE',
        role: 'SUPER_ADMIN'
      },
      create: {
        name: 'Development Super Admin',
        email: 'admin@example.com',
        status: 'ACTIVE',
        role: 'SUPER_ADMIN',
        passwordHash
      }
    });
    console.log('Upserted Development Admin:', admin.email);
  }

  console.log('Backend seed completed successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
