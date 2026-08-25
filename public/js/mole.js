let moleState = null;
let moleInterval = null;
let moleTimerInterval = null;

function startMole(){
  stopMole();
  const holes = Array.from(document.querySelectorAll('#moleGrid .mole-hole'));
  holes.forEach(h => {
    h.classList.remove('up');
    h.onclick = null;
  });

  moleState = {
    score: 0,
    time: 30,
    over: false,
    activeIdx: null
  };
  document.getElementById('moleScore').textContent = '0';
  document.getElementById('moleTime').textContent = '30';

  function popRandom(){
    if (moleState.over) return;
    if (moleState.activeIdx !== null){
      holes[moleState.activeIdx].classList.remove('up');
    }
    const idx = Math.floor(Math.random() * holes.length);
    moleState.activeIdx = idx;
    holes[idx].classList.add('up');

    const upTime = Math.max(450, 950 - moleState.score * 8);
    setTimeout(() => {
      if (!moleState.over && moleState.activeIdx === idx){
        holes[idx].classList.remove('up');
        moleState.activeIdx = null;
      }
    }, upTime);
  }

  holes.forEach((h, idx) => {
    h.onclick = () => {
      if (moleState.over) return;
      if (h.classList.contains('up') && moleState.activeIdx === idx){
        moleState.score += 10;
        document.getElementById('moleScore').textContent = moleState.score;
        h.classList.remove('up');
        moleState.activeIdx = null;
        popRandom();
      }
    };
  });

  popRandom();
  moleInterval = setInterval(() => {
    if (Math.random() < 0.4) popRandom();
  }, 700);

  moleTimerInterval = setInterval(() => {
    moleState.time--;
    document.getElementById('moleTime').textContent = Math.max(0, moleState.time);
    if (moleState.time <= 0){
      moleState.over = true;
      clearInterval(moleInterval);
      clearInterval(moleTimerInterval);
      holes.forEach(h => h.classList.remove('up'));
      const hint = document.querySelector('#moleContent .g-hint');
      if (hint) hint.textContent = 'Waktu habis! Skor akhir: ' + moleState.score;
    }
  }, 1000);

  document.getElementById('moleRestart').onclick = () => startMole();
}

function stopMole(){
  if (moleInterval) clearInterval(moleInterval);
  if (moleTimerInterval) clearInterval(moleTimerInterval);
  moleInterval = null;
  moleTimerInterval = null;
}
  
