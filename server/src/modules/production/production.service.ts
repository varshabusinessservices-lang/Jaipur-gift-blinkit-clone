import crypto from 'crypto';
import { ProductionRepository } from './production.repository';
import { OrderRepository } from '../orders/order.repository';
import { ArtworkReviewParams, PrintAssignmentParams, QualityCheckParams, PackingParams } from './production.types';

export class ProductionService {
  private repo = new ProductionRepository();
  private orderRepo = new OrderRepository();

  /**
   * Initialize a Production Job & Items from an Order that reached READY_FOR_PRODUCTION
   */
  async createProductionJobForOrder(orderId: string): Promise<any> {
    // Check if job already exists
    const existing = await this.repo.findJobByOrderId(orderId);
    if (existing) return existing;

    const order = await this.orderRepo.findOrderById(orderId);
    if (!order) {
      throw new Error('Order not found for production initialization');
    }

    const jobNumber = `PJ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const jobData = {
      id: crypto.randomUUID(),
      jobNumber,
      orderId,
      customerId: order.customerId,
      priority: order.deliveryCharge > 50 ? 'URGENT' : 'NORMAL',
      status: 'ARTWORK_PENDING' as any,
      assignedStore: order.storeId || 'store-jaipur-main',
      notes: 'Initialized from verified order',
    };

    const itemsData = (order.items || []).map((orderItem: any) => ({
      id: crypto.randomUUID(),
      jobId: '', // populated in repository
      orderItemId: orderItem.id,
      productId: orderItem.productId,
      variationId: orderItem.variationId || null,
      nameSnapshot: orderItem.nameSnapshot,
      imageSnapshot: orderItem.imageSnapshot,
      quantity: orderItem.quantity,
      artworkStatus: 'PENDING',
      printStatus: 'PENDING',
      qcStatus: 'PENDING',
      packingStatus: 'PENDING',
      status: 'ARTWORK_PENDING' as any,
      timestampsJson: JSON.stringify({ initializedAt: new Date().toISOString() }),
    }));

    const timelineData = {
      id: crypto.randomUUID(),
      status: 'ARTWORK_PENDING',
      title: 'Production Job Created',
      description: `Job ${jobNumber} created for order ${order.orderNumber}. Awaiting artwork review.`,
      metadataJson: JSON.stringify({ jobNumber }),
    };

    const createdJob = await this.repo.createJobWithItems(jobData, itemsData, timelineData);
    return createdJob;
  }

  async reviewArtwork(params: ArtworkReviewParams): Promise<any> {
    const { itemId, action, notes, staffName = 'Ramesh Designer' } = params;
    const item = await this.repo.findItemById(itemId);
    if (!item) throw new Error('Production item not found');

    let newArtworkStatus = 'PENDING';
    let newItemStatus = 'ARTWORK_PENDING';

    if (action === 'APPROVE') {
      newArtworkStatus = 'APPROVED';
      newItemStatus = 'PRINT_QUEUE';
    } else if (action === 'REJECT') {
      newArtworkStatus = 'REJECTED';
      newItemStatus = 'CANCELLED';
    } else if (action === 'NEEDS_CORRECTION') {
      newArtworkStatus = 'NEEDS_CORRECTION';
      newItemStatus = 'ARTWORK_PENDING';
    }

    const updatedItem = await this.repo.updateItem(itemId, {
      artworkStatus: newArtworkStatus,
      status: newItemStatus as any,
      printStatus: action === 'APPROVE' ? 'QUEUED' : 'PENDING',
    });

    await this.repo.addTimeline({
      jobId: item.jobId,
      itemId,
      status: newItemStatus,
      title: `Artwork ${action}`,
      description: notes || `Artwork review status: ${newArtworkStatus} by ${staffName}`,
      metadataJson: JSON.stringify({ staffName, action }),
    });

    // Check if all items in job are ready for print queue, update job status
    const job = await this.repo.findJobById(item.jobId);
    if (job && job.items.every((i: any) => i.artworkStatus === 'APPROVED')) {
      await this.repo.updateJob(job.id, { status: 'PRINT_QUEUE' });
    }

    return updatedItem;
  }

  async assignPrintAndStart(params: PrintAssignmentParams): Promise<any> {
    const { itemId, machineId, station = 'Station-1', staffName = 'Sunil Operator' } = params;
    const item = await this.repo.findItemById(itemId);
    if (!item) throw new Error('Production item not found');

    const updatedItem = await this.repo.updateItem(itemId, {
      machineId,
      station,
      assignedStaff: staffName,
      printStatus: 'PRINTING',
      status: 'PRINTING' as any,
    });

    await this.repo.addTimeline({
      jobId: item.jobId,
      itemId,
      status: 'PRINTING',
      title: 'Printing Started',
      description: `Printing started on machine ${machineId} by ${staffName}`,
      metadataJson: JSON.stringify({ machineId, station, staffName }),
    });

    await this.repo.updateJob(item.jobId, { status: 'PRINTING' });
    return updatedItem;
  }

  async completePrinting(itemId: string, staffName = 'Sunil Operator'): Promise<any> {
    const item = await this.repo.findItemById(itemId);
    if (!item) throw new Error('Production item not found');

    const updatedItem = await this.repo.updateItem(itemId, {
      printStatus: 'PRINTED',
      status: 'QC_PENDING' as any,
      qcStatus: 'PENDING',
    });

    await this.repo.addTimeline({
      jobId: item.jobId,
      itemId,
      status: 'QC_PENDING',
      title: 'Printing Completed & QC Pending',
      description: `Item printed successfully by ${staffName}. Moved to Quality Check.`,
      metadataJson: JSON.stringify({ staffName }),
    });

    await this.repo.updateJob(item.jobId, { status: 'QC_PENDING' });
    return updatedItem;
  }

  async performQualityCheck(params: QualityCheckParams): Promise<any> {
    const { itemId, result, notes, staffName = 'Vikram Supervisor' } = params;
    const item = await this.repo.findItemById(itemId);
    if (!item) throw new Error('Production item not found');

    let qcStatus = 'PENDING';
    let itemStatus = 'QC_PENDING';

    if (result === 'PASS') {
      qcStatus = 'PASSED';
      itemStatus = 'PACKING_QUEUE';
    } else if (result === 'FAIL' || result === 'NEEDS_REPRINT') {
      qcStatus = 'FAILED';
      itemStatus = 'REPRINT_REQUIRED';
    }

    const updatedItem = await this.repo.updateItem(itemId, {
      qcStatus,
      status: itemStatus as any,
    });

    await this.repo.addTimeline({
      jobId: item.jobId,
      itemId,
      status: itemStatus,
      title: `Quality Check ${result}`,
      description: notes || `QC result: ${qcStatus} checked by ${staffName}`,
      metadataJson: JSON.stringify({ staffName, result }),
    });

    return updatedItem;
  }

  async handleReprint(itemId: string, reason: string, staffName = 'Vikram Supervisor'): Promise<any> {
    const item = await this.repo.findItemById(itemId);
    if (!item) throw new Error('Production item not found');

    const updatedItem = await this.repo.updateItem(itemId, {
      qcStatus: 'PENDING',
      printStatus: 'QUEUED',
      status: 'PRINT_QUEUE' as any,
    });

    await this.repo.addTimeline({
      jobId: item.jobId,
      itemId,
      status: 'PRINT_QUEUE',
      title: 'Reprint Request Generated',
      description: `Reprint initiated due to: ${reason}. Author: ${staffName}`,
      metadataJson: JSON.stringify({ reason, staffName }),
    });

    return updatedItem;
  }

  async handlePacking(params: PackingParams): Promise<any> {
    const { itemId, action, packageNotes, staffName = 'Anita Packer' } = params;
    const item = await this.repo.findItemById(itemId);
    if (!item) throw new Error('Production item not found');

    const packingStatus = action === 'START' ? 'PACKING' : 'PACKED';
    const itemStatus = action === 'START' ? 'PACKING' : 'READY_FOR_DISPATCH';

    const updatedItem = await this.repo.updateItem(itemId, {
      packingStatus,
      status: itemStatus as any,
    });

    await this.repo.addTimeline({
      jobId: item.jobId,
      itemId,
      status: itemStatus,
      title: action === 'START' ? 'Packing Started' : 'Packing Completed',
      description: packageNotes || `Packing ${action === 'START' ? 'started' : 'completed'} by ${staffName}`,
      metadataJson: JSON.stringify({ staffName, action }),
    });

    // Check if ALL items in job are READY_FOR_DISPATCH
    const job = await this.repo.findJobById(item.jobId);
    if (job && job.items.every((i: any) => i.status === 'READY_FOR_DISPATCH')) {
      await this.repo.updateJob(job.id, {
        status: 'READY_FOR_DISPATCH',
        actualCompletion: new Date(),
      });

      // Automatically update parent Order status to READY_FOR_DISPATCH
      await this.orderRepo.updateOrderStatus(job.orderId, 'READY_FOR_DISPATCH');
      await this.orderRepo.addTimelineEntry({
        orderId: job.orderId,
        status: 'READY_FOR_DISPATCH',
        title: 'Ready For Dispatch',
        description: 'All production items successfully manufactured, QC passed, and packed.',
      });
    }

    return updatedItem;
  }

  async getJobById(jobId: string): Promise<any> {
    const job = await this.repo.findJobById(jobId);
    if (!job) throw new Error('Production job not found');
    return job;
  }

  async getJobByOrderId(orderId: string): Promise<any> {
    return await this.repo.findJobByOrderId(orderId);
  }

  async listJobs(filters?: { status?: string; storeId?: string; priority?: string }): Promise<any[]> {
    return await this.repo.findAllJobs(filters);
  }

  async getMachines(): Promise<any[]> {
    return await this.repo.getMachines();
  }

  async getStaff(): Promise<any[]> {
    return await this.repo.getStaff();
  }

  /**
   * Translate internal status to customer-friendly simplified visibility
   */
  getCustomerStatusView(internalStatus: string): { step: number; label: string; description: string } {
    switch (internalStatus) {
      case 'NEW':
      case 'ARTWORK_PENDING':
      case 'ARTWORK_APPROVED':
        return { step: 1, label: 'Order Confirmed', description: 'Your order is confirmed and artwork is being prepared.' };
      case 'PRINT_QUEUE':
      case 'PRINTING':
      case 'PRINTED':
        return { step: 2, label: 'Preparing Your Order & Printing', description: 'Your items are currently in manufacturing and printing.' };
      case 'QC_PENDING':
      case 'QC_PASSED':
      case 'QC_FAILED':
      case 'REPRINT_REQUIRED':
        return { step: 3, label: 'Quality Check', description: 'Our supervisors are performing rigorous quality inspection.' };
      case 'PACKING_QUEUE':
      case 'PACKING':
        return { step: 4, label: 'Packing', description: 'Your items are being securely gift-wrapped and packed.' };
      case 'READY_FOR_DISPATCH':
        return { step: 5, label: 'Ready For Dispatch', description: 'Package is packed and ready for lightning-fast dispatch.' };
      default:
        return { step: 1, label: 'Processing', description: 'Your order is being processed.' };
    }
  }
}
