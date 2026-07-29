import crypto from 'crypto';
import { prisma } from '../../database/prisma';
import { ReferralConfigService } from './referral.config.service';

const ALLOWED_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // Excludes 0, 1, O, I, L

export class ReferralCodeService {
  static normaliseCode(code: string): string {
    if (!code) return '';
    return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  static generateRandomCode(length: number = 5, prefix: string = 'JPR'): string {
    let result = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      result += ALLOWED_CHARS[bytes[i] % ALLOWED_CHARS.length];
    }
    return prefix ? `${prefix}${result}` : result;
  }

  static async generateForCustomer(customerId: string, customPrefix?: string): Promise<any> {
    const config = await ReferralConfigService.getConfig();
    const prefix = customPrefix ?? config.referralCodePrefix ?? 'JPR';

    let attempts = 0;
    while (attempts < 10) {
      attempts++;
      const candidateCode = this.generateRandomCode(5, prefix);
      const normalised = this.normaliseCode(candidateCode);

      const existing = await prisma.referralCode.findUnique({
        where: { normalisedCode: normalised },
      });

      if (!existing) {
        // Deactivate existing primary codes for customer if creating new primary
        await prisma.referralCode.updateMany({
          where: { customerId, isPrimary: true },
          data: { isPrimary: false },
        });

        const record = await prisma.referralCode.create({
          data: {
            customerId,
            code: candidateCode,
            normalisedCode: normalised,
            status: 'ACTIVE',
            isPrimary: true,
          },
        });

        return record;
      }
    }

    throw new Error('Failed to generate unique referral code after 10 attempts');
  }

  static async getOrCreatePrimaryCode(customerId: string): Promise<any> {
    let codeRecord = await prisma.referralCode.findFirst({
      where: { customerId, isPrimary: true, status: 'ACTIVE' },
    });

    if (!codeRecord) {
      // Check if any active code exists
      codeRecord = await prisma.referralCode.findFirst({
        where: { customerId, status: 'ACTIVE' },
      });

      if (codeRecord) {
        // Mark as primary
        codeRecord = await prisma.referralCode.update({
          where: { id: codeRecord.id },
          data: { isPrimary: true },
        });
      } else {
        codeRecord = await this.generateForCustomer(customerId);
      }
    }

    return codeRecord;
  }

  static async resolveCode(rawCode: string): Promise<{
    valid: boolean;
    referralCode?: any;
    referrer?: any;
    reason?: string;
  }> {
    const normalised = this.normaliseCode(rawCode);
    if (!normalised) {
      return { valid: false, reason: 'Referral code cannot be empty' };
    }

    const codeRecord = await prisma.referralCode.findUnique({
      where: { normalisedCode: normalised },
    });

    if (!codeRecord) {
      return { valid: false, reason: 'Invalid referral code' };
    }

    if (codeRecord.status !== 'ACTIVE') {
      return { valid: false, reason: `Referral code is ${codeRecord.status.toLowerCase()}` };
    }

    if (codeRecord.validUntil && codeRecord.validUntil < new Date()) {
      return { valid: false, reason: 'Referral code has expired' };
    }

    if (codeRecord.maximumUses && codeRecord.usageCount >= codeRecord.maximumUses) {
      return { valid: false, reason: 'Referral code usage limit reached' };
    }

    const referrer = await prisma.customer.findUnique({
      where: { id: codeRecord.customerId },
      select: { id: true, name: true, mobile: true, email: true, status: true },
    });

    if (!referrer || referrer.status !== 'ACTIVE') {
      return { valid: false, reason: 'Referrer account is not active' };
    }

    return {
      valid: true,
      referralCode: codeRecord,
      referrer,
    };
  }

  static createShareLink(code: string, channel?: string, utmParams?: Record<string, string>): {
    shareUrl: string;
    shareMessage: string;
  } {
    const baseUrl = process.env.FRONTEND_URL || 'https://jaipurgifting.com';
    let shareUrl = `${baseUrl}/r/${code}`;

    const params = new URLSearchParams();
    if (channel) params.set('utm_source', channel);
    if (utmParams) {
      Object.entries(utmParams).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
    }

    const queryString = params.toString();
    if (queryString) {
      shareUrl += `?${queryString}`;
    }

    const shareMessage = `Use my referral code ${code} to get ₹100 off on your first order of ₹299+ at Jaipur Gifting! Sign up here: ${shareUrl}`;

    return { shareUrl, shareMessage };
  }

  static async regenerateCode(customerId: string): Promise<any> {
    return await this.generateForCustomer(customerId);
  }
}
