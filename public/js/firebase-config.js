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
  apiKey: "AIzaSyCH8g4fvD3hczZK784fzk9c6EeLGx4WMeM",
  authDomain: "rizzaja-36000.firebaseapp.com",
  projectId: "rizzaja-36000",
  storageBucket: "rizzaja-36000.firebasestorage.app",
  messagingSenderId: "107877025139",
  appId: "1:107877025139:web:73a1c85ead90e472823106"
};

firebase.initializeApp(firebaseConfig);
