/* =====================================================================
   firebase-config.js — PUBLIC Firebase web configuration.

   These values are NOT secret. The Firebase web API key only identifies
   your project — it is safe to publish (Google says so explicitly). All
   access control is enforced SERVER-SIDE by Firebase Authentication and
   Firestore Security Rules (see firestore.rules in the project root).

   NEVER put an admin password, service-account key, or private API key
   in this file.

   HOW TO FILL THIS IN
   -------------------
   1. Create a Firebase project (see README → "Admin setup").
   2. Firebase Console → Project settings → Your apps → Web (</>) app.
   3. Copy the `firebaseConfig` object and paste it below.
   4. Save, commit and push. Admin login is then enabled for the whole
      site.

   Until you do this, DS_FIREBASE_CONFIG stays null and the website runs
   in read-only "static" mode: every visitor (including you) can view all
   content, but no management buttons appear and nothing can be edited.
   ===================================================================== */
window.DS_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAV4BnwhQpVHEcYrU9231flYFPtESxsKng",
  authDomain: "ds-lab-website.firebaseapp.com",
  projectId: "ds-lab-website",
  storageBucket: "ds-lab-website.firebasestorage.app",
  messagingSenderId: "312286886713",
  appId: "1:312286886713:web:66e2402536ceeaa6fa46e8"
};

/*
window.DS_FIREBASE_CONFIG = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000"
};
*/
