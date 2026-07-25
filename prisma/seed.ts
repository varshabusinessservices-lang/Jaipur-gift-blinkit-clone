import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');
  
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

  const features = [
    { key: 'personalised_products', enabled: true },
    { key: 'dynamic_delivery_promise', enabled: false },
    { key: 'same_day_delivery', enabled: true },
    { key: 'next_day_delivery', enabled: true },
    { key: 'express_delivery', enabled: false },
    { key: 'scheduled_delivery', enabled: false },
    { key: 'delivery_zones', enabled: true },
    { key: 'razorpay', enabled: false },
    { key: 'cash_on_delivery', enabled: false },
    { key: 'manual_upi', enabled: false },
    { key: 'wallet_payment', enabled: false },
    { key: 'customer_android_app', enabled: false },
    { key: 'delivery_android_app', enabled: false },
    { key: 'automatic_media_cleanup', enabled: false },
  ];

  for (const f of features) {
    await prisma.featureFlag.upsert({
      where: { key: f.key },
      update: {},
      create: {
        key: f.key,
        name: f.key.replace(/_/g, ' ').toUpperCase(),
        enabled: f.enabled,
        scope: 'GLOBAL'
      }
    });
  }
  console.log('Upserted Feature Flags');

  const settings = [
    { namespace: 'system', key: 'app_name', val: 'Jaipur Personalised Gifts', type: 'STRING', pub: true },
    { namespace: 'system', key: 'timezone', val: 'Asia/Kolkata', type: 'STRING', pub: true },
    { namespace: 'system', key: 'currency', val: 'INR', type: 'STRING', pub: true },
    { namespace: 'system', key: 'store_mode', val: 'SINGLE_STORE', type: 'STRING', pub: true },
    
    { namespace: 'delivery', key: 'orders_accepted_24x7', val: 'true', type: 'BOOLEAN', pub: true },
    { namespace: 'delivery', key: 'store_opening_time', val: '08:00', type: 'STRING', pub: true },
    { namespace: 'delivery', key: 'store_closing_time', val: '20:00', type: 'STRING', pub: true },
    
    { namespace: 'storage_privacy', key: 'temporary_upload_retention_hours', val: '24', type: 'NUMBER', pub: false },
    { namespace: 'orders_returns', key: 'personalised_returns_enabled', val: 'false', type: 'BOOLEAN', pub: true },
  ];

  for (const s of settings) {
    await prisma.appSetting.upsert({
      where: { namespace_key: { namespace: s.namespace, key: s.key } },
      update: {},
      create: {
        namespace: s.namespace,
        key: s.key,
        valueJson: JSON.stringify(s.val),
        valueType: s.type as any,
        isPublic: s.pub
      }
    });
  }
  console.log('Upserted Settings');

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


  console.log('Seed completed successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
