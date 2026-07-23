import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let firebaseApp = null;
let messaging = null;
let initialized = false;

const getServiceAccountPath = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    return process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  }

  return join(__dirname, '../../config/vibely-firebase-adminsdk.json');
};

export const initializeFirebaseAdmin = () => {
  if (initialized) {
    return { firebaseApp, messaging };
  }

  try {
    const serviceAccountPath = getServiceAccountPath();

    let serviceAccount = null;
    try {
      serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    } catch {
      console.warn('⚠️ Firebase service account file not found. Push notifications are disabled.');
      initialized = true;
      return { firebaseApp: null, messaging: null };
    }

    if (!admin.apps.length) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✓ Firebase initialized');
    } else {
      firebaseApp = admin.app();
    }

    messaging = admin.messaging();
    initialized = true;
    console.log('✓ Firebase messaging initialized');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    firebaseApp = null;
    messaging = null;
    initialized = false;
  }

  return { firebaseApp, messaging };
};

export const getMessaging = () => {
  if (!initialized) {
    initializeFirebaseAdmin();
  }
  return messaging;
};

export const firebaseAdmin = admin;
export { messaging };
export default firebaseApp;
