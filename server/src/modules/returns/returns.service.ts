import { ReturnsRepository } from './returns.repository';
import { OrderRepository } from '../orders/order.repository';
import { ProductRepository } from '../products/products.repository';

export class ReturnsService {
  private repo = new ReturnsRepository();
  private orderRepo = new OrderRepository();
  private productRepo = new ProductRepository();

  private generateReturnNumber(): string {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `RR-2026-${randomNum}`;
  }

  private generateReplacementNumber(): string {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `REP-2026-${randomNum}`;
  }

  private generateRefundNumber(): string {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `REF-2026-${randomNum}`;
  }

  private generateReversePickupNumber(): string {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `RP-2026-${randomNum}`;
  }

  async createReturnRequest(data: {
    orderId: string;
    orderItemId?: string;
    customerId: string;
    reason: string;
    remarks?: string;
    images?: string[];
    videos?: string[];
    requestedQuantity?: number;
  }): Promise<any> {
    const order = await this.orderRepo.findOrderById(data.orderId);
    if (!order) throw new Error('Order not found');
    if (order.customerId !== data.customerId) throw new Error('Unauthorized order access');

    // Check delivery status
    if (order.status !== 'DELIVERED') {
      throw new Error('Returns can only be requested for delivered orders');
    }

    // Check product personalization rule
    let isPersonalised = false;
    let productType = 'NON_PERSONALISED';
    if (data.orderItemId && order.items) {
      const item = order.items.find((i: any) => i.id === data.orderItemId || i.productId === data.orderItemId);
      if (item && (item.personalisationJson || (item.productId && item.productId.includes('personalized')))) {
        isPersonalised = true;
        productType = 'PERSONALISED';
      }
    }

    const validSupportReasonsForPersonalised = [
      'Damaged',
      'Wrong Item',
      'Manufacturing Defect',
      'Printing Error',
      'Courier Damage',
      'Missing Item',
      'Quality Issue',
      'Admin Approved Exception',
    ];

    let eligibilityStatus = 'ELIGIBLE';
    let eligibilityReason = 'Meets return window and eligibility criteria';

    if (isPersonalised) {
      if (!validSupportReasonsForPersonalised.includes(data.reason)) {
        eligibilityStatus = 'NOT_ELIGIBLE';
        eligibilityReason = 'Personalised items are non-returnable unless damaged, defective, wrong, or admin approved.';
      }
    } else {
      // 24 hour return window for non-personalised
      if (order.deliveredAt) {
        const deliveredTime = new Date(order.deliveredAt).getTime();
        const now = Date.now();
        const diffHours = (now - deliveredTime) / (1000 * 60 * 60);
        if (diffHours > 24) {
          eligibilityStatus = 'NOT_ELIGIBLE';
          eligibilityReason = 'Return window of 24 hours has expired for non-personalised product.';
        }
      }
    }

    const returnNumber = this.generateReturnNumber();
    const returnRecord = await this.repo.createReturnRequest(
      {
        id: `ret-${Date.now()}`,
        returnNumber,
        orderId: data.orderId,
        orderItemId: data.orderItemId || null,
        customerId: data.customerId,
        reason: data.reason,
        remarks: data.remarks || null,
        imagesJson: JSON.stringify(data.images || []),
        videosJson: JSON.stringify(data.videos || []),
        requestedQuantity: data.requestedQuantity || 1,
        status: eligibilityStatus === 'ELIGIBLE' ? 'REQUESTED' : 'REJECTED',
        eligibilityStatus,
        eligibilityReason,
      },
      {
        id: `tl-${Date.now()}`,
        status: eligibilityStatus === 'ELIGIBLE' ? 'REQUESTED' : 'REJECTED',
        title: eligibilityStatus === 'ELIGIBLE' ? 'Return Request Created' : 'Return Request Rejected',
        description: eligibilityReason,
      }
    );

    // If eligible, automatically create a reverse pickup task
    if (eligibilityStatus === 'ELIGIBLE') {
      const pickupNumber = this.generateReversePickupNumber();
      await this.repo.createReversePickup({
        id: `rp-${Date.now()}`,
        taskNumber: pickupNumber,
        returnId: returnRecord.id,
        orderId: data.orderId,
        status: 'NEW',
        pickupAddress: order.addressSnapshotJson || 'Customer Delivery Address',
        storeAddress: 'Jaipur Gifting Main Store, C-Scheme, Jaipur',
      });
    }

    return returnRecord;
  }

  async listReturns(filter: { customerId?: string; status?: string } = {}): Promise<any[]> {
    return await this.repo.listReturns(filter);
  }

  async getReturnById(id: string): Promise<any> {
    const ret = await this.repo.findReturnById(id);
    if (!ret) throw new Error('Return request not found');
    return ret;
  }

  async adminUpdateReturnStatus(id: string, status: string, adminId?: string): Promise<any> {
    const ret = await this.getReturnById(id);
    const updated = await this.repo.updateReturn(
      id,
      { status },
      {
        id: `tl-${Date.now()}`,
        status,
        title: `Status Updated to ${status}`,
        description: `Admin updated return status to ${status}`,
      }
    );
    return updated;
  }

  async recordInspection(data: {
    returnId: string;
    result: string; // PASS, FAIL, PARTIAL
    condition?: string;
    damageType?: string;
    missingParts?: string;
    photos?: string[];
    inspectorNotes?: string;
    inspectorId?: string;
  }): Promise<any> {
    const ret = await this.getReturnById(data.returnId);
    const inspection = await this.repo.createInspection({
      returnId: data.returnId,
      result: data.result,
      condition: data.condition || null,
      damageType: data.damageType || null,
      missingParts: data.missingParts || null,
      photosJson: JSON.stringify(data.photos || []),
      inspectorNotes: data.inspectorNotes || null,
      inspectorId: data.inspectorId || null,
    });

    const newStatus = data.result === 'PASS' ? 'INSPECTION_PASSED' : 'INSPECTION_FAILED';
    await this.repo.updateReturn(
      data.returnId,
      { status: newStatus },
      {
        id: `tl-${Date.now()}`,
        status: newStatus,
        title: `Inspection ${data.result}`,
        description: data.inspectorNotes || `Inspection completed with result: ${data.result}`,
      }
    );

    return inspection;
  }

  async createReplacement(data: { returnId: string; adminId?: string }): Promise<any> {
    const ret = await this.getReturnById(data.returnId);
    if (ret.status !== 'INSPECTION_PASSED') {
      throw new Error('Replacement can only be issued for inspected and passed returns');
    }

    const replacementNumber = this.generateReplacementNumber();
    const replacement = await this.repo.createReplacement({
      id: `rep-${Date.now()}`,
      replacementNumber,
      returnId: data.returnId,
      originalOrderId: ret.orderId,
      status: 'REPLACEMENT_INITIATED',
    });

    await this.repo.updateReturn(
      data.returnId,
      { status: 'REPLACEMENT_INITIATED' },
      {
        id: `tl-${Date.now()}`,
        status: 'REPLACEMENT_INITIATED',
        title: 'Replacement Order Initiated',
        description: `Replacement ${replacementNumber} created and linked to original order`,
      }
    );

    return replacement;
  }

  async processRefund(data: {
    orderId: string;
    returnId?: string;
    amount: number;
    mode: string; // ORIGINAL_PAYMENT, WALLET, RAZORPAY, ADMIN_OVERRIDE
    reference?: string;
    createdBy?: string;
    approvedBy?: string;
  }): Promise<any> {
    // Check if order already refunded fully or for this return
    const existingRefunds = await this.repo.listRefunds({ orderId: data.orderId });
    const completedRefundTotal = existingRefunds
      .filter((r: any) => r.status === 'COMPLETED')
      .reduce((sum: number, r: any) => sum + r.amount, 0);

    const order = await this.orderRepo.findOrderById(data.orderId);
    if (!order) throw new Error('Order not found');

    if (completedRefundTotal + data.amount > order.totalAmount) {
      throw new Error('Refund amount exceeds order total amount. Never refund twice.');
    }

    const refundNumber = this.generateRefundNumber();
    const refund = await this.repo.createRefundLedger({
      id: `ref-${Date.now()}`,
      refundNumber,
      orderId: data.orderId,
      returnId: data.returnId || null,
      amount: data.amount,
      mode: data.mode,
      reference: data.reference || `ref-mock-${Date.now()}`,
      status: 'COMPLETED',
      createdBy: data.createdBy || 'Admin',
      approvedBy: data.approvedBy || 'Finance Manager',
    });

    if (data.returnId) {
      await this.repo.updateReturn(
        data.returnId,
        { status: 'REFUND_COMPLETED' },
        {
          id: `tl-${Date.now()}`,
          status: 'REFUND_COMPLETED',
          title: 'Refund Completed',
          description: `Refund of INR ${data.amount} processed via ${data.mode}`,
        }
      );
    }

    return refund;
  }

  async listRefunds(filter: { orderId?: string } = {}): Promise<any[]> {
    return await this.repo.listRefunds(filter);
  }
}
