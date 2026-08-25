let otakState = null;

const otakTones = [261.6, 329.6, 392.0, 523.3]; // nada beda tiap warna

function otakBeep(freq, duration){
  try{
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch(e){ /* audio tidak wajib, abaikan kalau gagal */ }
}

function startOtak(){
  const tiles = document.querySelectorAll('.otak-tile');
  otakState = {
    sequence: [],
    playerStep: 0,
    level: 0,
    accepting: false,
    over: false
  };
  document.getElementById('otakScore').textContent = '0';
  document.getElementById('otakHint').textContent = 'Perhatiin urutan warna yang nyala...';
  tiles.forEach(t => t.classList.remove('lit','wrong'));

  document.getElementById('otakRestart').onclick = ()=> startOtak();

  tiles.forEach(tile=>{
    tile.onclick = ()=> handleOtakTap(parseInt(tile.dataset.idx));
  });

  nextOtakRound();
}

function nextOtakRound(){
  if (otakState.over) return;
  otakState.sequence.push(Math.floor(Math.random()*4));
  otakState.playerStep = 0;
  otakState.accepting = false;
  otakState.level = otakState.sequence.length - 1;
  document.getElementById('otakScore').textContent = otakState.level;
  document.getElementById('otakHint').textContent = 'Perhatiin urutan warna yang nyala...';
  playOtakSequence();
}

function playOtakSequence(){
  const tiles = document.querySelectorAll('.otak-tile');
  const seq = otakState.sequence;
  const speed = Math.max(280, 620 - otakState.level * 25);
  let i = 0;

  function step(){
    if (i > 0) tiles[seq[i-1]].classList.remove('lit');
    if (i >= seq.length){
      otakState.accepting = true;
      document.getElementById('otakHint').textContent = 'Giliran kamu — tiru urutannya';
      return;
    }
    const idx = seq[i];
    tiles[idx].classList.add('lit');
    otakBeep(otakTones[idx], speed/1000 * 0.8);
    i++;
    setTimeout(step, speed);
  }
  setTimeout(step, 500);
}

function handleOtakTap(idx){
  if (!otakState || !otakState.accepting || otakState.over) return;
  const tiles = document.querySelectorAll('.otak-tile');
  const expected = otakState.sequence[otakState.playerStep];

  tiles[idx].classList.add('lit');
  otakBeep(otakTones[idx], 0.15);
  setTimeout(()=> tiles[idx].classList.remove('lit'), 150);

  if (idx !== expected){
    otakState.over = true;
    otakState.accepting = false;
    tiles[idx].classList.add('wrong');
    document.getElementById('otakHint').textContent = 'Salah urutan! Level akhir: ' + otakState.level;
    return;
  }

  otakState.playerStep++;
  if (otakState.playerStep >= otakState.sequence.length){
    otakState.accepting = false;
    document.getElementById('otakHint').textContent = 'Mantap! Lanjut level berikutnya...';
    setTimeout(nextOtakRound, 700);
  }
}

function stopOtak(){
  if (otakState) otakState.over = true;
}
