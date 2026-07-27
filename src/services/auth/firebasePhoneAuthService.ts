import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '../../lib/firebase/firebaseClient';

let recaptchaVerifier: RecaptchaVerifier | null = null;
let currentConfirmationResult: ConfirmationResult | null = null;

export const initRecaptcha = (containerId: string) => {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch(e) {}
    recaptchaVerifier = null;
  }
  
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('reCAPTCHA verified');
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired');
    }
  });

  return recaptchaVerifier;
};

export const sendPhoneOtp = async (phoneNumber: string, containerId: string) => {
  try {
    const verifier = recaptchaVerifier || initRecaptcha(containerId);
    currentConfirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

export const confirmPhoneOtp = async (otp: string) => {
  if (!currentConfirmationResult) {
    throw new Error('No pending OTP request');
  }
  try {
    const result = await currentConfirmationResult.confirm(otp);
    return result.user;
  } catch (error) {
    console.error('Error confirming OTP:', error);
    throw error;
  }
};

export const getFirebaseIdToken = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated Firebase user');
  }
  return await user.getIdToken();
};

export const signOutFirebaseSession = async () => {
  await auth.signOut();
  currentConfirmationResult = null;
};

export const clearRecaptcha = () => {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch(e) {}
    recaptchaVerifier = null;
  }
  currentConfirmationResult = null;
};
