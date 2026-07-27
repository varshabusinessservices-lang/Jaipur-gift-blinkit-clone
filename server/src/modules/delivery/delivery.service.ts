import crypto from 'crypto';
import { DeliveryRepository } from './delivery.repository';
import { OrderRepository } from '../orders/order.repository';
import { CreateDeliveryTaskParams, AssignRiderParams, VerifyOtpParams, ProofOfDeliveryParams, DeliveryExceptionParams } from './delivery.types';

export class DeliveryService {
  private repo = new DeliveryRepository();
  private orderRepo = new OrderRepository();

  async createDeliveryTaskForOrder(params: CreateDeliveryTaskParams): Promise<any> {
    const { orderId, storeId = 'store-jaipur-main', deliveryPartner = 'OWN_RIDER', deliveryMode = 'NEXT_DAY', priority = 'NORMAL', pickupAddress, deliveryAddress, estimatedDistance = 3.2, estimatedDuration = 20 } = params;

    const existing = await this.repo.findTaskByOrderId(orderId);
    if (existing) return existing;

    const order = await this.orderRepo.findOrderById(orderId);
    if (!order) {
      throw new Error('Order not found for delivery task creation');
    }

    const taskNumber = `DT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const taskData = {
      id: crypto.randomUUID(),
      taskNumber,
      orderId,
      storeId,
      deliveryPartner,
      deliveryMode,
      priority,
      status: 'NEW' as any,
      pickupAddress: pickupAddress || 'Jaipur Gifting Central Hub, C-Scheme, Jaipur',
      deliveryAddress: deliveryAddress || order.shippingAddressJson || 'Jaipur Customer Address',
      estimatedDistance,
      estimatedDuration,
      otp,
      otpExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
    };

    const timelineData = {
      id: crypto.randomUUID(),
      status: 'NEW',
      title: 'Delivery Task Created',
      description: `Delivery task ${taskNumber} created for order ${order.orderNumber}.`,
      metadataJson: JSON.stringify({ taskNumber }),
    };

    const task = await this.repo.createTask(taskData, timelineData);
    return task;
  }

  async assignRider(params: AssignRiderParams): Promise<any> {
    const { taskId, riderId } = params;
    const task = await this.repo.findTaskById(taskId);
    if (!task) throw new Error('Delivery task not found');

    const rider = await this.repo.findRiderById(riderId);
    if (!rider) throw new Error('Rider not found');

    const updated = await this.repo.updateTask(taskId, {
      riderId,
      status: 'ASSIGNED',
      assignedAt: new Date(),
    });

    await this.repo.addTimeline({
      taskId,
      status: 'ASSIGNED',
      title: 'Rider Assigned',
      description: `Task assigned to rider ${rider.name} (${rider.phone})`,
      metadataJson: JSON.stringify({ riderId, riderName: rider.name }),
    });

    return updated;
  }

  async riderAcceptTask(taskId: string): Promise<any> {
    const task = await this.repo.findTaskById(taskId);
    if (!task) throw new Error('Delivery task not found');

    const updated = await this.repo.updateTask(taskId, {
      status: 'ACCEPTED',
    });

    await this.repo.addTimeline({
      taskId,
      status: 'ACCEPTED',
      title: 'Rider Accepted Task',
      description: 'Rider has accepted the delivery task and is heading to store.',
    });

    return updated;
  }

  async markPickedUp(taskId: string): Promise<any> {
    const task = await this.repo.findTaskById(taskId);
    if (!task) throw new Error('Delivery task not found');

    const updated = await this.repo.updateTask(taskId, {
      status: 'PICKED_UP',
      pickedUpAt: new Date(),
    });

    await this.repo.addTimeline({
      taskId,
      status: 'PICKED_UP',
      title: 'Order Picked Up',
      description: 'Package picked up from store, out for delivery.',
    });

    await this.orderRepo.updateOrderStatus(task.orderId, 'OUT_FOR_DELIVERY');
    await this.orderRepo.addTimelineEntry({
      orderId: task.orderId,
      status: 'OUT_FOR_DELIVERY',
      title: 'Out For Delivery',
      description: 'Your package is out for delivery with our delivery partner.',
    });

    return updated;
  }

  async setOutForDelivery(taskId: string): Promise<any> {
    const task = await this.repo.findTaskById(taskId);
    if (!task) throw new Error('Delivery task not found');

    const updated = await this.repo.updateTask(taskId, {
      status: 'OUT_FOR_DELIVERY',
    });

    await this.repo.addTimeline({
      taskId,
      status: 'OUT_FOR_DELIVERY',
      title: 'Out For Delivery',
      description: 'Rider is on the way to the delivery address.',
    });

    return updated;
  }

  async markArrived(taskId: string): Promise<any> {
    const task = await this.repo.findTaskById(taskId);
    if (!task) throw new Error('Delivery task not found');

    const updated = await this.repo.updateTask(taskId, {
      status: 'ARRIVED',
    });

    await this.repo.addTimeline({
      taskId,
      status: 'ARRIVED',
      title: 'Rider Arrived',
      description: 'Rider has arrived at the delivery location.',
    });

    return updated;
  }

  async verifyOtpAndDeliver(params: VerifyOtpParams): Promise<any> {
    const { taskId, otp } = params;
    const task = await this.repo.findTaskById(taskId);
    if (!task) throw new Error('Delivery task not found');

    if (task.otp && task.otp !== otp) {
      throw new Error('Invalid OTP provided');
    }

    const updated = await this.repo.updateTask(taskId, {
      status: 'DELIVERED',
      deliveredAt: new Date(),
    });

    await this.repo.addTimeline({
      taskId,
      status: 'DELIVERED',
      title: 'Delivered Successfully',
      description: 'OTP verified successfully and order delivered to recipient.',
    });

    await this.orderRepo.updateOrderStatus(task.orderId, 'DELIVERED');
    await this.orderRepo.addTimelineEntry({
      orderId: task.orderId,
      status: 'DELIVERED',
      title: 'Delivered',
      description: 'Order successfully delivered. Thank you for shopping with Jaipur Gifting!',
    });

    return updated;
  }

  async recordProofOfDelivery(params: ProofOfDeliveryParams): Promise<any> {
    const { taskId, photoUrl, recipientName, recipientRelation, signature, notes } = params;
    const task = await this.repo.findTaskById(taskId);
    if (!task) throw new Error('Delivery task not found');

    const proofJson = JSON.stringify({
      photoUrl: photoUrl || '',
      recipientName,
      recipientRelation: recipientRelation || 'Self',
      signature: signature || '',
      notes: notes || '',
      capturedAt: new Date().toISOString(),
    });

    const updated = await this.repo.updateTask(taskId, {
      proofOfDeliveryJson: proofJson,
      status: 'DELIVERED',
      deliveredAt: new Date(),
    });

    await this.repo.addTimeline({
      taskId,
      status: 'DELIVERED',
      title: 'Proof of Delivery Captured & Delivered',
      description: `Delivered to ${recipientName} (${recipientRelation || 'Self'}).`,
      metadataJson: proofJson,
    });

    await this.orderRepo.updateOrderStatus(task.orderId, 'DELIVERED');
    await this.orderRepo.addTimelineEntry({
      orderId: task.orderId,
      status: 'DELIVERED',
      title: 'Delivered',
      description: `Successfully delivered to ${recipientName}.`,
    });

    return updated;
  }

  async reportException(params: DeliveryExceptionParams): Promise<any> {
    const { taskId, reason, notes } = params;
    const task = await this.repo.findTaskById(taskId);
    if (!task) throw new Error('Delivery task not found');

    const exceptionJson = JSON.stringify({
      reason,
      notes: notes || '',
      reportedAt: new Date().toISOString(),
    });

    const updated = await this.repo.updateTask(taskId, {
      status: 'FAILED',
      exceptionJson,
    });

    await this.repo.addTimeline({
      taskId,
      status: 'FAILED',
      title: 'Delivery Exception / Failure',
      description: `Reason: ${reason}. Notes: ${notes || 'None'}`,
      metadataJson: exceptionJson,
    });

    return updated;
  }

  async getTaskById(taskId: string): Promise<any> {
    const task = await this.repo.findTaskById(taskId);
    if (!task) throw new Error('Delivery task not found');
    return task;
  }

  async listTasks(filters?: { status?: string; riderId?: string; storeId?: string }): Promise<any[]> {
    return await this.repo.findAllTasks(filters);
  }

  async getRiders(storeId?: string): Promise<any[]> {
    return await this.repo.getRiders(storeId);
  }

  getCustomerTrackingView(orderStatus: string, deliveryTask?: any): { step: number; label: string; description: string; otp?: string } {
    switch (orderStatus) {
      case 'READY_FOR_DISPATCH':
        return { step: 3, label: 'Ready For Dispatch', description: 'Your package is packed and awaiting dispatch pickup.' };
      case 'OUT_FOR_DELIVERY':
        return { step: 4, label: 'Out For Delivery', description: 'Our delivery rider is on the way to your location.', otp: deliveryTask?.otp };
      case 'DELIVERED':
        return { step: 5, label: 'Delivered', description: 'Order successfully delivered!' };
      default:
        return { step: 1, label: 'Preparing', description: 'Your order is being processed.' };
    }
  }
}
