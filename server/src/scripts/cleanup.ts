import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try loading server/.env first, then root .env
const serverEnvPath = path.resolve(process.cwd(), 'server/.env');
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

import { prisma } from '../database/prisma';
import { CustomerUploadsRepository } from '../modules/customerUploads/customerUploads.repository';
import { PersonalisationFormRepository } from '../modules/personalisationForms/personalisationForms.repository';
import { ProductRepository } from '../modules/products/products.repository';
import { CustomerUploadsService } from '../modules/customerUploads/customerUploads.service';

async function run() {
  const dryRun = process.argv.includes('--dry-run') || process.argv.includes('dry-run');
  console.log(`[cleanup-cli]: Starting cleanup... (Mode: ${dryRun ? 'DRY-RUN' : 'LIVE'})`);

  try {
    // Fail-fast database check
    if (process.env.NODE_ENV === 'production' || process.env.ALLOW_JSON_STORAGE_FALLBACK === 'false') {
      console.log('[cleanup-cli]: Verifying database connection...');
      await prisma.$connect();
      await prisma.$executeRawUnsafe('SELECT 1');
      console.log('[cleanup-cli]: Database connection established.');
    }

    const repo = new CustomerUploadsRepository();
    const formRepo = new PersonalisationFormRepository();
    const productRepo = new ProductRepository();
    const uploadService = new CustomerUploadsService(repo, formRepo, productRepo);

    const result = await uploadService.runCleanup(dryRun);
    console.log('[cleanup-cli]: Cleanup completed successfully.');
    console.log(JSON.stringify(result, null, 2));
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (err: any) {
    console.error('[cleanup-cli]: Error during cleanup run:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

run();
