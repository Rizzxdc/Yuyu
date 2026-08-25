const axios = require('axios');

async function igDl(url) {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API Key belum di-setting di file .env");

        const endpoint = `https://api.kaelstore.xyz/scrape/instagram?url=${encodeURIComponent(url)}&apikey=${apiKey}`;
        
        const response = await axios.get(endpoint, {
            headers: { 'Accept': 'application/json' }
        });
        
        const resData = response.data;
        
        // Membaca pesan error ASLI dari Kael jika status false
        if (!resData.status) {
            throw new Error(resData.message || "API Kael menolak permintaan IG (Status False)");
        }
        if (!resData.result || resData.result.length === 0) {
            throw new Error("Data Instagram tidak ditemukan dari Kael API");
        }

        return resData.result.map((item, index) => {
            return {
                author: "Instagram", 
                title: `Slide ${index + 1}`,
                // Fallback aman untuk video IG
                video: item.type === 'video' ? (item.stream || item.url) : null,
                cover: item.thumbnail, 
                audio: null
            };
        });

    } catch (e) {
        const errorMessage = e.response?.data?.message || e.message || "Gagal mengambil data IG";
        throw new Error(errorMessage);
    }
}

module.exports = { igDl };
