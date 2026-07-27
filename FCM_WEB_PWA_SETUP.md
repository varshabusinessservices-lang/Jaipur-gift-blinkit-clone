# FCM Web PWA Setup Guide

To enable Firebase Cloud Messaging (FCM) web push in Progressive Web App (PWA) mode:

1. **Service Worker (`public/firebase-messaging-sw.js`)**:
   Must be placed in the public directory to handle background push messages when the web app is closed or in background.
2. **VAPID Keys**:
   Configure `VITE_FIREBASE_VAPID_KEY` in frontend environment.
3. **Foreground Messaging**:
   Initialize `onMessage` listener in frontend to display custom toast notifications when messages arrive while the app is active.
