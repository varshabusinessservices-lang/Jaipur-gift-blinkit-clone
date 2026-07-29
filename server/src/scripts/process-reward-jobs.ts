import { RewardCoolingProcessor } from '../modules/rewards/reward.cooling.processor';
import { RewardAutoConversionProcessor } from '../modules/rewards/reward.autoconvert.processor';
import { RewardWalletExpiryProcessor } from '../modules/rewards/reward.wallet.expiry.processor';
import { RewardExpiryNotificationProcessor } from '../modules/rewards/reward.expiry.notification.processor';
import { RewardReconciliationService } from '../modules/rewards/reward.reconciliation.service';

async function main() {
  const args = process.argv.slice(2);
  const jobArg = args.find((a) => a.startsWith('--job='))?.split('=')[1] || 'all';

  console.log(`[RewardWorker] Starting job execution: ${jobArg}`);

  if (jobArg === 'cooling' || jobArg === 'all') {
    const res = await RewardCoolingProcessor.processCoolingRewards();
    console.log('[RewardWorker] Cooling processor result:', JSON.stringify(res));
  }

  if (jobArg === 'autoconvert' || jobArg === 'all') {
    const res = await RewardAutoConversionProcessor.processDueAutoConversions();
    console.log('[RewardWorker] Auto-convert processor result:', JSON.stringify(res));
  }

  if (jobArg === 'expiry' || jobArg === 'all') {
    const res = await RewardWalletExpiryProcessor.processExpiringRewardLots();
    console.log('[RewardWorker] Wallet expiry processor result:', JSON.stringify(res));
  }

  if (jobArg === 'notify-schedule' || jobArg === 'all') {
    const res = await RewardExpiryNotificationProcessor.scheduleExpiryNotifications();
    console.log('[RewardWorker] Schedule notification processor result:', JSON.stringify(res));
  }

  if (jobArg === 'notify-send' || jobArg === 'all') {
    const res = await RewardExpiryNotificationProcessor.processDueNotifications();
    console.log('[RewardWorker] Send notification processor result:', JSON.stringify(res));
  }

  if (jobArg === 'reconcile' || jobArg === 'all') {
    const res = await RewardReconciliationService.reconcileDateRange();
    console.log('[RewardWorker] Reconciliation service result:', JSON.stringify(res));
  }

  console.log('[RewardWorker] Job execution finished.');
  process.exit(0);
}

main().catch((err) => {
  console.error('[RewardWorker] Unhandled error during job execution:', err);
  process.exit(1);
});
