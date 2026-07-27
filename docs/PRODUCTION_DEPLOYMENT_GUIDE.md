# Production Deployment Guide

## Prerequisites
- Node.js 18+ / 20+
- PostgreSQL database (Neon, Supabase, Cloud SQL, or self-hosted)
- Environment variables configured via `.env.example`

## Build and Start Commands
```bash
npm install
npm run build
npm start
```

## Environment Configuration
Ensure all production secrets are securely provided in production environments:
- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV=production`
- `PORT=3000`
