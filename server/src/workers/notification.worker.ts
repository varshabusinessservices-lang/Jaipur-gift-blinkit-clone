import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const serverEnvPath = path.resolve(process.cwd(), 'server/.env');
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

import { NotificationsService } from '../modules/notifications/notifications.service';

async function runWorker() {
  console.log('[NotificationWorker] Starting notification outbox worker...');
  const service = new NotificationsService();

  const runLoop = async () => {
    try {
      await service.processOutboxEvents();
    } catch (err) {
      console.error('[NotificationWorker] Error processing outbox events:', err);
    }
  };

  await runLoop();
  setInterval(runLoop, 10000); // every 10 seconds
}

runWorker();
