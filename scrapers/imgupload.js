const axios = require('axios');
const FormData = require('form-data');

// ⚠️ Gak ada dokumentasi resmi publik buat API ini, jadi field name
// "file" dan cara baca response di bawah ini adalah dugaan berdasarkan
// konvensi API upload gambar yang paling umum. Kalau ternyata gagal
// atau link-nya gak ketemu, cek `raw` di response error/hasil buat
// tau struktur asli respon-nya, terus sesuaikan bagian "cari link"
// di bawah.

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

    // Coba beberapa kemungkinan struktur response yang umum dipakai
    // API upload gambar sejenis ini.
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

module.exports = { imgUploadDl };