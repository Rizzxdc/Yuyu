const dlMeta = {
  instagram: {
    title: '📸 Instagram Downloader',
    placeholder: 'Tempel link postingan/reel Instagram...',
    tip: '💡 Tempel tautan postingan/reel Instagram di bawah untuk mengunduhnya!',
    icon: '<i data-lucide="instagram"></i>'
  },
  tiktok: {
    title: '🎵 TikTok Downloader',
    placeholder: 'Tempel link video TikTok...',
    tip: '💡 Tempel tautan video TikTok di bawah untuk mengunduhnya tanpa watermark!',
    icon: '<i data-lucide="music-2"></i>'
  },
  youtube: {
  title: '▶️ YouTube Downloader',
  placeholder: 'Tempel link video YouTube...',
  tip: '💡 Tempel tautan video YouTube di bawah untuk mengunduhnya!',
  icon: '<iconify-icon icon="mdi:youtube" width="18" style="color:#FF0000"></iconify-icon>'
}

let currentPlatform = null;

// Trik mutlak untuk direct download: Fetch API ke Blob
window.forceDirectDl = async function(e, url, filename) {
  e.preventDefault(); 
  const btn = e.currentTarget;
  const originalHtml = btn.innerHTML;
  
  btn.innerHTML = '⏳ Sedang mengunduh...';
  btn.style.pointerEvents = 'none';
  btn.style.opacity = '0.7';

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Gagal mengambil file');
    
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = filename;
    
    document.body.appendChild(a);
    a.click(); 
    
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  } catch (err) {
    window.open(url, '_blank');
  } finally {
    btn.innerHTML = originalHtml;
    btn.style.pointerEvents = 'auto';
    btn.style.opacity = '1';
    if (window.lucide) lucide.createIcons();
  }
};

function openDownloader(platform){
  currentPlatform = platform;
  const meta = dlMeta[platform] || { title: 'Downloader', placeholder: 'Tempel link di sini...', tip: '💡 Tempel link di bawah untuk mulai.', icon: '' };

  document.getElementById('dlTitle').textContent = meta.title;
  document.getElementById('dlTip').textContent = meta.tip;
  document.getElementById('dlInputIcon').innerHTML = meta.icon;

  const input = document.getElementById('dlUrl');
  input.placeholder = meta.placeholder;
  input.value = '';
  document.getElementById('dlResult').innerHTML = '';

  // --- LOGIKA BARU UNTUK MENU OPSI YOUTUBE ---
  const oldOptions = document.getElementById('ytOptions');
  if (oldOptions) oldOptions.remove(); // Bersihkan opsi lama jika ada

  if (platform === 'youtube') {
    const optionsDiv = document.createElement('div');
    optionsDiv.id = 'ytOptions';
    optionsDiv.style.display = 'flex';
    optionsDiv.style.gap = '10px';
    optionsDiv.style.marginTop = '15px';
    optionsDiv.style.marginBottom = '5px';
    
    optionsDiv.innerHTML = `
      <select id="ytType" style="flex:1; padding:10px; border-radius:8px; border:1px solid #ddd; background:transparent; font-size:14px; outline:none; cursor:pointer;">
        <option value="mp4">Video (MP4)</option>
        <option value="mp3">Audio (MP3)</option>
      </select>
      <select id="ytQuality" style="flex:1; padding:10px; border-radius:8px; border:1px solid #ddd; background:transparent; font-size:14px; outline:none; cursor:pointer;">
        <option value="360">360p</option>
        <option value="480">480p</option>
        <option value="720">720p</option>
        <option value="1080">1080p</option>
      </select>
    `;
    // Sisipkan menu di bawah input URL
    input.parentNode.insertBefore(optionsDiv, input.nextSibling);
    
    // Jika tipe yang dipilih adalah MP3, sembunyikan menu resolusi (karena audio tidak punya resolusi video)
    document.getElementById('ytType').addEventListener('change', (e) => {
        document.getElementById('ytQuality').style.display = e.target.value === 'mp3' ? 'none' : 'block';
    });
  }
  // -------------------------------------------

  document.getElementById('overlayDownloader').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeDownloader(){
  currentPlatform = null;
}

async function submitDownload(){
  const url = document.getElementById('dlUrl').value.trim();
  const resultEl = document.getElementById('dlResult');
  const btn = document.getElementById('dlSubmit');

  if (!url){
    resultEl.innerHTML = '<div class="dl-msg">Isi link-nya dulu ya.</div>';
    return;
  }

  // Tangkap pilihan user jika sedang membuka YouTube
  let type = 'mp4';
  let quality = '360';
  if (currentPlatform === 'youtube') {
      type = document.getElementById('ytType').value;
      quality = document.getElementById('ytQuality').value;
  }

  resultEl.innerHTML = '<div class="dl-msg">⏳ Memproses...</div>';
  btn.style.opacity = '0.6';
  btn.style.pointerEvents = 'none';

  try {
    const res = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Kirim parameter tambahan ke backend
      body: JSON.stringify({ platform: currentPlatform, url, type, quality })
    });
    const data = await res.json();

    if (data.ok && data.data) {
      const items = Array.isArray(data.data) ? data.data : [data.data];
      let html = '<div style="display:flex; flex-direction:column; gap:16px;">';

      items.forEach((d, idx) => {
        const authorName = d.author === 'Instagram' ? '📸 Instagram' : (d.author === 'YouTube' ? '▶️ YouTube' : `@${d.unique_id || d.author || '-'}`);
        const fileSuffix = items.length > 1 ? `-${idx + 1}` : '';
        const safeName = (d.unique_id || 'media') + fileSuffix;

        html += `
          <div class="dl-card">
            <div class="dl-card-head">
              <div class="dl-author">${authorName}</div>
              ${d.title ? `<div class="dl-caption">${d.title}</div>` : ''}
            </div>
            
            ${d.video ? `<video class="dl-video" controls playsinline ${d.cover ? `poster="${d.cover}"` : ''}><source src="${d.video}" type="video/mp4"></video>` : (d.cover ? `<img class="dl-cover" src="${d.cover}">` : '')}
            
            <div class="dl-actions">
              ${d.video ? `<a href="${d.video}" onclick="forceDirectDl(event, this.href, '${safeName}.mp4')" class="dl-action-btn"><i data-lucide="download"></i> Download Video</a>` : ''}
              
              ${!d.video && d.cover && currentPlatform !== 'youtube' ? `<a href="${d.cover}" onclick="forceDirectDl(event, this.href, '${safeName}.jpg')" class="dl-action-btn"><i data-lucide="image"></i> Download Gambar</a>` : ''}
              
              ${d.audio ? `<a href="${d.audio_stream || d.audio}" onclick="forceDirectDl(event, this.href, '${safeName}.mp3')" class="dl-action-btn secondary"><i data-lucide="music"></i> Download Musik (MP3)</a>` : ''}
            </div>
          </div>
        `;
      });

      html += '</div>';
      resultEl.innerHTML = html;
      
      if (window.lucide) lucide.createIcons();
    } else {
      resultEl.innerHTML = `<div class="dl-msg error">${data.message || 'Gagal memproses link.'}</div>`;
    }
  } catch (err) {
    resultEl.innerHTML = '<div class="dl-msg error">Terjadi kesalahan saat menghubungi server.</div>';
  } finally {
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
  }
}

document.getElementById('dlSubmit').addEventListener('click', submitDownload);
