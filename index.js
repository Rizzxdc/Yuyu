require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUsers, withUsers, getFile, putFile } = require('./githubDB');
// Setiap scraper di-load dengan aman: kalau salah satu gagal (file
// kurang, dependency belum ke-install, dll), yang lain tetap jalan
// dan seluruh situs GAK ikut crash — cuma fitur itu doang yang error.
const moduleLoadErrors = {};
function safeRequire(modulePath, label) {
  try {
    return require(modulePath);
  } catch (e) {
    console.error(`⚠️  Gagal load ${label} (${modulePath}):`, e.message);
    moduleLoadErrors[label] = e.message;
    return null;
  }
}

const tiktokMod = safeRequire('./scrapers/tiktok', 'TikTok scraper');
const igMod = safeRequire('./scrapers/instagram', 'Instagram scraper');
const ytMod = safeRequire('./scrapers/youtube', 'YouTube scraper');

const tiktokDl = tiktokMod && tiktokMod.tiktokDl;
const igDl = igMod && igMod.igDl;
const ytDl = ytMod && ytMod.ytDl;

// Fungsi upload gambar ke dropbyte.web.id ditulis LANGSUNG di sini
// (bukan file terpisah), biar gak ada resiko "file baru gak ke-upload".
const FormData = require('form-data');

async function imgUploadDl(fileBuffer, fileName) {
  try {
    const form = new FormData();
    form.append('file', fileBuffer, { filename: fileName || 'image.jpg' });

    const response = await axios.post(
      'https://api.dropbyte.web.id/api/v1/upload',
      form,
      { headers: form.getHeaders() }
    );

    const resData = response.data;
    const link =
      resData?.url ||
      resData?.link ||
      resData?.data?.url ||
      resData?.data?.link ||
      resData?.result?.url ||
      resData?.result?.link ||
      resData?.file_url ||
      resData?.image_url;

    if (!link) {
      const err = new Error('Upload berhasil tapi link gak ketemu di response API.');
      err.raw = resData;
      throw err;
    }

    return { url: link, raw: resData };
  } catch (e) {
    if (e.raw) throw e;
    const errorMessage = e.response?.data?.message || e.message || 'Gagal upload gambar.';
    const err = new Error(errorMessage);
    err.raw = e.response?.data;
    throw err;
  }
}

// Ambil info package npm (bukan file baru, langsung di sini biar aman)
async function npmDl(packageUrl) {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error('API Key belum di-setting di file .env');

    const endpoint = `https://api.kaelstore.xyz/api/download/npm?url=${encodeURIComponent(packageUrl)}&apikey=${apiKey}`;
    const response = await axios.get(endpoint, { headers: { Accept: 'application/json' } });
    const resData = response.data;

    if (!resData.status) {
      throw new Error(resData.message || 'API Kael menolak permintaan (Status False)');
    }
    if (!resData.result) {
      throw new Error('Data package kosong dari Kael API');
    }

    return resData.result;
  } catch (e) {
    const errorMessage = e.response?.data?.message || e.message || 'Gagal mengambil data npm package.';
    throw new Error(errorMessage);
  }
}

// Stalk akun TikTok — terima username biasa, "@username", atau link profil
async function stalkTiktokDl(usernameInput) {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error('API Key belum di-setting di file .env');

    let username = (usernameInput || '').trim();
    const urlMatch = username.match(/tiktok\.com\/@([a-zA-Z0-9._]+)/i);
    if (urlMatch) username = urlMatch[1];
    username = username.replace(/^@/, '');

    if (!username) throw new Error('Username TikTok belum diisi.');

    const endpoint = `https://api.kaelstore.xyz/api/stalk/tiktok?username=${encodeURIComponent(username)}&apikey=${apiKey}`;
    const response = await axios.get(endpoint, { headers: { Accept: 'application/json' } });
    const resData = response.data;

    if (!resData.status) {
      throw new Error(resData.message || 'API Kael menolak permintaan (Status False)');
    }
    if (!resData.result) {
      throw new Error('Data akun kosong dari Kael API, cek username-nya bener gak.');
    }

    const r = resData.result;
    const proxiedAvatar = r.avatar ? `https://wsrv.nl/?url=${encodeURIComponent(r.avatar)}` : '';

    return { ...r, avatar: proxiedAvatar };
  } catch (e) {
    const errorMessage = e.response?.data?.message || e.message || 'Gagal mengambil data akun TikTok.';
    throw new Error(errorMessage);
  }
}

// Stalk akun GitHub — terima username biasa atau link profil
async function stalkGithubDl(usernameInput) {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error('API Key belum di-setting di file .env');

    let username = (usernameInput || '').trim();
    const urlMatch = username.match(/github\.com\/([a-zA-Z0-9-]+)/i);
    if (urlMatch) username = urlMatch[1];
    username = username.replace(/^@/, '');

    if (!username) throw new Error('Username GitHub belum diisi.');

    const endpoint = `https://api.kaelstore.xyz/api/stalk/github?username=${encodeURIComponent(username)}&apikey=${apiKey}`;
    const response = await axios.get(endpoint, { headers: { Accept: 'application/json' } });
    const resData = response.data;

    if (!resData.status) {
      throw new Error(resData.message || 'API Kael menolak permintaan (Status False)');
    }
    if (!resData.result) {
      throw new Error('Data akun kosong dari Kael API, cek username-nya bener gak.');
    }

    return resData.result;
  } catch (e) {
    const errorMessage = e.response?.data?.message || e.message || 'Gagal mengambil data akun GitHub.';
    throw new Error(errorMessage);
  }
}

// Stalk akun Roblox — API ini beda (azbry.com) & gak butuh API key
async function stalkRobloxDl(usernameInput) {
  try {
    let username = (usernameInput || '').trim();
    const paramMatch = username.match(/[?&]username=([a-zA-Z0-9_]+)/i);
    if (paramMatch) username = paramMatch[1];
    username = username.replace(/^@/, '');

    if (!username) throw new Error('Username Roblox belum diisi.');

    const endpoint = `https://api.azbry.com/api/stalk/roblox?username=${encodeURIComponent(username)}`;
    const response = await axios.get(endpoint, { headers: { Accept: 'application/json' } });
    const resData = response.data;

    if (!resData.status) {
      throw new Error(resData.message || 'API menolak permintaan (Status False)');
    }
    if (!resData.result) {
      throw new Error('Data akun kosong dari API, cek username-nya bener gak.');
    }

    return resData.result;
  } catch (e) {
    const errorMessage = e.response?.data?.message || e.message || 'Gagal mengambil data akun Roblox.';
    throw new Error(errorMessage);
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ganti-secret-ini-di-env';
const TOKEN_COOKIE_NAME = 'token';
const TOKEN_EXPIRES_IN = '5d';
const TOKEN_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

function maskEmail(email) {
  if (!email || !email.includes('@')) return email || '';
  const [local, domain] = email.split('@');
  const visibleLen = Math.min(5, Math.max(1, local.length - 1));
  const visible = local.slice(0, visibleLen);
  const stars = '*'.repeat(Math.max(3, local.length - visibleLen));
  return `${visible}${stars}@${domain}`;
}

// Middleware: WAJIB login buat lanjut
function requireAuth(req, res, next) {
  const token = req.cookies[TOKEN_COOKIE_NAME];
  if (!token) return res.redirect('/login');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      uid: decoded.uid,
      username: decoded.username,
      email: decoded.email,
      maskedEmail: maskEmail(decoded.email),
      hasAvatar: !!decoded.hasAvatar
    };
    next();
  } catch (e) {
    res.clearCookie(TOKEN_COOKIE_NAME);
    return res.redirect('/login');
  }
}

// Middleware: kalau sudah login, jangan tampilkan lagi halaman login/register
function redirectIfLoggedIn(req, res, next) {
  const token = req.cookies[TOKEN_COOKIE_NAME];
  if (!token) return next();

  try {
    jwt.verify(token, JWT_SECRET);
    return res.redirect('/');
  } catch (e) {
    res.clearCookie(TOKEN_COOKIE_NAME);
    next();
  }
}

const tools = {
  game: [
    { icon: '<i data-lucide="worm"></i>', name: 'Snake', sub: 'Kumpulin skor', badge: 'MAIN', open: 'snake' },
    { icon: '<i data-lucide="list-ordered"></i>', name: '2048', sub: 'Gabung angka', badge: 'MAIN', open: 'g2048' },
    { icon: '<i data-lucide="arrow-up-down"></i>', name: 'Gravity Flip', sub: 'Balik gravitasi, hindari duri', badge: 'BARU', open: 'gravity' },
    { icon: '<i data-lucide="brain"></i>', name: 'Otak Kilat', sub: 'Hafalin pola makin cepat', badge: 'BARU', open: 'otak' },
    { icon: '<i data-lucide="target"></i>', name: 'Ketuk Refleks', sub: 'Tap sebelum waktu habis', badge: 'BARU', open: 'reflex' },
    { icon: '<i data-lucide="layers"></i>', name: 'Stack Tower', sub: 'Susun balok setinggi mungkin', badge: 'BARU', open: 'stack' },
    { icon: '<i data-lucide="bird"></i>', name: 'Flappy Blok', sub: 'Tap buat terbang, hindari pipa', badge: 'BARU', open: 'flappy' },
    { icon: '<i data-lucide="hammer"></i>', name: 'Tepuk Tikus', sub: 'Pukul tikus sebelum kabur', badge: 'BARU', open: 'mole' },
    { icon: '<i data-lucide="layout-grid"></i>', name: 'Cocok Kartu', sub: 'Ingat posisi, cocokkan pasangan', badge: 'BARU', open: 'memory' },
    { icon: '<i data-lucide="cherry"></i>', name: 'Iris Buah', sub: 'Geser buat iris, hindari bom', badge: 'BARU', open: 'fruit' },
    { icon: '<i data-lucide="calculator"></i>', name: 'Hitung Cepat', sub: 'Jawab soal matematika secepatnya', badge: 'BARU', open: 'math' },
    { icon: '<i data-lucide="footprints"></i>', name: 'Lari Dino', sub: 'Lompatin kaktus, jangan nabrak', badge: 'BARU', open: 'dino' },
    { icon: '🧱', name: 'Pecah Bata', sub: 'Pantulkan bola, hancurkan semua bata', badge: 'BARU', open: 'brick' },
    { icon: '🚀', name: 'Hindari Meteor', sub: 'Geser kapal, hindari meteor jatuh', badge: 'BARU', open: 'meteor' },
    { icon: '🧩', name: 'Puzzle Geser', sub: 'Urutkan angka 1-8 secepat mungkin', badge: 'BARU', open: 'puzzle' },
    { icon: '🎈', name: 'Balon Meletus', sub: 'Tap balon, jangan kena bom', badge: 'BARU', open: 'balloon' },
    { icon: '🔤', name: 'Susun Kata', sub: 'Susun huruf acak jadi kata benar', badge: 'BARU', open: 'word' },
    { icon: '🎹', name: 'Tap Ubin', sub: 'Tap ubin hitam sebelum kelewatan', badge: 'BARU', open: 'piano' }
  ],
  downloader: [
    { icon: '<i data-lucide="instagram"></i>', name: 'Instagram', sub: 'Download video & foto', badge: 'HD', open: 'dl-instagram', platform: 'instagram' },
    { icon: '<i data-lucide="music-2"></i>', name: 'TikTok', sub: 'No watermark', badge: 'MP4', open: 'dl-tiktok', platform: 'tiktok' },
    { icon: '<svg viewBox="0 0 24 24" width="22" height="22"><rect width="24" height="24" rx="6" fill="#FF0000"/><path d="M9.5 8.3v7.4c0 .5.55.8 1 .55l6.4-3.7c.44-.26.44-.9 0-1.15l-6.4-3.7c-.45-.26-1 .05-1 .55z" fill="#fff"/></svg>', name: 'YouTube', sub: 'Video & audio HD', badge: 'MP4/MP3', open: 'dl-youtube', platform: 'youtube' },
    { icon: '<i data-lucide="image-up"></i>', name: 'Uploader Gambar', sub: 'Upload gambar, dapetin link', badge: 'BARU', open: 'dl-imgupload', platform: 'imgupload' },
    { icon: '<svg viewBox="0 0 24 24" width="22" height="22"><rect width="24" height="24" rx="4" fill="#CB3837"/><text x="12" y="15.5" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#fff">NPM</text></svg>', name: 'NPM Package', sub: 'Cek info & download package npm', badge: 'BARU', open: 'dl-npm', platform: 'npm' }
  ],
  stalk: [
    { icon: '<i data-lucide="music-2"></i>', name: 'Stalk TikTok', sub: 'Cek info akun TikTok', badge: 'BARU', open: 'stalk-tiktok', platform: 'stalktiktok' },
    { icon: '<i data-lucide="github"></i>', name: 'Stalk GitHub', sub: 'Cek info akun & repo GitHub', badge: 'BARU', open: 'stalk-github', platform: 'stalkgithub' },
    { icon: '<i data-lucide="box"></i>', name: 'Stalk Roblox', sub: 'Cek info akun Roblox', badge: 'BARU', open: 'stalk-roblox', platform: 'stalkroblox' }
  ]
};

app.get('/', requireAuth, (req, res) => {
  res.render('index', { tools, user: req.user, whatsappChannel: process.env.WHATSAPP_CHANNEL_URL || '#' });
});

app.get('/login', redirectIfLoggedIn, (req, res) => {
  res.render('login');
});

app.get('/register', redirectIfLoggedIn, (req, res) => {
  res.render('register');
});

function signToken(user) {
  return jwt.sign({
    uid: user.id,
    username: user.username,
    email: user.email,
    hasAvatar: !!user.hasAvatar
  }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN
  });
}

function setAuthCookie(res, token) {
  res.cookie(TOKEN_COOKIE_NAME, token, {
    maxAge: TOKEN_MAX_AGE_MS,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
}

app.post('/api/register', express.json(), async (req, res) => {
  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ ok: false, message: 'Semua kolom wajib diisi.' });
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({ ok: false, message: 'Username 3-20 karakter, huruf/angka/underscore saja.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, message: 'Format email tidak valid.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ ok: false, message: 'Password minimal 6 karakter.' });
  }

  const usernameLower = username.toLowerCase();
  const emailLower = email.toLowerCase();

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    let newUser = null;
    let duplicateMessage = null;

    await withUsers((users) => {
      if (users.some(u => u.username === usernameLower)) {
        duplicateMessage = 'Username sudah dipakai, coba yang lain.';
        return users;
      }
      if (users.some(u => u.email === emailLower)) {
        duplicateMessage = 'Email sudah terdaftar.';
        return users;
      }
      newUser = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        username: usernameLower,
        email: emailLower,
        passwordHash,
        createdAt: new Date().toISOString()
      };
      return [...users, newUser];
    });

    if (duplicateMessage) {
      return res.status(409).json({ ok: false, message: duplicateMessage });
    }

    const token = signToken(newUser);
    setAuthCookie(res, token);
    return res.json({ ok: true });
  } catch (e) {
    const githubMsg = e.response && e.response.data && e.response.data.message;
    console.error('Register error:', e.message, githubMsg || '');
    return res.status(500).json({ ok: false, message: 'Gagal mendaftar: ' + (githubMsg || e.message) });
  }
});

app.post('/api/login', express.json(), async (req, res) => {
  const { identifier, password } = req.body || {};

  if (!identifier || !password) {
    return res.status(400).json({ ok: false, message: 'Username/email dan password wajib diisi.' });
  }

  try {
    const idLower = identifier.trim().toLowerCase();
    const { users } = await getUsers();
    const user = users.find(u => u.username === idLower || u.email === idLower);
    if (!user) {
      return res.status(401).json({ ok: false, message: 'Username/email belum terdaftar.' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ ok: false, message: 'Password salah.' });
    }

    const token = signToken(user);
    setAuthCookie(res, token);
    return res.json({ ok: true });
  } catch (e) {
    const githubMsg = e.response && e.response.data && e.response.data.message;
    console.error('Login error:', e.message, githubMsg || '');
    return res.status(500).json({ ok: false, message: 'Gagal login: ' + (githubMsg || e.message) });
  }
});

// Endpoint bantu buat ngecek koneksi GITHUB_TOKEN/GITHUB_REPO tanpa
// perlu daftar akun dulu. Buka aja di browser: /api/debug-github
// Endpoint bantu buat ngecek kenapa fitur upload gambar "belum siap
// di server". Buka aja di browser: /api/debug-imgupload
app.get('/api/debug-imgupload', (req, res) => {
  let formDataOk = true;
  let formDataError = null;
  try {
    require('form-data');
  } catch (e) {
    formDataOk = false;
    formDataError = e.message;
  }

  res.json({
    scraper_imgupload_berhasil_dimuat: !!imgUploadDl,
    error_saat_load_scraper: moduleLoadErrors['Image Upload scraper'] || null,
    package_form_data_bisa_di_require: formDataOk,
    error_form_data: formDataError
  });
});

app.get('/api/debug-github', async (req, res) => {
  const repo = process.env.GITHUB_REPO;
  const hasToken = !!process.env.GITHUB_TOKEN;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!hasToken || !repo) {
    return res.json({
      ok: false,
      message: 'GITHUB_TOKEN atau GITHUB_REPO belum keisi di Environment Variables.',
      GITHUB_TOKEN_ada: hasToken,
      GITHUB_REPO: repo || '(kosong)'
    });
  }

  try {
    const resp = await axios.get(`https://api.github.com/repos/${repo}`, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json'
      }
    });
    return res.json({
      ok: true,
      message: 'Token & repo VALID, bisa diakses.',
      repo_ditemukan: resp.data.full_name,
      default_branch_asli: resp.data.default_branch,
      GITHUB_BRANCH_yang_diisi_di_env: branch,
      branch_cocok: resp.data.default_branch === branch
    });
  } catch (e) {
    const githubMsg = e.response && e.response.data && e.response.data.message;
    return res.json({
      ok: false,
      message: 'Gagal akses repo lewat GitHub API.',
      status_code: e.response ? e.response.status : null,
      github_message: githubMsg || e.message,
      GITHUB_REPO_yang_diisi: repo
    });
  }
});

app.post('/api/upload-avatar', requireAuth, express.json({ limit: '6mb' }), async (req, res) => {
  const { imageBase64 } = req.body || {};
  if (!imageBase64) {
    return res.status(400).json({ ok: false, message: 'Gak ada gambar yang dikirim.' });
  }

  const match = imageBase64.match(/^data:image\/(jpeg|jpg|png);base64,(.+)$/);
  if (!match) {
    return res.status(400).json({ ok: false, message: 'Format gambar harus JPEG/PNG.' });
  }
  const rawBase64 = match[2];

  const sizeInBytes = Buffer.byteLength(rawBase64, 'base64');
  if (sizeInBytes > 2 * 1024 * 1024) {
    return res.status(400).json({ ok: false, message: 'Ukuran foto kegedean, maks 2MB.' });
  }

  try {
    const filePath = `data/avatars/${req.user.uid}.jpg`;
    await putFile(filePath, rawBase64, `Update avatar ${req.user.username}`);

    await withUsers((users) =>
      users.map(u => u.id === req.user.uid ? { ...u, hasAvatar: true } : u)
    );

    const token = signToken({
      id: req.user.uid,
      username: req.user.username,
      email: req.user.email,
      hasAvatar: true
    });
    setAuthCookie(res, token);

    return res.json({ ok: true, avatarUrl: `/avatar/${req.user.uid}` });
  } catch (e) {
    console.error('Upload avatar error:', e.message);
    return res.status(500).json({ ok: false, message: 'Gagal upload foto, coba lagi.' });
  }
});

app.get('/avatar/:uid', async (req, res) => {
  try {
    const file = await getFile(`data/avatars/${req.params.uid}.jpg`);
    if (!file) return res.status(404).send('Not found');
    const buffer = Buffer.from(file.content, 'base64');
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(buffer);
  } catch (e) {
    return res.status(404).send('Not found');
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie(TOKEN_COOKIE_NAME);
  return res.json({ ok: true });
});

app.post('/api/image-upload', express.json({ limit: '12mb' }), async (req, res) => {
  if (!imgUploadDl) {
    return res.status(503).json({
      ok: false,
      message: 'Fitur upload gambar belum siap di server. Cek: dependency "form-data" sudah ada di package.json & ke-install?'
    });
  }

  const { imageBase64, fileName } = req.body || {};
  if (!imageBase64) {
    return res.status(400).json({ ok: false, message: 'Gak ada gambar yang dikirim.' });
  }

  const match = imageBase64.match(/^data:image\/(jpeg|jpg|png|webp|gif);base64,(.+)$/);
  if (!match) {
    return res.status(400).json({ ok: false, message: 'Format gambar harus JPEG/PNG/WEBP/GIF.' });
  }
  const ext = match[1];
  const rawBase64 = match[2];
  const buffer = Buffer.from(rawBase64, 'base64');

  if (buffer.length > 8 * 1024 * 1024) {
    return res.status(400).json({ ok: false, message: 'Ukuran gambar kegedean, maks 8MB.' });
  }

  try {
    const result = await imgUploadDl(buffer, fileName || `upload.${ext}`);
    return res.json({ ok: true, url: result.url });
  } catch (e) {
    console.error('Image upload error:', e.message, e.raw || '');
    return res.status(500).json({ ok: false, message: e.message || 'Gagal upload gambar.' });
  }
});

app.post('/api/download', express.json(), async (req, res) => {
  // Menangkap type dan quality yang dikirim khusus dari YouTube
  const { platform, url, type, quality } = req.body || {};

  if (!url) {
    return res.status(400).json({ ok: false, message: 'URL belum diisi.' });
  }

  try {
    let result;
    
    if (platform === 'tiktok') {
      if (!tiktokDl) return res.status(503).json({ ok: false, message: 'Scraper TikTok belum siap di server (cek file scrapers/tiktok.js).' });
      result = await tiktokDl(url);
    } else if (platform === 'instagram') {
      if (!igDl) return res.status(503).json({ ok: false, message: 'Scraper Instagram belum siap di server (cek file scrapers/instagram.js).' });
      result = await igDl(url);
    } else if (platform === 'youtube') {
      if (!ytDl) return res.status(503).json({ ok: false, message: 'Scraper YouTube belum siap di server (cek file scrapers/youtube.js).' });
      // Jalankan fungsi ytDl dengan membawa parameter type dan quality
      result = await ytDl(url, type, quality);
    } else if (platform === 'npm') {
      result = await npmDl(url);
    } else if (platform === 'stalktiktok') {
      result = await stalkTiktokDl(url);
    } else if (platform === 'stalkgithub') {
      result = await stalkGithubDl(url);
    } else if (platform === 'stalkroblox') {
      result = await stalkRobloxDl(url);
    } else {
      return res.status(400).json({ ok: false, message: `Scraper untuk ${platform} belum dipasang.` });
    }

    return res.json({ ok: true, data: result });
  } catch (e) {
    return res.status(500).json({ ok: false, message: e.message || `Gagal mengambil data ${platform}.` });
  }
});

// Proxy download (Tersedia sebagai cadangan jika dibutuhkan oleh frontend)
app.get('/api/proxy-download', async (req, res) => {
  const { url, filename, type } = req.query;

  if (!url) {
    return res.status(400).send('URL kosong.');
  }

  try {
    const response = await axios.get(url, { 
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    const ext = type === 'audio' ? 'mp3' : (type === 'image' ? 'jpg' : 'mp4');
    const safeName = (filename || 'download').replace(/[^a-z0-9_\-]/gi, '_');

    res.setHeader('Content-Disposition', `attachment; filename="VIP-Tools-${safeName}.${ext}"`);
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');

    response.data.pipe(res);
  } catch (e) {
    console.error("Proxy Download Error:", e.message);
    res.status(500).send('Gagal mengambil file.');
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`VIP Tools jalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
