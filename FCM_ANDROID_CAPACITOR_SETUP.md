# FCM Android Capacitor Setup Guide

For Android mobile app deployment using Capacitor:
1. Add `@capacitor-firebase/messaging` or standard Cordova push plugin.
2. Place `google-services.json` in `android/app/`.
3. Register native push token on app boot via `POST /api/v1/notifications/devices`.
