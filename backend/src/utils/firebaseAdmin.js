import admin from "firebase-admin";
import "../config/env.js";

let firebaseApp = null;
let messaging = null;
let initialized = false;

const getServiceAccount = () => {
  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
  } = process.env;

  if (
    !FIREBASE_PROJECT_ID ||
    !FIREBASE_CLIENT_EMAIL ||
    !FIREBASE_PRIVATE_KEY
  ) {
    console.warn(
      "⚠️ Firebase environment variables not found. Push notifications are disabled."
    );
    return null;
  }

  return {
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };
};

export const initializeFirebaseAdmin = () => {
  if (initialized) {
    return { firebaseApp, messaging };
  }

  try {
    const serviceAccount = getServiceAccount();

    if (!serviceAccount) {
      initialized = true;
      return {
        firebaseApp: null,
        messaging: null,
      };
    }

    if (!admin.apps.length) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log("✓ Firebase initialized");
    } else {
      firebaseApp = admin.app();
    }

    messaging = admin.messaging();
    initialized = true;

    console.log("✓ Firebase messaging initialized");
  } catch (error) {
    console.error("❌ Firebase initialization error:", error);

    firebaseApp = null;
    messaging = null;
    initialized = false;
  }

  return {
    firebaseApp,
    messaging,
  };
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