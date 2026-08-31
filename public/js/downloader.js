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
    icon: '<svg viewBox="0 0 24 24" width="18" height="18"><rect width="24" height="24" rx="6" fill="#FF0000"/><path d="M9.5 8.3v7.4c0 .5.55.8 1 .55l6.4-3.7c.44-.26.44-.9 0-1.15l-6.4-3.7c-.45-.26-1 .05-1 .55z" fill="#fff"/></svg>'
  },
  imgupload: {
    title: '🖼️ Uploader Gambar',
    placeholder: '',
    tip: '💡 Pilih gambar dari galeri buat di-upload dan dapetin link-nya!',
    icon: '<i data-lucide="image-up"></i>'
  },
  npm: {
    title: '📦 NPM Package',
    placeholder: 'Tempel link package npm (npmjs.com/package/...)...',
    tip: '💡 Tempel link package npm di bawah buat cek info & download-nya!',
    icon: '<svg viewBox="0 0 24 24" width="18" height="18"><rect width="24" height="24" rx="4" fill="#CB3837"/><text x="12" y="15.5" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#fff">NPM</text></svg>'
  },
  stalktiktok: {
    title: '🔍 Stalk TikTok',
    placeholder: 'Masukin username TikTok (tanpa @)...',
    tip: '💡 Masukin username TikTok (atau link profilnya) buat liat infonya!',
    icon: '<i data-lucide="search"></i>'
  },
  stalkgithub: {
    title: '🐙 Stalk GitHub',
    placeholder: 'Masukin username GitHub...',
    tip: '💡 Masukin username GitHub (atau link profilnya) buat liat info & repo-nya!',
    icon: '<i data-lucide="github"></i>'
  },
  stalkroblox: {
    title: '🎮 Stalk Roblox',
    placeholder: 'Masukin username Roblox...',
    tip: '💡 Masukin username Roblox buat liat infonya!',
    icon: '<i data-lucide="box"></i>'
  }
};

let currentPlatform = null;

function formatNum(n) {
  const num = Number(n) || 0;
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(num);
}

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

  // --- Bersihkan elemen dinamis dari sesi sebelumnya ---
  const oldOptions = document.getElementById('ytOptions');
  if (oldOptions) oldOptions.remove();
  const oldImgPicker = document.getElementById('imgUploadPicker');
  if (oldImgPicker) oldImgPicker.remove();

  const submitBtn = document.getElementById('dlSubmit');
  const dlInputWrap = input.closest('.dl-input-wrap');

  if (platform === 'imgupload') {
    // Sembunyikan input URL biasa, ganti dengan file picker
    dlInputWrap.style.display = 'none';
    submitBtn.querySelector('span').textContent = 'Upload Gambar';

    const picker = document.createElement('div');
    picker.id = 'imgUploadPicker';
    picker.innerHTML = `
      <input type="file" id="imgUploadFile" accept="image/*" class="hidden">
      <div class="img-upload-drop" id="imgUploadDrop">
        <div class="img-upload-preview hidden" id="imgUploadPreviewWrap">
          <img id="imgUploadPreview" alt="preview">
        </div>
        <div id="imgUploadDropText">
          <i data-lucide="image-plus"></i>
          <div>Tap buat pilih gambar</div>
        </div>
      </div>
    `;
    dlInputWrap.parentNode.insertBefore(picker, dlInputWrap);

    const fileInput = document.getElementById('imgUploadFile');
    const dropZone = document.getElementById('imgUploadDrop');
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('imgUploadPreview').src = e.target.result;
        document.getElementById('imgUploadPreviewWrap').classList.remove('hidden');
        document.getElementById('imgUploadDropText').classList.add('hidden');
      };
      reader.readAsDataURL(file);
    });

    if (window.lucide) lucide.createIcons();
  } else {
    dlInputWrap.style.display = 'flex';
    if (platform === 'npm') {
      submitBtn.querySelector('span').textContent = 'Cek Package';
    } else if (platform === 'stalktiktok' || platform === 'stalkgithub' || platform === 'stalkroblox') {
      submitBtn.querySelector('span').textContent = 'Cek Akun';
    } else {
      submitBtn.querySelector('span').textContent = 'Cari Video';
    }
  }

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
  const resultEl = document.getElementById('dlResult');
  const btn = document.getElementById('dlSubmit');

  if (currentPlatform === 'imgupload') {
    const fileInput = document.getElementById('imgUploadFile');
    const file = fileInput && fileInput.files[0];
    if (!file) {
      resultEl.innerHTML = '<div class="dl-msg">Pilih gambar dulu ya.</div>';
      return;
    }

    resultEl.innerHTML = '<div class="dl-msg">⏳ Mengupload gambar...</div>';
    btn.style.opacity = '0.6';
    btn.style.pointerEvents = 'none';

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/image-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl, fileName: file.name })
      });
      const data = await res.json();

      if (data.ok && data.url) {
        resultEl.innerHTML = `
          <div class="dl-card">
            <div class="dl-card-head"><div class="dl-author">✅ Berhasil di-upload</div></div>
            <img class="dl-cover" src="${data.url}">
            <div class="img-upload-link-row">
              <input type="text" readonly value="${data.url}" id="imgUploadLinkResult">
              <div class="g-btn primary" id="imgUploadCopyBtn">Copy</div>
            </div>
          </div>
        `;
        document.getElementById('imgUploadCopyBtn').addEventListener('click', () => {
          const linkInput = document.getElementById('imgUploadLinkResult');
          linkInput.select();
          navigator.clipboard?.writeText(linkInput.value).catch(() => {});
          document.getElementById('imgUploadCopyBtn').textContent = 'Ke-copy!';
          setTimeout(() => {
            const b = document.getElementById('imgUploadCopyBtn');
            if (b) b.textContent = 'Copy';
          }, 1500);
        });
      } else {
        resultEl.innerHTML = `<div class="dl-msg error">${data.message || 'Gagal upload gambar.'}</div>`;
      }
    } catch (err) {
      resultEl.innerHTML = '<div class="dl-msg error">Terjadi kesalahan saat menghubungi server.</div>';
    } finally {
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    }
    return;
  }

  const url = document.getElementById('dlUrl').value.trim();

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
      if (currentPlatform === 'npm') {
        const p = data.data;
        const depsList = p.dependencies ? Object.keys(p.dependencies) : [];
        const sizeText = p.file_info?.unpacked_size || '-';
        const fileCount = p.file_info?.file_count ?? '-';
        const downloadUrl = p.download;
        const safeFileName = `${(p.name || 'package').replace(/[^a-z0-9@_\-.]/gi, '_')}-${p.latest_version || 'latest'}`;

        let html = `
          <div class="dl-card npm-card">
            <div class="npm-head">
              <div class="npm-name">${p.name || '-'}</div>
              <div class="npm-version-badge">v${p.latest_version || '?'}</div>
            </div>
            ${p.description ? `<div class="npm-desc">${p.description}</div>` : ''}
            <div class="npm-meta-row">
              ${p.license ? `<div class="npm-meta-item"><i data-lucide="scale"></i> ${p.license}</div>` : ''}
              ${p.author && p.author.name ? `<div class="npm-meta-item"><i data-lucide="user"></i> ${p.author.name}</div>` : ''}
              ${p.total_versions ? `<div class="npm-meta-item"><i data-lucide="tags"></i> ${p.total_versions} versi</div>` : ''}
            </div>
            <div class="npm-stats-grid">
              <div class="npm-stat"><div class="npm-stat-val">${p.dependencies_count ?? 0}</div><div class="npm-stat-label">Dependencies</div></div>
              <div class="npm-stat"><div class="npm-stat-val">${p.dev_dependencies_count ?? 0}</div><div class="npm-stat-label">Dev Deps</div></div>
              <div class="npm-stat"><div class="npm-stat-val">${fileCount}</div><div class="npm-stat-label">File</div></div>
              <div class="npm-stat"><div class="npm-stat-val">${sizeText}</div><div class="npm-stat-label">Size</div></div>
            </div>
            ${depsList.length ? `
              <div class="npm-deps-label">Dependencies:</div>
              <div class="npm-deps-list">${depsList.map(d => `<span class="npm-dep-tag">${d}</span>`).join('')}</div>
            ` : ''}
            <div class="dl-actions">
              ${p.homepage ? `<a href="${p.homepage}" target="_blank" rel="noopener" class="dl-action-btn secondary"><i data-lucide="external-link"></i> Homepage</a>` : ''}
              ${downloadUrl ? `<a href="${downloadUrl}" onclick="forceDirectDl(event, this.href, '${safeFileName}.tgz')" class="dl-action-btn"><i data-lucide="download"></i> Download .tgz</a>` : ''}
            </div>
          </div>
        `;

        resultEl.innerHTML = html;
        if (window.lucide) lucide.createIcons();
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        return;
      }

      if (currentPlatform === 'stalktiktok') {
        const r = data.data;
        const verifiedBadge = r.verified ? '<i data-lucide="badge-check" class="stalk-verified"></i>' : '';

        let html = `
          <div class="dl-card stalk-card">
            <div class="stalk-head">
              <img class="stalk-avatar" src="${r.avatar}" alt="avatar" onerror="this.style.display='none'">
              <div class="stalk-head-text">
                <div class="stalk-nickname">${r.nickname || '-'} ${verifiedBadge}</div>
                <div class="stalk-username">@${r.uniqueId || '-'}</div>
              </div>
            </div>
            ${r.signature ? `<div class="stalk-bio">${r.signature}</div>` : ''}
            <div class="stalk-stats-grid">
              <div class="npm-stat"><div class="npm-stat-val">${formatNum(r.followers)}</div><div class="npm-stat-label">Followers</div></div>
              <div class="npm-stat"><div class="npm-stat-val">${formatNum(r.following)}</div><div class="npm-stat-label">Following</div></div>
              <div class="npm-stat"><div class="npm-stat-val">${formatNum(r.likes)}</div><div class="npm-stat-label">Likes</div></div>
              <div class="npm-stat"><div class="npm-stat-val">${formatNum(r.videos)}</div><div class="npm-stat-label">Videos</div></div>
            </div>
            <div class="dl-actions">
              <a href="https://www.tiktok.com/@${r.uniqueId}" target="_blank" rel="noopener" class="dl-action-btn secondary"><i data-lucide="external-link"></i> Buka Profil TikTok</a>
            </div>
          </div>
        `;

        resultEl.innerHTML = html;
        if (window.lucide) lucide.createIcons();
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        return;
      }

      if (currentPlatform === 'stalkgithub') {
        const r = data.data;
        const joinDate = r.created_at
          ? new Date(r.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
          : null;

        const metaItems = [];
        if (r.company) metaItems.push(`<div class="npm-meta-item"><i data-lucide="building-2"></i> ${r.company}</div>`);
        if (r.location) metaItems.push(`<div class="npm-meta-item"><i data-lucide="map-pin"></i> ${r.location}</div>`);
        if (r.blog) {
          const blogHref = r.blog.startsWith('http') ? r.blog : `https://${r.blog}`;
          metaItems.push(`<a href="${blogHref}" target="_blank" rel="noopener" class="npm-meta-item"><i data-lucide="link"></i> ${r.blog}</a>`);
        }
        if (joinDate) metaItems.push(`<div class="npm-meta-item"><i data-lucide="calendar"></i> Sejak ${joinDate}</div>`);

        const repoRows = (r.repositories || []).map(repo => `
          <a href="${repo.url}" target="_blank" rel="noopener" class="gh-repo-row">
            <div class="gh-repo-top">
              <div class="gh-repo-name">${repo.name}</div>
              ${repo.language ? `<div class="gh-repo-lang">${repo.language}</div>` : ''}
            </div>
            ${repo.description ? `<div class="gh-repo-desc">${repo.description}</div>` : ''}
            <div class="gh-repo-stats">
              <span><i data-lucide="star"></i> ${repo.stars ?? 0}</span>
              <span><i data-lucide="git-fork"></i> ${repo.forks ?? 0}</span>
            </div>
          </a>
        `).join('');

        let html = `
          <div class="dl-card stalk-card">
            <div class="stalk-head">
              <img class="stalk-avatar" src="${r.avatar}" alt="avatar" onerror="this.style.display='none'">
              <div class="stalk-head-text">
                <div class="stalk-nickname">${r.name || r.username || '-'}</div>
                <div class="stalk-username">@${r.username || '-'}</div>
              </div>
            </div>
            ${r.bio ? `<div class="stalk-bio">${r.bio}</div>` : ''}
            ${metaItems.length ? `<div class="npm-meta-row">${metaItems.join('')}</div>` : ''}
            <div class="stalk-stats-grid gh-stats-grid">
              <div class="npm-stat"><div class="npm-stat-val">${formatNum(r.public_repos)}</div><div class="npm-stat-label">Repos</div></div>
              <div class="npm-stat"><div class="npm-stat-val">${formatNum(r.followers)}</div><div class="npm-stat-label">Followers</div></div>
              <div class="npm-stat"><div class="npm-stat-val">${formatNum(r.following)}</div><div class="npm-stat-label">Following</div></div>
            </div>
            ${repoRows ? `
              <div class="npm-deps-label">📁 ${r.repositoriesFetched || (r.repositories || []).length} Repo Terbaru:</div>
              <div class="gh-repo-list">${repoRows}</div>
            ` : ''}
            <div class="dl-actions">
              <a href="${r.profile}" target="_blank" rel="noopener" class="dl-action-btn secondary"><i data-lucide="external-link"></i> Buka Profil GitHub</a>
            </div>
          </div>
        `;

        resultEl.innerHTML = html;
        if (window.lucide) lucide.createIcons();
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        return;
      }

      if (currentPlatform === 'stalkroblox') {
        const r = data.data;
        const joinDate = r.created
          ? new Date(r.created).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
          : null;
        const isOnline = r.presence && (r.presence.status || '').toLowerCase() === 'online';
        const statusText = (r.presence && r.presence.status) || 'Unknown';
        const statusBadge = `<span class="rbx-status-badge ${isOnline ? 'online' : 'offline'}">${statusText}</span>`;
        const bannedBadge = r.isBanned ? '<div class="rbx-banned-badge"><i data-lucide="ban"></i> Akun ini di-banned</div>' : '';

        const metaItems = [];
        if (joinDate) metaItems.push(`<div class="npm-meta-item"><i data-lucide="calendar"></i> Sejak ${joinDate}</div>`);
        if (r.id) metaItems.push(`<div class="npm-meta-item"><i data-lucide="hash"></i> ID: ${r.id}</div>`);

        let html = `
          <div class="dl-card stalk-card">
            <div class="stalk-head">
              <img class="stalk-avatar" src="${r.avatar}" alt="avatar" onerror="this.style.display='none'">
              <div class="stalk-head-text">
                <div class="stalk-nickname">${r.displayName || r.username || '-'} ${statusBadge}</div>
                <div class="stalk-username">@${r.username || '-'}</div>
              </div>
            </div>
            ${bannedBadge}
            ${metaItems.length ? `<div class="npm-meta-row">${metaItems.join('')}</div>` : ''}
            <div class="stalk-stats-grid gh-stats-grid">
              <div class="npm-stat"><div class="npm-stat-val">${formatNum(r.social && r.social.friends)}</div><div class="npm-stat-label">Friends</div></div>
              <div class="npm-stat"><div class="npm-stat-val">${formatNum(r.social && r.social.followers)}</div><div class="npm-stat-label">Followers</div></div>
              <div class="npm-stat"><div class="npm-stat-val">${formatNum(r.social && r.social.following)}</div><div class="npm-stat-label">Following</div></div>
            </div>
            <div class="dl-actions">
              <a href="${r.profileUrl}" target="_blank" rel="noopener" class="dl-action-btn secondary"><i data-lucide="external-link"></i> Buka Profil Roblox</a>
            </div>
          </div>
        `;

        resultEl.innerHTML = html;
        if (window.lucide) lucide.createIcons();
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        return;
      }

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
