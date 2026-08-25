let dinoState = null;
let dinoRaf = null;

function startDino(){
  stopDino();
  const canvas = document.getElementById('dinoCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const groundY = H - 40;

  dinoState = {
    dinoY: groundY,
    vy: 0,
    jumping: false,
    obstacles: [],
    speed: 4.2,
    spawnTimer: 0,
    frame: 0,
    score: 0,
    over: false
  };
  document.getElementById('dinoScore').textContent = '0';

  function spawnObstacle(){
    const h = 24 + Math.random() * 20;
    dinoState.obstacles.push({ x: W + 10, w: 16 + Math.random() * 10, h });
  }
  spawnObstacle();

  function loop(){
    if (dinoState.over){ draw(); return; }

    dinoState.frame++;
    dinoState.score = Math.floor(dinoState.frame / 6);
    document.getElementById('dinoScore').textContent = dinoState.score;
    dinoState.speed = Math.min(9, 4.2 + dinoState.frame / 900);

    if (dinoState.jumping){
      dinoState.vy += 0.55;
      dinoState.dinoY += dinoState.vy;
      if (dinoState.dinoY >= groundY){
        dinoState.dinoY = groundY;
        dinoState.jumping = false;
        dinoState.vy = 0;
      }
    }

    dinoState.spawnTimer++;
    const nextSpawn = Math.max(55, 100 - dinoState.frame / 30);
    if (dinoState.spawnTimer > nextSpawn){
      dinoState.spawnTimer = 0;
      spawnObstacle();
    }

    dinoState.obstacles.forEach(o => { o.x -= dinoState.speed; });
    dinoState.obstacles = dinoState.obstacles.filter(o => o.x > -30);

    const dinoX = 50, dinoSize = 22;
    dinoState.obstacles.forEach(o => {
      const withinX = dinoX + dinoSize / 2 > o.x && dinoX - dinoSize / 2 < o.x + o.w;
      const dinoBottom = dinoState.dinoY;
      const dinoTop = dinoState.dinoY - dinoSize;
      const obsTop = groundY - o.h;
      if (withinX && dinoBottom > obsTop){
        dinoState.over = true;
      }
    });

    draw();
    dinoRaf = requestAnimationFrame(loop);
  }

  function draw(){
    ctx.fillStyle = '#0f1830';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();

    const dinoX = 50, dinoSize = 22;
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(dinoX - dinoSize / 2, dinoState.dinoY - dinoSize, dinoSize, dinoSize);

    ctx.fillStyle = '#34d17a';
    dinoState.obstacles.forEach(o => {
      ctx.fillRect(o.x, groundY - o.h, o.w, o.h);
    });

    if (dinoState.over){
      ctx.fillStyle = 'rgba(10,13,22,0.85)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#e9ecf5';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', W / 2, H / 2 - 8);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#7b8299';
      ctx.fillText('Skor akhir: ' + dinoState.score, W / 2, H / 2 + 16);
    }
  }

  draw();
  dinoRaf = requestAnimationFrame(loop);

  function doJump(){
    if (dinoState.over || dinoState.jumping) return;
    dinoState.jumping = true;
    dinoState.vy = -10.5;
  }

  canvas.onclick = doJump;
  canvas.ontouchstart = (e) => { e.preventDefault(); doJump(); };
  document.addEventListener('keydown', dinoKeyHandler);

  document.getElementById('dinoRestart').onclick = () => startDino();
}

function dinoKeyHandler(e){
  if (e.code === 'Space' && dinoState && !dinoState.over && !dinoState.jumping){
    dinoState.jumping = true;
    dinoState.vy = -10.5;
  }
}

function stopDino(){
  if (dinoRaf) cancelAnimationFrame(dinoRaf);
  dinoRaf = null;
  document.removeEventListener('keydown', dinoKeyHandler);
      }
