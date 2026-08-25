let flappyState = null;
let flappyRaf = null;

function startFlappy(){
  stopFlappy();
  const canvas = document.getElementById('flappyCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  flappyState = {
    birdY: H / 2,
    birdV: 0,
    gravity: 0.45,
    flap: -7.2,
    pipes: [],
    pipeGap: 110,
    pipeW: 52,
    speed: 2.6,
    spawnTimer: 0,
    score: 0,
    over: false
  };
  document.getElementById('flappyScore').textContent = '0';

  function spawnPipe(){
    const gapY = 40 + Math.random() * (H - 80 - flappyState.pipeGap);
    flappyState.pipes.push({ x: W + 10, gapY, passed: false });
  }
  spawnPipe();

  function endGame(){
    flappyState.over = true;
  }

  function loop(){
    if (flappyState.over){ draw(); return; }

    flappyState.birdV += flappyState.gravity;
    flappyState.birdY += flappyState.birdV;

    if (flappyState.birdY < 12 || flappyState.birdY > H - 12){
      endGame();
    }

    flappyState.spawnTimer++;
    if (flappyState.spawnTimer > 95){
      flappyState.spawnTimer = 0;
      spawnPipe();
    }

    flappyState.pipes.forEach(p => { p.x -= flappyState.speed; });
    flappyState.pipes = flappyState.pipes.filter(p => p.x > -flappyState.pipeW - 5);

    const bx = 60, br = 11;
    flappyState.pipes.forEach(p => {
      if (!p.passed && p.x + flappyState.pipeW < bx){
        p.passed = true;
        flappyState.score++;
        document.getElementById('flappyScore').textContent = flappyState.score;
      }
      const withinX = bx + br > p.x && bx - br < p.x + flappyState.pipeW;
      if (withinX){
        const topH = p.gapY;
        const botY = p.gapY + flappyState.pipeGap;
        if (flappyState.birdY - br < topH || flappyState.birdY + br > botY){
          endGame();
        }
      }
    });

    draw();
    flappyRaf = requestAnimationFrame(loop);
  }

  function draw(){
    ctx.fillStyle = '#0f1830';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#1a2440';
    for (let i = 0; i < 4; i++){
      ctx.beginPath();
      ctx.arc(40 + i * 90, 40, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    flappyState.pipes.forEach(p => {
      ctx.fillStyle = '#34d17a';
      ctx.fillRect(p.x, 0, flappyState.pipeW, p.gapY);
      ctx.fillRect(p.x, p.gapY + flappyState.pipeGap, flappyState.pipeW, H - (p.gapY + flappyState.pipeGap));
      ctx.fillStyle = '#22b866';
      ctx.fillRect(p.x - 3, p.gapY - 14, flappyState.pipeW + 6, 14);
      ctx.fillRect(p.x - 3, p.gapY + flappyState.pipeGap, flappyState.pipeW + 6, 14);
    });

    ctx.save();
    ctx.translate(60, flappyState.birdY);
    ctx.rotate(Math.max(-0.5, Math.min(1, flappyState.birdV / 10)));
    ctx.fillStyle = '#ffb648';
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(4, -3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e0323f';
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(18, -2);
    ctx.lineTo(18, 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    if (flappyState.over){
      ctx.fillStyle = 'rgba(10,13,22,0.85)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#e9ecf5';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', W / 2, H / 2 - 8);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#7b8299';
      ctx.fillText('Skor akhir: ' + flappyState.score, W / 2, H / 2 + 16);
    }
  }

  draw();
  flappyRaf = requestAnimationFrame(loop);

  function doFlap(){
    if (flappyState.over) return;
    flappyState.birdV = flappyState.flap;
  }

  canvas.onclick = doFlap;
  canvas.ontouchstart = (e) => { e.preventDefault(); doFlap(); };

  document.getElementById('flappyRestart').onclick = () => startFlappy();
}

function stopFlappy(){
  if (flappyRaf) cancelAnimationFrame(flappyRaf);
  flappyRaf = null;
}
