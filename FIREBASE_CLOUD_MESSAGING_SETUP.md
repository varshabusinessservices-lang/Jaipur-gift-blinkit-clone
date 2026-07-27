# Firebase Cloud Messaging (FCM) Setup Guide

This guide details how Firebase Cloud Messaging is integrated as the primary PUSH notification provider within the Jaipur Gifting / Blinkit Clone Node.js + Express + React architecture.

## Architecture Overview
- **Server Side**: Uses `firebase-admin` SDK (`server/src/integrations/firebase/firebaseAdmin.ts`) and `PushAdapter` (`server/src/modules/notifications/adapters/push.adapter.ts`).
- **Client Side**: Uses Firebase Web SDK (`firebase/messaging`) for PWA browser notifications and token registration.
- **Worker**: Outbox event processor (`server/src/workers/notification.worker.ts`) dispatches queued push events asynchronously.

## Required Environment Variables
Configure the following in `server/.env` and root `.env`:
```env
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
NOTIFICATION_PROVIDER_MODE=live
```
