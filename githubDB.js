const axios = require('axios');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO; // format: "owner/repo"
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const DATA_PATH = process.env.GITHUB_DATA_PATH || 'data/users.json';

function checkConfig() {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    throw new Error(
      'GITHUB_TOKEN dan/atau GITHUB_REPO belum diisi di .env. Lihat GITHUB-SETUP.md.'
    );
  }
}

function apiUrl() {
  return `https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_PATH}`;
}

function headers() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json'
  };
}

// Ambil isi data/users.json dari repo. Kalau file belum ada sama
// sekali (baru pertama kali dipakai), otomatis dianggap array kosong.
async function getUsers() {
  checkConfig();
  try {
    const resp = await axios.get(apiUrl(), {
      headers: headers(),
      params: { ref: GITHUB_BRANCH }
    });
    const content = Buffer.from(resp.data.content, 'base64').toString('utf-8');
    return { users: JSON.parse(content || '[]'), sha: resp.data.sha };
  } catch (e) {
    if (e.response && e.response.status === 404) {
      return { users: [], sha: null };
    }
    throw e;
  }
}

// Simpan array users ke data/users.json (bikin commit baru tiap kali
// dipanggil). sha wajib diisi kalau file sudah ada sebelumnya (dari
// hasil getUsers()), biar GitHub tau kita update versi yang benar.
async function saveUsers(users, sha) {
  checkConfig();
  const content = Buffer.from(JSON.stringify(users, null, 2)).toString('base64');
  const body = {
    message: `Update users.json (${users.length} user)`,
    content,
    branch: GITHUB_BRANCH
  };
  if (sha) body.sha = sha;

  const resp = await axios.put(apiUrl(), body, { headers: headers() });
  return resp.data.content.sha;
}

// Wrapper aman dari race condition: kalau pas nyimpen ternyata ada
// commit lain nyelip duluan (409 Conflict), ambil ulang data terbaru,
// terapin lagi perubahannya, coba simpan sekali lagi.
async function withUsers(mutateFn) {
  const { users, sha } = await getUsers();
  const updated = mutateFn(users);
  try {
    await saveUsers(updated, sha);
  } catch (e) {
    if (e.response && e.response.status === 409) {
      const retry = await getUsers();
      const updatedRetry = mutateFn(retry.users);
      await saveUsers(updatedRetry, retry.sha);
    } else {
      throw e;
    }
  }
  return updated;
}

module.exports = { getUsers, saveUsers, withUsers };
