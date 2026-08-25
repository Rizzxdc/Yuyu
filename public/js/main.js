/* ---------------- DEVICE / BATTERY INFO ---------------- */
(function(){
  const ua = navigator.userAgent;
  let device = "Desktop";
  if (/android/i.test(ua)) device = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) device = "iOS";
  document.getElementById('deviceVal').textContent = device;

  if (navigator.getBattery) {
    navigator.getBattery().then(b=>{
      const upd = ()=> document.getElementById('batteryVal').textContent = Math.round(b.level*100)+'%';
      upd();
      b.addEventListener('levelchange', upd);
    }).catch(()=>{ document.getElementById('batteryVal').textContent = 'N/A'; });
  } else {
    document.getElementById('batteryVal').textContent = 'N/A';
  }
})();

/* ---------------- TABS FILTER ---------------- */
const tabs = document.querySelectorAll('.tab');
const cards = document.querySelectorAll('.grid .card');
tabs.forEach(tab=>{
  tab.addEventListener('click', ()=>{
    tabs.forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const cat = tab.dataset.cat;
    cards.forEach(c=>{
      c.style.display = (cat==='all' || c.dataset.cat===cat) ? 'flex' : 'none';
    });
  });
});

/* ---------------- OVERLAY OPEN/CLOSE ---------------- */
const overlaySnake = document.getElementById('overlaySnake');
const overlay2048 = document.getElementById('overlay2048');
const overlayGravity = document.getElementById('overlayGravity');
const overlayOtak = document.getElementById('overlayOtak');
const overlayReflex = document.getElementById('overlayReflex');
const overlayStack = document.getElementById('overlayStack');
const overlayDownloader = document.getElementById('overlayDownloader');

document.querySelectorAll('[data-open]').forEach(el=>{
  el.addEventListener('click', ()=>{
    const target = el.dataset.open;
    if (target === 'snake'){ overlaySnake.classList.remove('hidden'); startSnake(); }
    if (target === 'g2048'){ overlay2048.classList.remove('hidden'); startGame2048(); }
    if (target === 'gravity'){ overlayGravity.classList.remove('hidden'); startGravity(); }
    if (target === 'otak'){ overlayOtak.classList.remove('hidden'); startOtak(); }
    if (target === 'reflex'){ overlayReflex.classList.remove('hidden'); startReflex(); }
    if (target === 'stack'){ overlayStack.classList.remove('hidden'); startStack(); }
    if (target && target.startsWith('dl-')){ overlayDownloader.classList.remove('hidden'); openDownloader(el.dataset.platform); }
  });
});
document.querySelectorAll('[data-close]').forEach(el=>{
  el.addEventListener('click', ()=>{
    overlaySnake.classList.add('hidden');
    overlay2048.classList.add('hidden');
    overlayGravity.classList.add('hidden');
    overlayOtak.classList.add('hidden');
    overlayReflex.classList.add('hidden');
    overlayStack.classList.add('hidden');
    overlayDownloader.classList.add('hidden');
    stopSnake();
    stopGravity();
    stopOtak();
    stopReflex();
    stopStack();
    closeDownloader();
    window.removeEventListener('keydown', key2048Handler);
  });
});