import admin from "firebase-admin";
import path from "path";

const serviceAccount = require(
  path.join(__dirname, "serviceAccountKey.json")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = admin.firestore();
export const auth = admin.auth();
