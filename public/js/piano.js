let pianoState = null;
let pianoRaf = null;

function startPiano(){
  stopPiano();
  const canvas = document.getElementById('pianoCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const lanes = 4;
  const laneW = W / lanes;
  const tileH = 90;
  const tapZoneTop = H - 90;

  pianoState = {
    tiles: [],
    speed: 4.2,
    lastLane: -1,
    spawnY: -tileH,
    score: 0,
    over: false,
    flashes: []
  };
  document.getElementById('pianoScore').textContent = '0';

  function spawnTile(){
    let lane = Math.floor(Math.random() * lanes);
    if (lane === pianoState.lastLane && Math.random() < 0.6){
      lane = (lane + 1 + Math.floor(Math.random() * (lanes - 1))) % lanes;
    }
    pianoState.lastLane = lane;
    pianoState.tiles.push({ lane, y: pianoState.spawnY, tapped: false, missed: false });
  }
  spawnTile();

  function loop(){
    if (pianoState.over){ draw(); return; }

    pianoState.speed = Math.min(11, 4.2 + pianoState.score / 40);

    pianoState.tiles.forEach(t => { if (!t.tapped) t.y += pianoState.speed; });

    const lastTile = pianoState.tiles[pianoState.tiles.length - 1];
    if (!lastTile || lastTile.y > tileH + 20){
      spawnTile();
    }

    pianoState.tiles.forEach(t => {
      if (!t.tapped && !t.missed && t.y > H){
        t.missed = true;
        pianoState.over = true;
      }
    });

    pianoState.tiles = pianoState.tiles.filter(t => t.y < H + tileH || t.tapped && t.fadeAge < 10);
    pianoState.tiles.forEach(t => { if (t.tapped) t.fadeAge = (t.fadeAge || 0) + 1; });
    pianoState.tiles = pianoState.tiles.filter(t => !(t.tapped && t.fadeAge > 8));

    pianoState.flashes = pianoState.flashes.filter(f => { f.life -= 0.08; return f.life > 0; });

    draw();
    pianoRaf = requestAnimationFrame(loop);
  }

  function draw(){
    ctx.fillStyle = '#12182b';
    ctx.fillRect(0, 0, W, H);

    for (let i = 1; i < lanes; i++){
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(i * laneW, 0);
      ctx.lineTo(i * laneW, H);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(59,130,246,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, tapZoneTop);
    ctx.lineTo(W, tapZoneTop);
    ctx.stroke();

    pianoState.flashes.forEach(f => {
      ctx.globalAlpha = Math.max(0, f.life);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(f.lane * laneW, tapZoneTop, laneW, H - tapZoneTop);
      ctx.globalAlpha = 1;
    });

    pianoState.tiles.forEach(t => {
      if (t.tapped){
        ctx.globalAlpha = Math.max(0, 1 - (t.fadeAge || 0) / 8);
      }
      ctx.fillStyle = '#1c2540';
      ctx.fillRect(t.lane * laneW + 3, t.y, laneW - 6, tileH - 6);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(t.lane * laneW + 3, t.y, laneW - 6, 4);
      ctx.globalAlpha = 1;
    });

    if (pianoState.over){
      ctx.fillStyle = 'rgba(10,13,22,0.85)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#e9ecf5';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', W / 2, H / 2 - 8);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#7b8299';
      ctx.fillText('Skor akhir: ' + pianoState.score, W / 2, H / 2 + 16);
    }
  }

  draw();
  pianoRaf = requestAnimationFrame(loop);

  function pointerX(e){
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    return (cx - rect.left) * scaleX;
  }

  function handleTap(e){
    if (pianoState.over) return;
    e.preventDefault();
    const x = pointerX(e);
    const lane = Math.floor(x / laneW);
    pianoState.flashes.push({ lane, life: 1 });

    const candidate = pianoState.tiles.find(t => t.lane === lane && !t.tapped && t.y + tileH > 0 && t.y < H);
    if (candidate){
      candidate.tapped = true;
      candidate.fadeAge = 0;
      pianoState.score++;
      document.getElementById('pianoScore').textContent = pianoState.score;
    } else {
      pianoState.over = true;
    }
  }

  canvas.onclick = handleTap;
  canvas.ontouchstart = handleTap;

  document.getElementById('pianoRestart').onclick = () => startPiano();
}

function stopPiano(){
  if (pianoRaf) cancelAnimationFrame(pianoRaf);
  pianoRaf = null;
      }
                             
