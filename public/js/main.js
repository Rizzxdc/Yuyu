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
const overlayFlappy = document.getElementById('overlayFlappy');
const overlayMole = document.getElementById('overlayMole');
const overlayMemory = document.getElementById('overlayMemory');
const overlayFruit = document.getElementById('overlayFruit');
const overlayMath = document.getElementById('overlayMath');
const overlayDino = document.getElementById('overlayDino');
const overlayDownloader = document.getElementById('overlayDownloader');

function showStartScreen(prefix){
  document.getElementById(prefix + 'Start').classList.remove('hidden');
  document.getElementById(prefix + 'Content').classList.add('hidden');
}
function showGameContent(prefix){
  document.getElementById(prefix + 'Start').classList.add('hidden');
  document.getElementById(prefix + 'Content').classList.remove('hidden');
}

document.querySelectorAll('[data-open]').forEach(el=>{
  el.addEventListener('click', ()=>{
    const target = el.dataset.open;
    if (target === 'snake'){ overlaySnake.classList.remove('hidden'); showStartScreen('snake'); }
    if (target === 'g2048'){ overlay2048.classList.remove('hidden'); showStartScreen('g2048'); }
    if (target === 'gravity'){ overlayGravity.classList.remove('hidden'); showStartScreen('gravity'); }
    if (target === 'otak'){ overlayOtak.classList.remove('hidden'); showStartScreen('otak'); }
    if (target === 'reflex'){ overlayReflex.classList.remove('hidden'); showStartScreen('reflex'); }
    if (target === 'stack'){ overlayStack.classList.remove('hidden'); showStartScreen('stack'); }
    if (target === 'flappy'){ overlayFlappy.classList.remove('hidden'); showStartScreen('flappy'); }
    if (target === 'mole'){ overlayMole.classList.remove('hidden'); showStartScreen('mole'); }
    if (target === 'memory'){ overlayMemory.classList.remove('hidden'); showStartScreen('memory'); }
    if (target === 'fruit'){ overlayFruit.classList.remove('hidden'); showStartScreen('fruit'); }
    if (target === 'math'){ overlayMath.classList.remove('hidden'); showStartScreen('math'); }
    if (target === 'dino'){ overlayDino.classList.remove('hidden'); showStartScreen('dino'); }
    if (target && target.startsWith('dl-')){ overlayDownloader.classList.remove('hidden'); openDownloader(el.dataset.platform); }
  });
});

document.getElementById('snakeStartBtn').addEventListener('click', ()=>{ showGameContent('snake'); startSnake(); });
document.getElementById('g2048StartBtn').addEventListener('click', ()=>{ showGameContent('g2048'); startGame2048(); });
document.getElementById('gravityStartBtn').addEventListener('click', ()=>{ showGameContent('gravity'); startGravity(); });
document.getElementById('otakStartBtn').addEventListener('click', ()=>{ showGameContent('otak'); startOtak(); });
document.getElementById('reflexStartBtn').addEventListener('click', ()=>{ showGameContent('reflex'); startReflex(); });
document.getElementById('stackStartBtn').addEventListener('click', ()=>{ showGameContent('stack'); startStack(); });
document.getElementById('flappyStartBtn').addEventListener('click', ()=>{ showGameContent('flappy'); startFlappy(); });
document.getElementById('moleStartBtn').addEventListener('click', ()=>{ showGameContent('mole'); startMole(); });
document.getElementById('memoryStartBtn').addEventListener('click', ()=>{ showGameContent('memory'); startMemory(); });
document.getElementById('fruitStartBtn').addEventListener('click', ()=>{ showGameContent('fruit'); startFruit(); });
document.getElementById('mathStartBtn').addEventListener('click', ()=>{ showGameContent('math'); startMath(); });
document.getElementById('dinoStartBtn').addEventListener('click', ()=>{ showGameContent('dino'); startDino(); });

document.querySelectorAll('[data-close]').forEach(el=>{
  el.addEventListener('click', ()=>{
    overlaySnake.classList.add('hidden');
    overlay2048.classList.add('hidden');
    overlayGravity.classList.add('hidden');
    overlayOtak.classList.add('hidden');
    overlayReflex.classList.add('hidden');
    overlayStack.classList.add('hidden');
    overlayFlappy.classList.add('hidden');
    overlayMole.classList.add('hidden');
    overlayMemory.classList.add('hidden');
    overlayFruit.classList.add('hidden');
    overlayMath.classList.add('hidden');
    overlayDino.classList.add('hidden');
    overlayDownloader.classList.add('hidden');
    stopSnake();
    stopGravity();
    stopOtak();
    stopReflex();
    stopStack();
    stopFlappy();
    stopMole();
    stopMemory();
    stopFruit();
    stopMath();
    stopDino();
    closeDownloader();
    window.removeEventListener('keydown', key2048Handler);
    showStartScreen('snake');
    showStartScreen('g2048');
    showStartScreen('gravity');
    showStartScreen('otak');
    showStartScreen('reflex');
    showStartScreen('stack');
    showStartScreen('flappy');
    showStartScreen('mole');
    showStartScreen('memory');
    showStartScreen('fruit');
    showStartScreen('math');
    showStartScreen('dino');
  });
});