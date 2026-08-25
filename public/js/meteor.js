let meteorState = null;
let meteorRaf = null;

function startMeteor(){
  stopMeteor();
  const canvas = document.getElementById('meteorCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const stars = Array.from({ length: 40 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 1.5 + 0.5,
    tw: Math.random() * Math.PI * 2
  }));

  meteorState = {
    shipX: W / 2,
    targetX: W / 2,
    meteors: [],
    pickups: [],
    trail: [],
    shieldTime: 0,
    spawnTimer: 0,
    pickupTimer: 0,
    frame: 0,
    score: 0,
    over: false
  };
  document.getElementById('meteorScore').textContent = '0';

  function spawnMeteor(){
    const r = 10 + Math.random() * 16;
    const x = r + Math.random() * (W - r * 2);
    const speed = 2.4 + Math.random() * 2 + meteorState.frame / 1400;
    meteorState.meteors.push({ x, y: -r, r, speed, rot: Math.random() * 10 });
  }

  function spawnPickup(){
    const x = 20 + Math.random() * (W - 40);
    meteorState.pickups.push({ x, y: -14, r: 10, speed: 2.6 });
  }

  function loop(){
    if (meteorState.over){ draw(); return; }

    meteorState.frame++;
    meteorState.score = Math.floor(meteorState.frame / 6);
    document.getElementById('meteorScore').textContent = meteorState.score;

    meteorState.shipX += (meteorState.targetX - meteorState.shipX) * 0.18;
    meteorState.trail.push({ x: meteorState.shipX, y: H - 34, life: 1 });
    meteorState.trail.forEach(t => t.life -= 0.06);
    meteorState.trail = meteorState.trail.filter(t => t.life > 0);

    if (meteorState.shieldTime > 0) meteorState.shieldTime--;

    meteorState.spawnTimer++;
    const spawnEvery = Math.max(18, 34 - meteorState.frame / 200);
    if (meteorState.spawnTimer > spawnEvery){
      meteorState.spawnTimer = 0;
      spawnMeteor();
    }

    meteorState.pickupTimer++;
    if (meteorState.pickupTimer > 260){
      meteorState.pickupTimer = 0;
      if (Math.random() < 0.7) spawnPickup();
    }

    meteorState.meteors.forEach(m => { m.y += m.speed; });
    meteorState.meteors = meteorState.meteors.filter(m => m.y - m.r < H + 20);

    meteorState.pickups.forEach(p => { p.y += p.speed; });
    meteorState.pickups = meteorState.pickups.filter(p => p.y - p.r < H + 20);

    const shipR = 11, shipY = H - 34;
    meteorState.meteors.forEach(m => {
      const dist = Math.hypot(m.x - meteorState.shipX, m.y - shipY);
      if (dist < m.r + shipR){
        if (meteorState.shieldTime > 0){
          m.y = H + 999;
        } else {
          meteorState.over = true;
        }
      }
    });

    meteorState.pickups.forEach(p => {
      const dist = Math.hypot(p.x - meteorState.shipX, p.y - shipY);
      if (dist < p.r + shipR){
        p.y = H + 999;
        meteorState.shieldTime = 300;
      }
    });

    draw();
    meteorRaf = requestAnimationFrame(loop);
  }

  function draw(){
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, W, H);

    stars.forEach(s => {
      s.tw += 0.05;
      ctx.globalAlpha = 0.4 + Math.sin(s.tw) * 0.4;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    meteorState.trail.forEach(t => {
      ctx.globalAlpha = Math.max(0, t.life) * 0.5;
      ctx.fillStyle = '#ffb648';
      ctx.beginPath();
      ctx.arc(t.x, t.y + 10, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    meteorState.meteors.forEach(m => {
      ctx.fillStyle = '#8a7362';
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.arc(m.x - m.r * 0.3, m.y - m.r * 0.3, m.r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });

    meteorState.pickups.forEach(p => {
      ctx.fillStyle = '#22e5ff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    const shipY = H - 34;
    if (meteorState.shieldTime > 0){
      ctx.beginPath();
      ctx.arc(meteorState.shipX, shipY, 18, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(34,229,255,0.7)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.save();
    ctx.translate(meteorState.shipX, shipY);
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(11, 12);
    ctx.lineTo(0, 6);
    ctx.lineTo(-11, 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e9ecf5';
    ctx.beginPath();
    ctx.arc(0, -2, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (meteorState.over){
      ctx.fillStyle = 'rgba(10,13,22,0.85)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#e9ecf5';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', W / 2, H / 2 - 8);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#7b8299';
      ctx.fillText('Skor akhir: ' + meteorState.score, W / 2, H / 2 + 16);
    }
  }

  draw();
  meteorRaf = requestAnimationFrame(loop);

  function pointerX(e){
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    return (cx - rect.left) * scaleX;
  }

  function handleMove(e){
    if (meteorState.over) return;
    e.preventDefault();
    meteorState.targetX = Math.max(14, Math.min(W - 14, pointerX(e)));
  }

  canvas.onmousemove = (e) => { if (e.buttons === 1) handleMove(e); };
  canvas.onmousedown = handleMove;
  canvas.ontouchstart = handleMove;
  canvas.ontouchmove = handleMove;

  document.getElementById('meteorRestart').onclick = () => startMeteor();
}

function stopMeteor(){
  if (meteorRaf) cancelAnimationFrame(meteorRaf);
  meteorRaf = null;
}
