let stackState = null;
let stackRaf = null;

const stackColors = ['#3b82f6','#2f6bff','#7c5cff','#ff6ba0','#ffb648','#34d17a'];

function startStack(){
  stopStack();
  const canvas = document.getElementById('stackCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const blockHeight = 32;

  stackState = {
    blocks: [{ x: W/2 - 90, w: 180, colorIdx: 0 }],
    current: null,
    dir: 1,
    speed: 2.6,
    cameraY: 0,
    over: false,
    score: 0
  };
  document.getElementById('stackScore').textContent = '0';

  function newCurrentBlock(){
    const last = stackState.blocks[stackState.blocks.length - 1];
    stackState.current = {
      x: 10,
      w: last.w,
      colorIdx: (last.colorIdx + 1) % stackColors.length
    };
    stackState.dir = Math.random() < 0.5 ? -1 : 1;
    if (stackState.dir < 0) stackState.current.x = W - last.w - 10;
  }
  newCurrentBlock();

  function drop(){
    if (stackState.over) return;
    const last = stackState.blocks[stackState.blocks.length - 1];
    const cur = stackState.current;

    const overlapStart = Math.max(last.x, cur.x);
    const overlapEnd = Math.min(last.x + last.w, cur.x + cur.w);
    const overlapW = overlapEnd - overlapStart;

    if (overlapW <= 4){
      stackState.over = true;
      return;
    }

    stackState.blocks.push({ x: overlapStart, w: overlapW, colorIdx: cur.colorIdx });
    stackState.score = stackState.blocks.length - 1;
    document.getElementById('stackScore').textContent = stackState.score;
    stackState.speed = Math.min(7, 2.6 + stackState.score * 0.15);

    const towerHeight = stackState.blocks.length * blockHeight;
    if (towerHeight > H - 120){
      stackState.cameraY = towerHeight - (H - 120);
    }

    newCurrentBlock();
  }

  function draw(){
    ctx.fillStyle = '#0e1220';
    ctx.fillRect(0,0,W,H);

    stackState.blocks.forEach((b, i) => {
      const y = H - (i + 1) * blockHeight + stackState.cameraY;
      if (y > H || y < -blockHeight) return;
      ctx.fillStyle = stackColors[b.colorIdx];
      ctx.fillRect(b.x, y, b.w, blockHeight - 2);
    });

    if (!stackState.over){
      const i = stackState.blocks.length;
      const y = H - (i + 1) * blockHeight + stackState.cameraY;
      ctx.fillStyle = stackColors[stackState.current.colorIdx];
      ctx.fillRect(stackState.current.x, y, stackState.current.w, blockHeight - 2);
    }

    if (stackState.over){
      ctx.fillStyle = 'rgba(10,13,22,0.85)';
      ctx.fillRect(0,0,W,H);
      ctx.fillStyle = '#e9ecf5';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', W/2, H/2 - 8);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#7b8299';
      ctx.fillText('Tinggi menara: ' + stackState.score, W/2, H/2 + 16);
    }
  }

  function loop(){
    if (stackState.over){
      draw();
      return;
    }
    const cur = stackState.current;
    cur.x += stackState.dir * stackState.speed;
    if (cur.x <= 0){ cur.x = 0; stackState.dir = 1; }
    if (cur.x + cur.w >= W){ cur.x = W - cur.w; stackState.dir = -1; }

    draw();
    stackRaf = requestAnimationFrame(loop);
  }

  draw();
  stackRaf = requestAnimationFrame(loop);

  canvas.onclick = ()=> drop();
  canvas.ontouchstart = (e)=>{ e.preventDefault(); drop(); };
  window.addEventListener('keydown', stackKeyHandler);

  document.getElementById('stackRestart').onclick = ()=> startStack();

  stackState._drop = drop;
}

function stackKeyHandler(e){
  if (!stackState) return;
  if (e.key === ' ' || e.key === 'ArrowUp'){
    e.preventDefault();
    stackState._drop();
  }
}

function stopStack(){
  if (stackRaf) cancelAnimationFrame(stackRaf);
  stackRaf = null;
  window.removeEventListener('keydown', stackKeyHandler);
}
