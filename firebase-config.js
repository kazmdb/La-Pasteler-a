// Firebase Configuration
// Configuración para La Pastelería

const firebaseConfig = {
  apiKey: "AIzaSyBo5jBsKvQTP7rTy8GYXbs7YlA1nD_7A3s",
  authDomain: "la-pasteleria-b2b83.firebaseapp.com",
  projectId: "la-pasteleria-b2b83",
  storageBucket: "la-pasteleria-b2b83.firebasestorage.app",
  messagingSenderId: "747582851026",
  appId: "1:747582851026:web:caf908805814fc82492a0b",
  measurementId: "G-6FZ21G8Q6X"
};

// Initialize Firebase (versión compat)
firebase.initializeApp(firebaseConfig);

// Initialize services
const db = firebase.firestore();

// Auth solo si se necesita (para admin panel)
let auth = null;
try {
  auth = firebase.auth();
} catch (e) {
  console.log('Auth no disponible en este contexto');
}

// Storage solo si se necesita
let storage = null;
try {
  storage = firebase.storage();
} catch (e) {
  console.log('Storage no disponible en este contexto');
}

// Enable offline persistence (método compat - el warning es solo informativo)
db.enablePersistence()
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.log('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
      console.log('Persistence is not available');
    }
  });

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { firebase, auth, db, storage };
}

// Make available globally for migration script
window.db = db;
window.auth = auth;
window.storage = storage;