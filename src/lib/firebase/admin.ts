// ============================================================
// PlanCraft AI — Firebase Admin SDK Configuration (Fault-Tolerant)
// ============================================================

import { getApps, initializeApp, cert, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// A dummy but format-valid private key to prevent Firebase Admin from crashing during build-time
const DUMMY_PRIVATE_KEY = 
  "-----BEGIN PRIVATE KEY-----\n" +
  "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCy5T2Zz9lJc8dK\n" +
  "-----END PRIVATE KEY-----\n";

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n")
  : DUMMY_PRIVATE_KEY;

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || "plancraft-1cf06";
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "firebase-adminsdk-dummy@example.com";

if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
  console.warn(
    "⚠️ Firebase Admin credentials are not fully configured in env variables. Using dummy values for static build compilation."
  );
}

const app = getApps().length === 0
  ? initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
  : getApp();

export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);
export default app;
