const axios = require('axios');

async function ytDl(url, type = 'mp4', quality = '360') {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API Key belum di-setting di file .env");

        // Memasukkan type dan quality ke dalam URL Endpoint
        const endpoint = `https://api.kaelstore.xyz/api/youtube?url=${encodeURIComponent(url)}&type=${type}&quality=${quality}&apikey=${apiKey}`;
        
        const response = await axios.get(endpoint, {
            headers: { 'Accept': 'application/json' }
        });
        
        const resData = response.data;
        
        if (!resData.status) {
            throw new Error(resData.message || "API Kael menolak permintaan YouTube");
        }
        if (!resData.result) {
            throw new Error("Data YouTube tidak ditemukan dari API");
        }

        const data = resData.result;

        return {
            author: "YouTube", 
            unique_id: "youtube-video", // Sebagai ID default penamaan file
            title: data.title,             
            // Jika user milih mp4, isi video. Jika milih mp3, kosongkan.
            video: data.type === 'mp4' ? data.stream : null,
            cover: data.image,             
            // Jika user milih mp3, isi audio. Jika milih mp4, kosongkan.
            audio: data.type === 'mp3' ? data.stream : null
        };

    } catch (e) {
        const errorMessage = e.response?.data?.message || e.message || "Gagal mengambil data YouTube";
        throw new Error(errorMessage);
    }
}

module.exports = { ytDl };
