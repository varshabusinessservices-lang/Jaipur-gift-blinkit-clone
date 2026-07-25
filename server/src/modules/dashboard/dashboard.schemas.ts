import { z } from 'zod';

export const dashboardFilterSchema = z.object({
  range: z.enum(['today', '3d', '7d', '15d', '30d', 'custom']).default('today'),
  from: z.string().optional(),
  to: z.string().optional(),
  timezone: z.string().default('Asia/Kolkata'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  metric: z.enum(['units', 'revenue', 'orders']).optional().default('revenue'),
}).refine((data) => {
  if (data.range === 'custom') {
    if (!data.from || !data.to) return false;
    const fromDate = new Date(data.from);
    const toDate = new Date(data.to);
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return false;
    if (fromDate > toDate) return false;
    const diffDays = Math.ceil(Math.abs(toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 365) return false;
  }
  return true;
}, {
  message: 'Invalid date range. Custom range requires valid "from" and "to" parameters within a maximum of 365 days.',
  path: ['from'],
});

export type DashboardFilterInput = z.infer<typeof dashboardFilterSchema>;
