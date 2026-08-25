let balloonState = null;
let balloonRaf = null;

function startBalloon(){
  stopBalloon();
  const canvas = document.getElementById('balloonCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const colors = ['#ff5d6c', '#ffb648', '#34d17a', '#a78bfa', '#22e5ff', '#ff8fd6'];

  balloonState = {
    balloons: [],
    particles: [],
    spawnTimer: 0,
    combo: 0,
    lives: 3,
    score: 0,
    over: false
  };
  document.getElementById('balloonScore').textContent = '0';
  document.getElementById('balloonLives').textContent = '3';

  function spawnBalloon(){
    const isBomb = Math.random() < 0.16;
    const r = 16 + Math.random() * 10;
    const x = r + Math.random() * (W - r * 2);
    balloonState.balloons.push({
      x, y: H + r,
      r,
      speed: 1.4 + Math.random() * 1.6,
      sway: Math.random() * Math.PI * 2,
      isBomb,
      color: isBomb ? '#2b2b2b' : colors[Math.floor(Math.random() * colors.length)],
      popped: false,
      popAge: 0
    });
  }

  function addBurst(x, y, color){
    for (let i = 0; i < 10; i++){
      const angle = (Math.PI * 2 * i) / 10;
      balloonState.particles.push({
        x, y,
        vx: Math.cos(angle) * (2 + Math.random() * 2),
        vy: Math.sin(angle) * (2 + Math.random() * 2),
        life: 1, color
      });
    }
  }

  function loseLife(){
    balloonState.lives--;
    document.getElementById('balloonLives').textContent = Math.max(0, balloonState.lives);
    balloonState.combo = 0;
    if (balloonState.lives <= 0) balloonState.over = true;
  }

  function loop(){
    if (balloonState.over){ draw(); return; }

    balloonState.spawnTimer++;
    if (balloonState.spawnTimer > 40){
      balloonState.spawnTimer = 0;
      spawnBalloon();
    }

    balloonState.balloons.forEach(b => {
      if (b.popped) return;
      b.sway += 0.05;
      b.x += Math.sin(b.sway) * 0.6;
      b.y -= b.speed;
    });
    balloonState.balloons = balloonState.balloons.filter(b => {
      if (b.popped){
        b.popAge++;
        return b.popAge < 10;
      }
      return b.y + b.r > -20;
    });

    balloonState.particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.05;
    });
    balloonState.particles = balloonState.particles.filter(p => p.life > 0);

    draw();
    balloonRaf = requestAnimationFrame(loop);
  }

  function draw(){
    ctx.fillStyle = '#0f1830';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#e9ecf5';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    if (balloonState.combo > 1){
      ctx.fillStyle = '#ffb648';
      ctx.fillText('Combo x' + balloonState.combo, 10, 20);
    }

    balloonState.balloons.forEach(b => {
      if (b.popped){
        ctx.globalAlpha = Math.max(0, 1 - b.popAge / 10);
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * (1 + b.popAge / 10), 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        return;
      }
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, b.r * 0.85, b.r, 0, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(b.x - b.r * 0.25, b.y - b.r * 0.3, b.r * 0.25, b.r * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + b.r);
      ctx.lineTo(b.x, b.y + b.r + 10);
      ctx.stroke();
      if (b.isBomb){
        ctx.fillStyle = '#ff5d6c';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💣', b.x, b.y + 5);
      }
    });

    balloonState.particles.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    if (balloonState.over){
      ctx.fillStyle = 'rgba(10,13,22,0.85)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#e9ecf5';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', W / 2, H / 2 - 8);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#7b8299';
      ctx.fillText('Skor akhir: ' + balloonState.score, W / 2, H / 2 + 16);
    }
  }

  draw();
  balloonRaf = requestAnimationFrame(loop);

  function pointFromEvent(e){
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width, scaleY = H / rect.height;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
  }

  function handleTap(e){
    if (balloonState.over) return;
    e.preventDefault();
    const p = pointFromEvent(e);
    for (const b of balloonState.balloons){
      if (b.popped) continue;
      const dist = Math.hypot(p.x - b.x, p.y - b.y);
      if (dist <= b.r + 6){
        if (b.isBomb){
          loseLife();
        } else {
          b.popped = true;
          b.popAge = 0;
          balloonState.combo++;
          const gain = 10 * Math.min(5, balloonState.combo);
          balloonState.score += gain;
          document.getElementById('balloonScore').textContent = balloonState.score;
          addBurst(b.x, b.y, b.color);
        }
        break;
      }
    }
  }

  canvas.onclick = handleTap;
  canvas.ontouchstart = handleTap;

  document.getElementById('balloonRestart').onclick = () => startBalloon();
}

function stopBalloon(){
  if (balloonRaf) cancelAnimationFrame(balloonRaf);
  balloonRaf = null;
      }
        
