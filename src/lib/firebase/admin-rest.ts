// ============================================================
// PlanCraft AI — Firebase Admin SDK Alternative (Native REST)
// ============================================================

import crypto from "crypto";

// Helper to encode buffer to base64url format
function base64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseFirestoreFields(fields: any): any {
  if (!fields) return {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const [key, valObj] of Object.entries(fields) as [string, any][]) {
    if ("stringValue" in valObj) {
      result[key] = valObj.stringValue;
    } else if ("integerValue" in valObj) {
      result[key] = parseInt(valObj.integerValue, 10);
    } else if ("doubleValue" in valObj) {
      result[key] = parseFloat(valObj.doubleValue);
    } else if ("booleanValue" in valObj) {
      result[key] = valObj.booleanValue;
    } else if ("timestampValue" in valObj) {
      result[key] = new Date(valObj.timestampValue);
    } else if ("arrayValue" in valObj) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result[key] = (valObj.arrayValue.values || []).map((item: any) => {
        if ("stringValue" in item) return item.stringValue;
        if ("mapValue" in item) return parseFirestoreFields(item.mapValue.fields);
        return item;
      });
    } else if ("mapValue" in valObj) {
      result[key] = parseFirestoreFields(valObj.mapValue.fields);
    }
  }
  return result;
}

/**
 * Fetches a document from Firestore securely using Google OAuth2 and Firestore REST API.
 * This completely bypasses the firebase-admin SDK and resolves CJS/ESM bundling errors on Vercel.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getFirestoreDoc(collectionName: string, docId: string): Promise<any | null> {
  const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;

  if (!rawPrivateKey || !clientEmail || !projectId) {
    throw new Error("Missing Firebase Admin environment variables on Vercel configuration.");
  }

  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

  // 1. Generate Google OAuth2 assertion JWT
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    exp,
    iat,
  };

  const encodedHeader = base64url(Buffer.from(JSON.stringify(header)));
  const encodedPayload = base64url(Buffer.from(JSON.stringify(payload)));
  const jwtInput = `${encodedHeader}.${encodedPayload}`;

  // Sign the assertion JWT using Node.js crypto module
  const signature = crypto.sign("sha256", Buffer.from(jwtInput), privateKey);
  const encodedSignature = base64url(signature);
  const assertion = `${jwtInput}.${encodedSignature}`;

  // 2. Request Google OAuth2 Access Token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }).toString(),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Failed to exchange OAuth2 JWT: ${errText}`);
  }

  const tokenData = await tokenRes.json();
  const oauthToken = tokenData.access_token;

  // 3. Retrieve document via Firestore REST API
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}/${docId}`;

  const docRes = await fetch(firestoreUrl, {
    headers: {
      Authorization: `Bearer ${oauthToken}`,
    },
  });

  if (docRes.status === 404) {
    return null;
  }

  if (!docRes.ok) {
    const errText = await docRes.text();
    throw new Error(`Firestore REST API returned error status: ${errText}`);
  }

  const docData = await docRes.json();
  
  // Return the parsed and flattened fields
  return {
    id: docId,
    ...parseFirestoreFields(docData.fields),
  };
}
