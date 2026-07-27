import { getFirebaseAdmin } from '../../../integrations/firebase/firebaseAdmin';

export async function verifyFirebaseIdToken(idToken: string) {
  const admin = getFirebaseAdmin();
  const decodedToken = await admin.auth.verifyIdToken(idToken, true);
  return decodedToken;
}
