import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { env } from '../src/config/env';
import { dashboardFilterSchema } from '../src/modules/dashboard/dashboard.schemas';
import { calculateDateBounds } from '../src/modules/dashboard/dashboard.repository';

describe('Batch 5: Super Admin Dashboard Foundation', () => {
  it('1. Unauthenticated dashboard access is rejected with 401', async () => {
    const res = await request(app).get(`${env.API_PREFIX}/admin/dashboard/overview`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('2. Unsupported filter values are rejected by schema', () => {
    const invalidRange = dashboardFilterSchema.safeParse({ range: 'invalid_range' });
    expect(invalidRange.success).toBe(false);
  });

  it('3. Custom date range exceeding 365 days is rejected by schema', () => {
    const customTooLong = dashboardFilterSchema.safeParse({
      range: 'custom',
      from: '2024-01-01',
      to: '2025-06-01', // > 500 days
    });
    expect(customTooLong.success).toBe(false);
  });

  it('4. Valid custom date range is accepted by schema', () => {
    const validCustom = dashboardFilterSchema.safeParse({
      range: 'custom',
      from: '2026-07-01',
      to: '2026-07-10',
    });
    expect(validCustom.success).toBe(true);
  });

  it('5. Asia/Kolkata day boundaries correctly calculate dates', () => {
    const bounds = calculateDateBounds({ range: '3d', timezone: 'Asia/Kolkata' });
    expect(bounds.from).toBeInstanceOf(Date);
    expect(bounds.to).toBeInstanceOf(Date);
    expect(bounds.daysDiff).toBeGreaterThanOrEqual(1);
  });
});
