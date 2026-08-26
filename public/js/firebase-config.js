// ============================================================
// KONFIGURASI FIREBASE
// ============================================================
// Ganti semua nilai di bawah ini dengan config dari project
// Firebase kamu sendiri. Caranya:
// 1. Buka https://console.firebase.google.com
// 2. Buat project baru (atau pakai yang sudah ada)
// 3. Di dashboard project, klik ikon "</>" (Web app) untuk
//    daftarkan aplikasi web baru
// 4. Firebase akan kasih objek config seperti di bawah ini,
//    tinggal copy-paste ke sini
// 5. Di menu Authentication > Sign-in method, aktifkan
//    provider "Email/Password"
// 6. Di menu Firestore Database, klik "Create database"
//    (mode production/test bebas, nanti atur rules-nya)
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyCjn6Sk7fmn-zBiWryPBDWrb-xygOzoVDU",
  authDomain: "rizzxdatabase.firebaseapp.com",
  projectId: "rizzxdatabase",
  storageBucket: "rizzxdatabase.firebasestorage.app",
  messagingSenderId: "1045655561056",
  appId: "1:1045655561056:web:f970d373638b4877473405",
  measurementId: "G-WG1YL5DWHL"
};

firebase.initializeApp(firebaseConfig);
