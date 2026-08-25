let brickState = null;
let brickRaf = null;

function startBrick(){
  stopBrick();
  const canvas = document.getElementById('brickCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const paddleW = 70, paddleH = 12;
  const rows = 5, cols = 7;
  const brickPad = 4;
  const brickW = (W - brickPad * (cols + 1)) / cols;
  const brickH = 18;
  const brickTop = 46;
  const palette = ['#ff5d6c', '#ffb648', '#34d17a', '#22e5ff', '#a78bfa'];

  function buildBricks(){
    const arr = [];
    for (let r = 0; r < rows; r++){
      for (let c = 0; c < cols; c++){
        arr.push({
          x: brickPad + c * (brickW + brickPad),
          y: brickTop + r * (brickH + brickPad),
          w: brickW, h: brickH,
          alive: true,
          color: palette[r % palette.length]
        });
      }
    }
    return arr;
  }

  brickState = {
    paddleX: W / 2 - paddleW / 2,
    ball: { x: W / 2, y: H - 60, vx: 0, vy: 0, r: 6, launched: false },
    bricks: buildBricks(),
    particles: [],
    lives: 3,
    score: 0,
    over: false,
    speedMul: 1
  };
  document.getElementById('brickScore').textContent = '0';
  document.getElementById('brickLives').textContent = '3';

  function resetBall(){
    brickState.ball.x = brickState.paddleX + paddleW / 2;
    brickState.ball.y = H - 60;
    brickState.ball.vx = 0;
    brickState.ball.vy = 0;
    brickState.ball.launched = false;
  }

  function launchBall(){
    if (brickState.ball.launched || brickState.over) return;
    const speed = 5.2 * brickState.speedMul;
    const angle = -Math.PI / 2 + (Math.random() * 0.6 - 0.3);
    brickState.ball.vx = Math.cos(angle) * speed;
    brickState.ball.vy = Math.sin(angle) * speed;
    brickState.ball.launched = true;
  }

  function addParticles(x, y, color){
    for (let i = 0; i < 8; i++){
      const angle = (Math.PI * 2 * i) / 8;
      brickState.particles.push({
        x, y,
        vx: Math.cos(angle) * (1.5 + Math.random() * 1.5),
        vy: Math.sin(angle) * (1.5 + Math.random() * 1.5),
        life: 1, color
      });
    }
  }

  function loseLife(){
    brickState.lives--;
    document.getElementById('brickLives').textContent = Math.max(0, brickState.lives);
    if (brickState.lives <= 0){
      brickState.over = true;
    } else {
      resetBall();
    }
  }

  function loop(){
    if (brickState.over){ draw(); return; }

    const b = brickState.ball;
    if (b.launched){
      b.x += b.vx;
      b.y += b.vy;

      if (b.x - b.r < 0){ b.x = b.r; b.vx *= -1; }
      if (b.x + b.r > W){ b.x = W - b.r; b.vx *= -1; }
      if (b.y - b.r < 0){ b.y = b.r; b.vy *= -1; }

      if (b.y + b.r > H - 24 && b.y + b.r < H - 24 + paddleH + 6 &&
          b.x > brickState.paddleX && b.x < brickState.paddleX + paddleW && b.vy > 0){
        const hitPos = (b.x - brickState.paddleX) / paddleW;
        const angle = (hitPos - 0.5) * Math.PI * 0.7 - Math.PI / 2;
        const speed = Math.hypot(b.vx, b.vy) * 1.02;
        b.vx = Math.cos(angle) * speed;
        b.vy = Math.sin(angle) * speed;
        b.y = H - 24 - b.r - 1;
      }

      if (b.y - b.r > H){
        loseLife();
      }

      brickState.bricks.forEach(brk => {
        if (!brk.alive) return;
        if (b.x + b.r > brk.x && b.x - b.r < brk.x + brk.w && b.y + b.r > brk.y && b.y - b.r < brk.y + brk.h){
          brk.alive = false;
          brickState.score += 10;
          document.getElementById('brickScore').textContent = brickState.score;
          addParticles(b.x, b.y, brk.color);
          const overlapX = Math.min(b.x + b.r - brk.x, brk.x + brk.w - (b.x - b.r));
          const overlapY = Math.min(b.y + b.r - brk.y, brk.y + brk.h - (b.y - b.r));
          if (overlapX < overlapY) b.vx *= -1; else b.vy *= -1;
        }
      });

      if (brickState.bricks.every(brk => !brk.alive)){
        brickState.bricks = buildBricks();
        brickState.speedMul += 0.15;
        resetBall();
      }
    } else {
      b.x = brickState.paddleX + paddleW / 2;
    }

    brickState.particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.life -= 0.05;
    });
    brickState.particles = brickState.particles.filter(p => p.life > 0);

    draw();
    brickRaf = requestAnimationFrame(loop);
  }

  function draw(){
    ctx.fillStyle = '#0f1830';
    ctx.fillRect(0, 0, W, H);

    brickState.bricks.forEach(brk => {
      if (!brk.alive) return;
      ctx.fillStyle = brk.color;
      ctx.fillRect(brk.x, brk.y, brk.w, brk.h);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(brk.x, brk.y, brk.w, 4);
    });

    brickState.particles.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(brickState.paddleX, H - 24, paddleW, paddleH, 6) : ctx.rect(brickState.paddleX, H - 24, paddleW, paddleH);
    ctx.fill();

    const b = brickState.ball;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    if (brickState.over){
      ctx.fillStyle = 'rgba(10,13,22,0.85)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#e9ecf5';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', W / 2, H / 2 - 8);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#7b8299';
      ctx.fillText('Skor akhir: ' + brickState.score, W / 2, H / 2 + 16);
    }
  }

  draw();
  brickRaf = requestAnimationFrame(loop);

  function pointerX(e){
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    return (cx - rect.left) * scaleX;
  }

  function handleMove(e){
    if (brickState.over) return;
    e.preventDefault();
    const x = pointerX(e);
    brickState.paddleX = Math.max(0, Math.min(W - paddleW, x - paddleW / 2));
  }

  function handleTap(e){
    if (brickState.over) return;
    launchBall();
  }

  canvas.onmousemove = (e) => { if (e.buttons === 1) handleMove(e); };
  canvas.ontouchmove = handleMove;
  canvas.onclick = handleTap;
  canvas.ontouchstart = (e) => { handleMove(e); handleTap(e); };

  document.getElementById('brickRestart').onclick = () => startBrick();
}

function stopBrick(){
  if (brickRaf) cancelAnimationFrame(brickRaf);
  brickRaf = null;
}
