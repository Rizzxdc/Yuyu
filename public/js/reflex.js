let reflexState = null;
let reflexRaf = null;

function startReflex(){
  stopReflex();
  const canvas = document.getElementById('reflexCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  reflexState = {
    lives: 3,
    score: 0,
    over: false,
    target: null,     // {x, y, r, type: 'good'|'bad', life, maxLife}
    spawnAt: 0
  };
  document.getElementById('reflexScore').textContent = '0';
  document.getElementById('reflexLives').textContent = '3';

  function spawnTarget(){
    const r = 26;
    const pad = r + 10;
    const x = pad + Math.random() * (W - pad * 2);
    const y = pad + Math.random() * (H - pad * 2);
    const isBad = Math.random() < 0.28;
    const maxLife = Math.max(650, 1300 - reflexState.score * 20);
    reflexState.target = { x, y, r, type: isBad ? 'bad' : 'good', life: maxLife, maxLife };
  }

  function loseLife(){
    reflexState.lives--;
    document.getElementById('reflexLives').textContent = Math.max(0, reflexState.lives);
    if (reflexState.lives <= 0){
      reflexState.over = true;
    } else {
      spawnTarget();
    }
  }

  spawnTarget();

  let lastTs = null;
  function loop(ts){
    if (reflexState.over){
      draw();
      return;
    }
    if (lastTs == null) lastTs = ts;
    const dt = ts - lastTs;
    lastTs = ts;

    reflexState.target.life -= dt;
    if (reflexState.target.life <= 0){
      if (reflexState.target.type === 'good'){
        loseLife();
      } else {
        spawnTarget();
      }
    }

    draw();
    reflexRaf = requestAnimationFrame(loop);
  }

  function draw(){
    ctx.fillStyle = '#0f1830';
    ctx.fillRect(0,0,W,H);

    const t = reflexState.target;
    if (t){
      const pct = Math.max(0, t.life / t.maxLife);
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r + 8, -Math.PI/2, -Math.PI/2 + pct * Math.PI * 2);
      ctx.strokeStyle = t.type === 'good' ? '#3b82f6' : '#ff5d6c';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r, 0, Math.PI*2);
      ctx.fillStyle = t.type === 'good' ? 'rgba(59,130,246,0.85)' : 'rgba(255,93,108,0.85)';
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.type === 'good' ? '✓' : '✕', t.x, t.y + 1);
    }

    if (reflexState.over){
      ctx.fillStyle = 'rgba(10,13,22,0.85)';
      ctx.fillRect(0,0,W,H);
      ctx.fillStyle = '#e9ecf5';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', W/2, H/2 - 8);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#7b8299';
      ctx.fillText('Skor akhir: ' + reflexState.score, W/2, H/2 + 16);
    }
  }

  reflexRaf = requestAnimationFrame(loop);

  function handleTap(clientX, clientY){
    if (reflexState.over || !reflexState.target) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    const t = reflexState.target;
    const dist = Math.hypot(x - t.x, y - t.y);
    if (dist <= t.r){
      if (t.type === 'good'){
        reflexState.score += 10;
        document.getElementById('reflexScore').textContent = reflexState.score;
        spawnTarget();
      } else {
        loseLife();
      }
    }
  }

  canvas.onclick = (e)=> handleTap(e.clientX, e.clientY);
  canvas.ontouchstart = (e)=>{
    e.preventDefault();
    const t = e.touches[0];
    handleTap(t.clientX, t.clientY);
  };

  document.getElementById('reflexRestart').onclick = ()=> startReflex();
}

function stopReflex(){
  if (reflexRaf) cancelAnimationFrame(reflexRaf);
  reflexRaf = null;
}
