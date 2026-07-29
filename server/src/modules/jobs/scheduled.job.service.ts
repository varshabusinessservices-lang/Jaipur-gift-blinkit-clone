import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface JobExecutionOptions {
  jobName: string;
  lockKey?: string;
  ttlMs?: number; // default 5 minutes (300,000ms)
  triggeredBy?: string;
  metadata?: any;
}

export interface JobExecutionResult<T = any> {
  runId: string;
  status: 'COMPLETED' | 'COMPLETED_WITH_ERRORS' | 'FAILED' | 'SKIPPED';
  result?: T;
  scannedCount: number;
  successCount: number;
  skippedCount: number;
  failedCount: number;
  errorSummary?: string;
  durationMs: number;
}

export class ScheduledJobService {
  /**
   * Acquire a distributed-safe job lock using ScheduledJobLock.
   */
  static async acquireLock(jobName: string, lockKey?: string, ttlMs: number = 300000, ownerId?: string): Promise<string | null> {
    const key = lockKey || `lock:${jobName}`;
    const owner = ownerId || `node-${process.pid}-${Date.now()}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs);

    try {
      // Clean up expired locks first
      await prisma.scheduledJobLock.deleteMany({
        where: {
          lockKey: key,
          expiresAt: { lte: now },
        },
      });

      const lock = await prisma.scheduledJobLock.create({
        data: {
          jobName,
          lockKey: key,
          ownerId: owner,
          acquiredAt: now,
          expiresAt,
          heartbeatAt: now,
          status: 'ACQUIRED',
        },
      });

      return lock.id;
    } catch (error) {
      // Lock exists and is active
      return null;
    }
  }

  /**
   * Send heartbeat to keep job lock alive.
   */
  static async heartbeat(lockId: string, extensionMs: number = 300000): Promise<boolean> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + extensionMs);
    try {
      await prisma.scheduledJobLock.update({
        where: { id: lockId },
        data: {
          heartbeatAt: now,
          expiresAt,
          status: 'RUNNING',
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Release a job lock.
   */
  static async releaseLock(lockId: string): Promise<void> {
    try {
      await prisma.scheduledJobLock.update({
        where: { id: lockId },
        data: {
          releasedAt: new Date(),
          status: 'RELEASED',
        },
      });
      await prisma.scheduledJobLock.delete({
        where: { id: lockId },
      }).catch(() => {});
    } catch {
      // Ignore if already deleted/released
    }
  }

  /**
   * Run a job wrapped in locking, run tracking, metrics and error reporting.
   */
  static async executeJob<T>(
    options: JobExecutionOptions,
    handler: (runId: string) => Promise<{
      scannedCount?: number;
      successCount?: number;
      skippedCount?: number;
      failedCount?: number;
      data?: T;
      errorSummary?: string;
    }>
  ): Promise<JobExecutionResult<T>> {
    const startTime = Date.now();
    const jobName = options.jobName;
    const lockKey = options.lockKey || `lock:${jobName}`;
    const ttlMs = options.ttlMs || 300000;

    const lockId = await this.acquireLock(jobName, lockKey, ttlMs);
    if (!lockId) {
      return {
        runId: '',
        status: 'SKIPPED',
        scannedCount: 0,
        successCount: 0,
        skippedCount: 0,
        failedCount: 0,
        errorSummary: `Lock ${lockKey} is currently held by another worker.`,
        durationMs: Date.now() - startTime,
      };
    }

    const jobRun = await prisma.scheduledJobRun.create({
      data: {
        jobName,
        status: 'RUNNING',
        startedAt: new Date(),
        triggeredBy: options.triggeredBy || 'SCHEDULED',
        metadataJson: options.metadata ? JSON.stringify(options.metadata) : null,
      },
    });

    try {
      const result = await handler(jobRun.id);
      const scannedCount = result.scannedCount || 0;
      const successCount = result.successCount || 0;
      const skippedCount = result.skippedCount || 0;
      const failedCount = result.failedCount || 0;

      const finalStatus = failedCount > 0 ? 'COMPLETED_WITH_ERRORS' : 'COMPLETED';

      await prisma.scheduledJobRun.update({
        where: { id: jobRun.id },
        data: {
          status: finalStatus,
          completedAt: new Date(),
          scannedCount,
          successCount,
          skippedCount,
          failedCount,
          errorSummary: result.errorSummary || null,
        },
      });

      await this.releaseLock(lockId);

      return {
        runId: jobRun.id,
        status: finalStatus,
        result: result.data,
        scannedCount,
        successCount,
        skippedCount,
        failedCount,
        errorSummary: result.errorSummary,
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      await prisma.scheduledJobRun.update({
        where: { id: jobRun.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          errorSummary: errorMsg,
        },
      });

      await this.releaseLock(lockId);

      return {
        runId: jobRun.id,
        status: 'FAILED',
        scannedCount: 0,
        successCount: 0,
        skippedCount: 0,
        failedCount: 1,
        errorSummary: errorMsg,
        durationMs: Date.now() - startTime,
      };
    }
  }
}
