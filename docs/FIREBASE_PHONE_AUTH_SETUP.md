# Firebase Phone Authentication Setup

1. Create or select a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Open **Authentication** and select the **Sign-in method** tab.
3. Enable the **Phone** provider.
4. Add your authorised domains (e.g., your production URL or `localhost` for development) in the Authentication settings.
5. Register a **Web App** in your project settings.
6. Copy the web configuration and add it to your frontend `.env` file (`VITE_FIREBASE_API_KEY`, etc.).
7. Go to **Project Settings** -> **Service Accounts**. Generate a new private key for the Firebase Admin SDK.
8. Add the generated credentials (`FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`) to your server's environment variables. Note: If your private key contains newlines, they should be escaped or properly injected into your environment.
9. Configure test phone numbers in the Firebase Console for development purposes only.
10. Ensure billing is enabled if your region/project usage requires it for SMS sending.
11. Secure your API key in the Google Cloud Console by restricting its usage.
12. Test the reCAPTCHA integration.
13. Test real phone login on your staging environment.
14. Verify that the backend successfully validates the ID token.
15. Remove test phone configurations before launching to production if appropriate.
