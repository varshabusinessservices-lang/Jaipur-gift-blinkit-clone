import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ReferralConfigService } from './referral.config.service';
import { ReferralQualificationService } from './referral.qualification.service';

export class ReferralReversalService {
  static async handlePartialRefund(orderId: string, refundAmount: number | Prisma.Decimal): Promise<{
    relationshipId?: string;
    qualificationReversed: boolean;
    referrerCreditReversed: boolean;
    recoveryCaseCreated: boolean;
    remainingEligibleValue: number;
    reason?: string;
  }> {
    const config = await ReferralConfigService.getConfig();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return { qualificationReversed: false, referrerCreditReversed: false, recoveryCaseCreated: false, remainingEligibleValue: 0, reason: 'Order not found' };
    }

    const relationship = await prisma.referralRelationship.findFirst({
      where: { firstOrderId: orderId },
    });

    if (!relationship) {
      return { qualificationReversed: false, referrerCreditReversed: false, recoveryCaseCreated: false, remainingEligibleValue: 0, reason: 'No referral relationship linked to order' };
    }

    // Recalculate remaining delivered eligible value
    const grossEligible = ReferralQualificationService.calculateEligibleOrderValue(order);
    const refundDec = new Prisma.Decimal(refundAmount.toString());
    const remainingEligible = Prisma.Decimal.max(new Prisma.Decimal('0.00'), grossEligible.sub(refundDec));

    let qualificationReversed = false;
    let referrerCreditReversed = false;
    let recoveryCaseCreated = false;

    if (remainingEligible.lt(config.minimumFirstOrderValue)) {
      qualificationReversed = true;

      // Update relationship status
      await prisma.referralRelationship.update({
        where: { id: relationship.id },
        data: {
          status: 'REVERSED',
          rejectionReason: `Qualifying order partial refund reduced eligible value to ₹${remainingEligible.toString()} (below minimum ₹${config.minimumFirstOrderValue.toString()})`,
        },
      });

      // Find referrer credit if issued
      const referrerCredit = await prisma.referralCredit.findFirst({
        where: {
          referralRelationId: relationship.id,
          creditType: 'REFERRER',
          status: 'CREDITED',
        },
      });

      if (referrerCredit && referrerCredit.walletCreditLotId) {
        const lot = await prisma.walletCreditLot.findUnique({
          where: { id: referrerCredit.walletCreditLotId },
        });

        if (lot) {
          const remainingLotBal = new Prisma.Decimal(lot.remainingAmount.toString());
          const originalAmt = new Prisma.Decimal(referrerCredit.amount.toString());

          if (remainingLotBal.gte(originalAmt)) {
            // Unspent: debit remaining lot balance
            await prisma.walletCreditLot.update({
              where: { id: lot.id },
              data: { remainingAmount: new Prisma.Decimal('0.00'), status: 'EXPIRED' },
            });

            await prisma.referralCredit.update({
              where: { id: referrerCredit.id },
              data: { status: 'REVERSED' },
            });

            referrerCreditReversed = true;
          } else {
            // Partially or fully spent: reverse available balance and create recovery case
            const recoverable = remainingLotBal;
            const outstanding = originalAmt.sub(recoverable);

            if (recoverable.gt(0)) {
              await prisma.walletCreditLot.update({
                where: { id: lot.id },
                data: { remainingAmount: new Prisma.Decimal('0.00'), status: 'EXPIRED' },
              });
            }

            await prisma.referralCredit.update({
              where: { id: referrerCredit.id },
              data: { status: 'PARTIALLY_REVERSED' },
            });

            referrerCreditReversed = true;

            if (outstanding.gt(0)) {
              await prisma.referralRecoveryCase.create({
                data: {
                  referralRelationshipId: relationship.id,
                  referralCreditId: referrerCredit.id,
                  walletCreditLotId: lot.id,
                  recoveryType: 'CREDIT_ALREADY_SPENT',
                  status: 'OPEN',
                  originalAmount: originalAmt,
                  recoverableAmount: recoverable,
                  outstandingAmount: outstanding,
                  reasonCode: 'PARTIAL_REFUND_REFERRER_CREDIT_SPENT',
                },
              });
              recoveryCaseCreated = true;
            }
          }
        }
      }
    }

    return {
      relationshipId: relationship.id,
      qualificationReversed,
      referrerCreditReversed,
      recoveryCaseCreated,
      remainingEligibleValue: Number(remainingEligible),
    };
  }

  static async reverseNewUserCredit(relationshipId: string, reason: string): Promise<any> {
    const relationship = await prisma.referralRelationship.findUnique({
      where: { id: relationshipId },
    });

    if (!relationship) throw new Error('Referral relationship not found');

    const newUserCredit = await prisma.referralCredit.findFirst({
      where: {
        referralRelationId: relationshipId,
        creditType: 'NEW_USER',
        status: 'CREDITED',
      },
    });

    if (!newUserCredit || !newUserCredit.walletCreditLotId) {
      return { reversed: false, reason: 'No active new user credit found' };
    }

    const lot = await prisma.walletCreditLot.findUnique({
      where: { id: newUserCredit.walletCreditLotId },
    });

    if (lot) {
      await prisma.walletCreditLot.update({
        where: { id: lot.id },
        data: { remainingAmount: new Prisma.Decimal('0.00'), status: 'EXPIRED' },
      });

      await prisma.referralCredit.update({
        where: { id: newUserCredit.id },
        data: { status: 'REVERSED' },
      });
    }

    await prisma.referralRelationship.update({
      where: { id: relationshipId },
      data: {
        status: 'REVERSED',
        rejectionReason: reason,
      },
    });

    return { reversed: true };
  }
}
