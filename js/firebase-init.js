// Import Firebase core, Auth, and now Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"; // <-- NEW

const firebaseConfig = {
  apiKey: "AIzaSyBwNfAJmZdSzbp3DmQixzjXlNwXYkidd6Q",
  authDomain: "mind-scape-chess.firebaseapp.com",
  projectId: "mind-scape-chess",
  storageBucket: "mind-scape-chess.firebasestorage.app",
  messagingSenderId: "649846220178",
  appId: "1:649846220178:web:1be0e7105427f30ae64d4b"
};

const app = initializeApp(firebaseConfig);

// Export our services so the rest of the app can use them
export const auth = getAuth(app);
export const db = getFirestore(app); // <-- NEW: Exporting the database