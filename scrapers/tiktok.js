const axios = require('axios');

async function tiktokDl(url) {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API Key belum di-setting di file .env");

        const endpoint = `https://api.kaelstore.xyz/api/tiktok?url=${encodeURIComponent(url)}&apikey=${apiKey}`;
        
        // Kita hapus User-Agent buatan karena kadang server API menolak header dari Vercel
        const response = await axios.get(endpoint, {
            headers: { 'Accept': 'application/json' }
        });
        
        const resData = response.data;
        
        // Membaca pesan error ASLI dari Kael jika status false
        if (!resData.status) {
            throw new Error(resData.message || "API Kael menolak permintaan (Status False)");
        }
        if (!resData.result) {
            throw new Error("Data video kosong dari Kael API");
        }

        const data = resData.result;
        const proxiedCover = data.cover ? `https://wsrv.nl/?url=${encodeURIComponent(data.cover)}` : '';

        return {
            author: data.author,             
            unique_id: data.username,        
            title: data.caption,             
            // Fallback: Jika Kael API ganti nama variabel stream ke url, ini tetap aman
            video: data.video?.stream || data.video?.url || data.video, 
            video_url: data.video?.url,       
            cover: proxiedCover,             
            audio: data.audio?.url || data.audio,           
            audio_stream: data.audio?.stream, 
            images: data.images || []
        };
    } catch (e) {
        // Tampilkan error asli jika ada
        const errorMessage = e.response?.data?.message || e.message || "Gagal mengambil data TikTok";
        throw new Error(errorMessage);
    }
}

module.exports = { tiktokDl };
