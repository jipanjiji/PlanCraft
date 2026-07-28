// ============================================================
// PlanCraft AI — Firebase Admin SDK Configuration (Lazy Proxied & Typed)
// ============================================================

import { getApps, initializeApp, cert, getApp } from "firebase-admin/app";
import type { App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { Firestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import type { Auth } from "firebase-admin/auth";

let appInstance: App | null = null;
let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;

function getAdminApp(): App | null {
  if (appInstance) return appInstance;

  if (getApps().length > 0) {
    appInstance = getApp();
    return appInstance;
  }

  const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

  if (!projectId || !clientEmail || !rawPrivateKey) {
    // Warn and return null to prevent crashes during static compilation (CI/CD build phase)
    console.warn(
      "⚠️ Firebase Admin credentials are not fully configured in environment variables. Deferring initialization."
    );
    return null;
  }

  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

  try {
    appInstance = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    return appInstance;
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", error);
    return null;
  }
}

// Proxy wrapper for Firestore (adminDb)
export const adminDb = new Proxy(
  {},
  {
    get(target, prop) {
      if (!firestoreInstance) {
        const app = getAdminApp();
        if (!app) {
          console.warn(`⚠️ Accessing adminDb.${String(prop)} without active Firebase Admin initialization.`);
          // Return dummy functions/properties to satisfy static type checks or metadata collection
          return () => ({
            doc: () => ({
              get: async () => ({ exists: false, data: () => ({}) }),
            }),
          });
        }
        firestoreInstance = getFirestore(app);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const val = (firestoreInstance as any)[prop];
      if (typeof val === "function") {
        return val.bind(firestoreInstance);
      }
      return val;
    },
  }
) as unknown as Firestore;

// Proxy wrapper for Auth (adminAuth)
export const adminAuth = new Proxy(
  {},
  {
    get(target, prop) {
      if (!authInstance) {
        const app = getAdminApp();
        if (!app) {
          console.warn(`⚠️ Accessing adminAuth.${String(prop)} without active Firebase Admin initialization.`);
          return () => ({});
        }
        authInstance = getAuth(app);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const val = (authInstance as any)[prop];
      if (typeof val === "function") {
        return val.bind(authInstance);
      }
      return val;
    },
  }
) as unknown as Auth;

export default getAdminApp;
