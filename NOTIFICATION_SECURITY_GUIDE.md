# Notification Security Guide

1. **Server-Only Credentials**: Firebase Admin private keys and FCM server secrets must never be exposed to the browser or client-side code.
2. **Authentication**: All admin notification routes and settings modification endpoints require valid `requireAuth` middleware verification.
3. **Idempotency**: Notification dispatch uses cryptographic idempotency hashes (`idempotencyKey`) to prevent duplicate deliveries on network retries.
