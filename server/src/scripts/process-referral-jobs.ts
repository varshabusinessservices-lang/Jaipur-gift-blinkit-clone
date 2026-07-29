import { ReferralCoolingProcessor } from '../modules/referrals/referral.cooling.processor';
import { ReferralCreditExpiryProcessor } from '../modules/referrals/referral.expiry.processor';
import { ReferralNotificationService } from '../modules/referrals/referral.notification.service';
import { ReferralReconciliationService } from '../modules/referrals/referral.reconciliation.service';

async function main() {
  const args = process.argv.slice(2);
  const jobArg = args.find((a) => a.startsWith('--job='))?.split('=')[1] || 'all';

  console.log(`[ReferralWorker] Starting job execution: ${jobArg}`);

  if (jobArg === 'cooling' || jobArg === 'all') {
    const res = await ReferralCoolingProcessor.processDueReferralQualifications();
    console.log('[ReferralWorker] Cooling processor result:', JSON.stringify(res));
  }

  if (jobArg === 'expiry' || jobArg === 'all') {
    const res = await ReferralCreditExpiryProcessor.processReferralCreditExpiry();
    console.log('[ReferralWorker] Expiry processor result:', JSON.stringify(res));
  }

  if (jobArg === 'notifications' || jobArg === 'all') {
    const res = await ReferralNotificationService.processDueNotifications();
    console.log('[ReferralWorker] Notifications processor result:', JSON.stringify(res));
  }

  if (jobArg === 'reconciliation' || jobArg === 'all') {
    const res = await ReferralReconciliationService.runReconciliation();
    console.log('[ReferralWorker] Reconciliation processor result:', JSON.stringify(res));
  }

  console.log('[ReferralWorker] Job execution finished.');
  process.exit(0);
}

main().catch((err) => {
  console.error('[ReferralWorker] Unhandled error during job execution:', err);
  process.exit(1);
});
