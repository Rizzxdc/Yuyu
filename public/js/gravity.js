let gravityState = null;
let gravityRaf = null;

function startGravity(){
  stopGravity();
  const canvas = document.getElementById('gravityCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const groundY = H - 30;
  const ceilY = 30;
  const playerX = 60;
  const playerSize = 18;

  gravityState = {
    onFloor: true,           // true = nempel lantai, false = nempel langit-langit
    flipping: false,
    playerY: groundY,
    speed: 3.2,
    distance: 0,
    obstacles: [],           // {x, side: 'floor'|'ceil'}
    lastSpawn: 0,
    over: false
  };

  function spawnObstacle(){
    const side = Math.random() < 0.5 ? 'floor' : 'ceil';
    gravityState.obstacles.push({ x: W + 20, side, passed:false });
  }

  function reset(){
    gravityState.obstacles = [];
    gravityState.distance = 0;
    gravityState.speed = 3.2;
    gravityState.onFloor = true;
    gravityState.over = false;
    document.getElementById('gravityScore').textContent = '0';
  }
  reset();

  function flip(){
    if (gravityState.over) return;
    gravityState.onFloor = !gravityState.onFloor;
  }

  function drawSpike(x, side){
    ctx.fillStyle = '#ff5d6c';
    ctx.beginPath();
    if (side === 'floor'){
      ctx.moveTo(x, groundY);
      ctx.lineTo(x + 14, groundY);
      ctx.lineTo(x + 7, groundY - 22);
    } else {
      ctx.moveTo(x, ceilY);
      ctx.lineTo(x + 14, ceilY);
      ctx.lineTo(x + 7, ceilY + 22);
    }
    ctx.closePath();
    ctx.fill();
  }

  function loop(ts){
    if (gravityState.over) return;

    // background
    ctx.fillStyle = '#131829';
    ctx.fillRect(0,0,W,H);

    // floor & ceiling lines
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, ceilY); ctx.lineTo(W, ceilY); ctx.stroke();

    // move + spawn obstacles
    gravityState.distance += gravityState.speed;
    gravityState.speed = Math.min(7, 3.2 + gravityState.distance / 900);

    if (!gravityState.lastSpawn || gravityState.distance - gravityState.lastSpawn > 130 + Math.random()*60){
      spawnObstacle();
      gravityState.lastSpawn = gravityState.distance;
    }

    gravityState.obstacles.forEach(o => o.x -= gravityState.speed);
    gravityState.obstacles = gravityState.obstacles.filter(o => o.x > -20);

    // draw obstacles + collision
    const targetY = gravityState.onFloor ? groundY : ceilY;
    gravityState.playerY += (targetY - gravityState.playerY) * 0.35;

    gravityState.obstacles.forEach(o => {
      drawSpike(o.x, o.side);
      const hitX = Math.abs(o.x + 7 - playerX) < 16;
      const onSameSide = (o.side === 'floor' && gravityState.onFloor) || (o.side === 'ceil' && !gravityState.onFloor);
      if (hitX && onSameSide){
        gravityState.over = true;
      }
      if (!o.passed && o.x + 14 < playerX){
        o.passed = true;
      }
    });

    // player
    ctx.fillStyle = '#4f8cff';
    ctx.beginPath();
    ctx.arc(playerX, gravityState.playerY - (gravityState.onFloor ? playerSize/2 : -playerSize/2), playerSize/2, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#7c5cff';
    ctx.beginPath();
    ctx.arc(playerX, gravityState.playerY - (gravityState.onFloor ? playerSize/2 : -playerSize/2), playerSize/2 - 5, 0, Math.PI*2);
    ctx.fill();

    const score = Math.floor(gravityState.distance / 10);
    document.getElementById('gravityScore').textContent = score;

    if (gravityState.over){
      ctx.fillStyle = 'rgba(10,13,22,0.85)';
      ctx.fillRect(0,0,W,H);
      ctx.fillStyle = '#e9ecf5';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', W/2, H/2 - 8);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#7b8299';
      ctx.fillText('Skor akhir: ' + score, W/2, H/2 + 16);
      return;
    }

    gravityRaf = requestAnimationFrame(loop);
  }

  gravityRaf = requestAnimationFrame(loop);

  window.addEventListener('keydown', gravityKeyHandler);
  canvas.ontouchstart = (e)=>{ e.preventDefault(); flip(); };
  canvas.onclick = ()=> flip();

  document.getElementById('gravityRestart').onclick = ()=> startGravity();

  gravityState._flip = flip;
}

function gravityKeyHandler(e){
  if (!gravityState) return;
  if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown'){
    e.preventDefault();
    gravityState._flip();
  }
}

function stopGravity(){
  if (gravityRaf) cancelAnimationFrame(gravityRaf);
  gravityRaf = null;
  window.removeEventListener('keydown', gravityKeyHandler);
}
