(function () {
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
      const identifier = document.getElementById('loginId').value.trim();
      const password = document.getElementById('loginPassword').value;
      const btn = document.getElementById('loginSubmitBtn');

      if (!identifier || !password) {
        showError('Username/email dan password wajib diisi.');
        return;
      }

      setLoading(btn, true, 'Masuk');
      try {
        const resp = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password })
        });
        const data = await resp.json();
        if (!resp.ok || !data.ok) {
          showError(data.message || 'Gagal login.');
          setLoading(btn, false, 'Masuk');
          return;
        }
        window.location.href = '/';
      } catch (err) {
        showError('Koneksi bermasalah, coba lagi.');
        setLoading(btn, false, 'Masuk');
      }
    });

    const forgotLink = document.getElementById('forgotLink');
    if (forgotLink) {
      forgotLink.addEventListener('click', () => {
        clearMessages();
        showError('Fitur reset password belum tersedia. Hubungi admin kalau lupa password.');
      });
    }
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

      if (!username || !email || !password || !passwordConfirm) {
        showError('Semua kolom wajib diisi.');
        return;
      }
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        showError('Username 3-20 karakter, huruf/angka/underscore saja.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('Format email tidak valid.');
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
        const resp = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });
        const data = await resp.json();
        if (!resp.ok || !data.ok) {
          showError(data.message || 'Gagal mendaftar.');
          setLoading(btn, false, 'Daftar Akun');
          return;
        }
        window.location.href = '/';
      } catch (err) {
        showError('Koneksi bermasalah, coba lagi.');
        setLoading(btn, false, 'Daftar Akun');
      }
    });
  }
})();
