let fruitState = null;
let fruitRaf = null;

function startFruit(){
  stopFruit();
  const canvas = document.getElementById('fruitCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const colors = ['#ff5d6c', '#ffb648', '#34d17a', '#a78bfa', '#22e5ff'];

  fruitState = {
    items: [],
    lives: 3,
    score: 0,
    over: false,
    spawnTimer: 0,
    trail: []
  };
  document.getElementById('fruitScore').textContent = '0';
  document.getElementById('fruitLives').textContent = '3';

  function spawnItem(){
    const isBomb = Math.random() < 0.18;
    const x = 40 + Math.random() * (W - 80);
    fruitState.items.push({
      x, y: H + 20,
      vx: (Math.random() - 0.5) * 2.4,
      vy: -(9 + Math.random() * 3),
      r: 20,
      isBomb,
      color: isBomb ? '#333' : colors[Math.floor(Math.random() * colors.length)],
      sliced: false,
      missed: false
    });
  }

  function loseLife(){
    fruitState.lives--;
    document.getElementById('fruitLives').textContent = Math.max(0, fruitState.lives);
    if (fruitState.lives <= 0) fruitState.over = true;
  }

  function loop(){
    if (fruitState.over){ draw(); return; }

    fruitState.spawnTimer++;
    if (fruitState.spawnTimer > 55){
      fruitState.spawnTimer = 0;
      spawnItem();
    }

    fruitState.items.forEach(it => {
      it.vy += 0.28;
      it.x += it.vx;
      it.y += it.vy;
      if (!it.sliced && !it.missed && it.y > H + 30 && it.vy > 0){
        it.missed = true;
        if (!it.isBomb) loseLife();
      }
    });
    fruitState.items = fruitState.items.filter(it => it.y < H + 40 && !(it.sliced && it.sliceAge > 12));
    fruitState.items.forEach(it => { if (it.sliced) it.sliceAge = (it.sliceAge || 0) + 1; });

    fruitState.trail = fruitState.trail.filter(p => Date.now() - p.t < 120);

    draw();
    fruitRaf = requestAnimationFrame(loop);
  }

  function draw(){
    ctx.fillStyle = '#0f1830';
    ctx.fillRect(0, 0, W, H);

    if (fruitState.trail.length > 1){
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      fruitState.trail.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }

    fruitState.items.forEach(it => {
      if (it.sliced){
        ctx.globalAlpha = Math.max(0, 1 - (it.sliceAge || 0) / 12);
        ctx.beginPath();
        ctx.arc(it.x - 6, it.y, it.r * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = it.color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(it.x + 6, it.y, it.r * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        return;
      }
      ctx.beginPath();
      ctx.arc(it.x, it.y, it.r, 0, Math.PI * 2);
      ctx.fillStyle = it.color;
      ctx.fill();
      if (it.isBomb){
        ctx.fillStyle = '#ff5d6c';
        ctx.fillRect(it.x - 2, it.y - it.r - 8, 4, 8);
        ctx.beginPath();
        ctx.arc(it.x, it.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#888';
        ctx.fill();
      }
    });

    if (fruitState.over){
      ctx.fillStyle = 'rgba(10,13,22,0.85)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#e9ecf5';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', W / 2, H / 2 - 8);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#7b8299';
      ctx.fillText('Skor akhir: ' + fruitState.score, W / 2, H / 2 + 16);
    }
  }

  draw();
  fruitRaf = requestAnimationFrame(loop);

  function pointFromEvent(e){
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width, scaleY = H / rect.height;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
  }

  function handleMove(e){
    if (fruitState.over) return;
    e.preventDefault();
    const p = pointFromEvent(e);
    fruitState.trail.push({ x: p.x, y: p.y, t: Date.now() });
    if (fruitState.trail.length > 12) fruitState.trail.shift();

    fruitState.items.forEach(it => {
      if (it.sliced || it.missed) return;
      const dist = Math.hypot(p.x - it.x, p.y - it.y);
      if (dist <= it.r + 6){
        if (it.isBomb){
          fruitState.over = true;
        } else {
          it.sliced = true;
          it.sliceAge = 0;
          fruitState.score += 10;
          document.getElementById('fruitScore').textContent = fruitState.score;
        }
      }
    });
  }

  canvas.onmousedown = handleMove;
  canvas.onmousemove = (e) => { if (e.buttons === 1) handleMove(e); };
  canvas.ontouchstart = handleMove;
  canvas.ontouchmove = handleMove;

  document.getElementById('fruitRestart').onclick = () => startFruit();
}

function stopFruit(){
  if (fruitRaf) cancelAnimationFrame(fruitRaf);
  fruitRaf = null;
                                                                   }
              
