const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Ruta al archivo de credenciales
const serviceAccountPath = path.join(
  __dirname,
  '../../serviceAccountKey.json'
);

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

// Obtener referencias a Firestore y Auth
const db = admin.firestore();
const auth = admin.auth();

module.exports = {
  admin,
  db,
  auth,
};