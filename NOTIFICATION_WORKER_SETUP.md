# Notification Worker Setup Guide

The notification worker processes pending outbox events and dispatches omnichannel notifications (Email, SMS, WhatsApp, Push FCM, In-App).

## Running the Worker
Run the worker script using npm:
```bash
npm run worker:notifications
```
This runs `tsx server/src/workers/notification.worker.ts` continuously, polling pending outbox events every 10 seconds.
