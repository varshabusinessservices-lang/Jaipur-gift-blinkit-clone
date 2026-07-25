import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { env } from '../src/config/env';

describe('Backend API Foundation', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('NOT_FOUND');
    expect(res.body).toHaveProperty('requestId');
  });

  it('should return health status', async () => {
    const res = await request(app).get(`${env.API_PREFIX}/health`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('up');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should return system config (fallback if no DB)', async () => {
    const res = await request(app).get(`${env.API_PREFIX}/system/config`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.appName).toBeDefined();
  });
});
