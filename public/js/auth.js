(function () {
  const auth = firebase.auth();
  const db = firebase.firestore();

  const ERROR_MESSAGES = {
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/user-disabled': 'Akun ini sudah dinonaktifkan.',
    'auth/user-not-found': 'Username/email belum terdaftar.',
    'auth/wrong-password': 'Password salah.',
    'auth/invalid-credential': 'Username/email atau password salah.',
    'auth/email-already-in-use': 'Email ini sudah terdaftar, coba masuk.',
    'auth/weak-password': 'Password minimal 6 karakter.',
    'auth/network-request-failed': 'Koneksi bermasalah, coba lagi.',
    'auth/too-many-requests': 'Terlalu banyak percobaan, coba lagi nanti.'
  };

  function friendlyError(err) {
    return ERROR_MESSAGES[err.code] || 'Terjadi kesalahan: ' + err.message;
  }

  function showError(msg) {
    const el = document.getElementById('authError');
    const ok = document.getElementById('authSuccess');
    if (ok) ok.classList.add('hidden');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
  }

  function showSuccess(msg) {
    const el = document.getElementById('authSuccess');
    const err = document.getElementById('authError');
    if (err) err.classList.add('hidden');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
  }

  function clearMessages() {
    const err = document.getElementById('authError');
    const ok = document.getElementById('authSuccess');
    if (err) { err.classList.add('hidden'); err.textContent = ''; }
    if (ok) { ok.classList.add('hidden'); ok.textContent = ''; }
  }

  function setLoading(btn, loading, label) {
    if (!btn) return;
    btn.disabled = loading;
    btn.innerHTML = loading ? '<span>Memproses...</span>' : `<span>${label}</span>`;
  }

  document.querySelectorAll('.toggle-pass').forEach(icon => {
    icon.addEventListener('click', () => {
      const input = document.getElementById(icon.dataset.target);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      icon.setAttribute('data-lucide', input.type === 'password' ? 'eye-off' : 'eye');
      if (window.lucide) lucide.createIcons();
    });
  });

  /* ---------------- LOGIN ---------------- */
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearMessages();
      const idValue = document.getElementById('loginId').value.trim();
      const password = document.getElementById('loginPassword').value;
      const btn = document.getElementById('loginSubmitBtn');
      setLoading(btn, true, 'Masuk');

      try {
        let email = idValue;
        if (!idValue.includes('@')) {
          const unameDoc = await db.collection('usernames').doc(idValue.toLowerCase()).get();
          if (!unameDoc.exists) {
            showError('Username/email belum terdaftar.');
            setLoading(btn, false, 'Masuk');
            return;
          }
          email = unameDoc.data().email;
        }
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = '/';
      } catch (err) {
        showError(friendlyError(err));
        setLoading(btn, false, 'Masuk');
      }
    });

    const forgotLink = document.getElementById('forgotLink');
    if (forgotLink) {
      forgotLink.addEventListener('click', async () => {
        clearMessages();
        const idValue = (document.getElementById('loginId').value || '').trim();
        let email = idValue;
        try {
          if (idValue && !idValue.includes('@')) {
            const unameDoc = await db.collection('usernames').doc(idValue.toLowerCase()).get();
            if (unameDoc.exists) email = unameDoc.data().email;
          }
          if (!email || !email.includes('@')) {
            showError('Isi kolom Username atau Email dulu, lalu tap "Lupa Password?" lagi.');
            return;
          }
          await auth.sendPasswordResetEmail(email);
          showSuccess('Link reset password sudah dikirim ke ' + email);
        } catch (err) {
          showError(friendlyError(err));
        }
      });
    }

    // Kalau sudah login, langsung lempar ke dashboard
    auth.onAuthStateChanged(user => {
      if (user) window.location.href = '/';
    });
  }

  /* ---------------- REGISTER ---------------- */
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearMessages();
      const username = document.getElementById('registerUsername').value.trim();
      const email = document.getElementById('registerEmail').value.trim();
      const password = document.getElementById('registerPassword').value;
      const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
      const btn = document.getElementById('registerSubmitBtn');

      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        showError('Username 3-20 karakter, huruf/angka/underscore saja.');
        return;
      }
      if (password.length < 6) {
        showError('Password minimal 6 karakter.');
        return;
      }
      if (password !== passwordConfirm) {
        showError('Konfirmasi password tidak cocok.');
        return;
      }

      setLoading(btn, true, 'Daftar Akun');

      try {
        const usernameKey = username.toLowerCase();
        const existing = await db.collection('usernames').doc(usernameKey).get();
        if (existing.exists) {
          showError('Username sudah dipakai, coba yang lain.');
          setLoading(btn, false, 'Daftar Akun');
          return;
        }

        const cred = await auth.createUserWithEmailAndPassword(email, password);
        await cred.user.updateProfile({ displayName: username });

        await db.collection('usernames').doc(usernameKey).set({
          uid: cred.user.uid,
          email
        });
        await db.collection('users').doc(cred.user.uid).set({
          username,
          email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        window.location.href = '/';
      } catch (err) {
        showError(friendlyError(err));
        setLoading(btn, false, 'Daftar Akun');
      }
    });

    auth.onAuthStateChanged(user => {
      if (user) window.location.href = '/';
    });
  }

  /* ---------------- LOGOUT (dipanggil dari header dashboard) ---------------- */
  window.doLogout = function () {
    auth.signOut().then(() => { window.location.href = '/login'; });
  };

  /* ---------------- AUTH GUARD (dipakai di dashboard index.ejs) ---------------- */
  window.initAuthGuard = function () {
    auth.onAuthStateChanged(user => {
      const phone = document.querySelector('.phone');
      const loader = document.getElementById('authLoader');
      if (!user) {
        window.location.href = '/login';
        return;
      }
      const nameEl = document.getElementById('userChipName');
      const avatarEl = document.getElementById('userChipAvatar');
      const displayName = user.displayName || user.email.split('@')[0];
      if (nameEl) nameEl.textContent = displayName;
      if (avatarEl) avatarEl.textContent = displayName.charAt(0);
      if (phone) phone.classList.remove('auth-hidden');
      if (loader) loader.remove();
    });
  };
})();
