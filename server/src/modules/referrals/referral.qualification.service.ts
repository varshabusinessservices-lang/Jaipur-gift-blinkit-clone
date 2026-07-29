import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ReferralConfigService } from './referral.config.service';
import { ReferralCreditService } from './referral.credit.service';

export class ReferralQualificationService {
  static calculateEligibleOrderValue(order: any): Prisma.Decimal {
    if (!order) return new Prisma.Decimal('0.00');

    let total = new Prisma.Decimal('0.00');

    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items) {
        if (item.status !== 'CANCELLED' && item.status !== 'REFUNDED') {
          const qty = new Prisma.Decimal((item.quantity || 1).toString());
          const price = new Prisma.Decimal((item.unitPrice || item.price || 0).toString());
          total = total.plus(qty.times(price));
        }
      }
    } else if (order.subtotal) {
      total = new Prisma.Decimal(order.subtotal.toString());
    } else if (order.payableAmount) {
      total = new Prisma.Decimal(order.payableAmount.toString());
    }

    return total;
  }

  static async isFirstEligibleOrder(orderId: string, customerId: string): Promise<boolean> {
    const config = await ReferralConfigService.getConfig();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.customerId !== customerId) {
      return false;
    }

    // Check minimum eligible order value
    const eligibleValue = this.calculateEligibleOrderValue(order);
    if (eligibleValue.lt(config.minimumFirstOrderValue)) {
      return false;
    }

    // Check if customer had any prior delivered/paid merchandise orders
    const priorOrders = await prisma.order.count({
      where: {
        customerId,
        id: { not: orderId },
        status: { in: ['DELIVERED', 'OUT_FOR_DELIVERY', 'READY_FOR_DISPATCH', 'PAID', 'IN_PRODUCTION', 'READY_FOR_PRODUCTION'] },
      },
    });

    return priorOrders === 0;
  }

  static async handleOrderPlaced(order: any): Promise<void> {
    if (!order || !order.customerId) return;

    const relationship = await prisma.referralRelationship.findUnique({
      where: { newCustomerId: order.customerId },
    });

    if (!relationship) return;
    if (['REJECTED', 'CANCELLED', 'REWARDED', 'COOLING_PERIOD', 'QUALIFIED'].includes(relationship.status)) {
      return;
    }

    const isEligible = await this.isFirstEligibleOrder(order.id, order.customerId);
    if (!isEligible) return;

    await prisma.referralRelationship.update({
      where: { id: relationship.id },
      data: {
        firstOrderId: order.id,
        firstOrderPlacedAt: new Date(),
        status: 'FIRST_ORDER_PLACED',
      },
    });
  }

  static async handleOrderPaid(order: any): Promise<void> {
    if (!order || !order.customerId) return;

    const relationship = await prisma.referralRelationship.findUnique({
      where: { newCustomerId: order.customerId },
    });

    if (!relationship) return;
    if (['REJECTED', 'CANCELLED', 'REWARDED', 'COOLING_PERIOD', 'QUALIFIED'].includes(relationship.status)) {
      return;
    }

    const isEligible = await this.isFirstEligibleOrder(order.id, order.customerId);
    if (!isEligible) return;

    await prisma.referralRelationship.update({
      where: { id: relationship.id },
      data: {
        firstOrderId: order.id,
        firstOrderPaidAt: new Date(),
        status: 'FIRST_ORDER_PAID',
      },
    });
  }

  static async handleOrderDelivered(order: any): Promise<void> {
    if (!order || !order.customerId) return;

    const relationship = await prisma.referralRelationship.findUnique({
      where: { newCustomerId: order.customerId },
    });

    if (!relationship) return;
    if (['REJECTED', 'CANCELLED', 'REWARDED', 'COOLING_PERIOD', 'QUALIFIED'].includes(relationship.status)) {
      return;
    }

    const isEligible = await this.isFirstEligibleOrder(order.id, order.customerId);
    if (!isEligible) return;

    const config = await ReferralConfigService.getConfig();
    const coolingEndsAt = new Date(Date.now() + config.referralCoolingDays * 24 * 60 * 60 * 1000);

    await prisma.referralRelationship.update({
      where: { id: relationship.id },
      data: {
        firstOrderId: order.id,
        firstOrderDeliveredAt: new Date(),
        coolingEndsAt,
        status: 'COOLING_PERIOD',
      },
    });
  }

  static async qualifyReferral(relationshipId: string): Promise<any> {
    const relationship = await prisma.referralRelationship.findUnique({
      where: { id: relationshipId },
    });

    if (!relationship) throw new Error('Referral relationship not found');

    if (relationship.status === 'REWARDED') {
      return relationship;
    }

    if (relationship.status !== 'COOLING_PERIOD' && relationship.status !== 'QUALIFIED') {
      throw new Error(`Referral relationship in state ${relationship.status} cannot be qualified`);
    }

    // Verify first order still valid and delivered
    if (relationship.firstOrderId) {
      const order = await prisma.order.findUnique({
        where: { id: relationship.firstOrderId },
        include: { items: true },
      });

      if (!order || order.status === 'CANCELLED' || order.status === 'REFUNDED') {
        await prisma.referralRelationship.update({
          where: { id: relationshipId },
          data: { status: 'CANCELLED', rejectionReason: 'First order was cancelled or refunded' },
        });
        throw new Error('Qualifying order is no longer valid');
      }

      const eligibleValue = this.calculateEligibleOrderValue(order);
      const config = await ReferralConfigService.getConfig();
      if (eligibleValue.lt(config.minimumFirstOrderValue)) {
        await prisma.referralRelationship.update({
          where: { id: relationshipId },
          data: { status: 'CANCELLED', rejectionReason: 'Order eligible value below minimum' },
        });
        throw new Error('Qualifying order value falls below minimum required threshold');
      }
    }

    await prisma.referralRelationship.update({
      where: { id: relationshipId },
      data: {
        status: 'QUALIFIED',
        qualifiedAt: new Date(),
      },
    });

    // Issue referrer reward
    return await ReferralCreditService.issueReferrerCredit(relationshipId);
  }
}
