let snakeState = null;
let snakeTimer = null;

function startSnake(){
  stopSnake();
  const canvas = document.getElementById('snakeCanvas');
  const ctx = canvas.getContext('2d');
  const cols = 16, rows = 16;
  const cell = canvas.width / cols;

  snakeState = {
    snake: [{x:8,y:8},{x:7,y:8},{x:6,y:8}],
    dir: {x:1,y:0},
    nextDir: {x:1,y:0},
    food: null,
    score: 0,
    over: false
  };
  document.getElementById('snakeScore').textContent = '0';

  function spawnFood(){
    let f;
    do{
      f = {x: Math.floor(Math.random()*cols), y: Math.floor(Math.random()*rows)};
    } while(snakeState.snake.some(s=>s.x===f.x && s.y===f.y));
    return f;
  }
  snakeState.food = spawnFood();

  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }

  function draw(){
    ctx.fillStyle = '#131829';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = '#ff5d6c';
    roundRect(ctx, snakeState.food.x*cell+2, snakeState.food.y*cell+2, cell-4, cell-4, 4);
    ctx.fill();

    snakeState.snake.forEach((s,i)=>{
      ctx.fillStyle = i===0 ? '#4f8cff' : '#7c5cff';
      roundRect(ctx, s.x*cell+2, s.y*cell+2, cell-4, cell-4, 5);
      ctx.fill();
    });

    if (snakeState.over){
      ctx.fillStyle = 'rgba(10,13,22,0.85)';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = '#e9ecf5';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 8);
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#7b8299';
      ctx.fillText('Skor akhir: ' + snakeState.score, canvas.width/2, canvas.height/2 + 16);
    }
  }

  function tick(){
    if (snakeState.over) return;
    const d = snakeState.nextDir;
    if (!(d.x === -snakeState.dir.x && d.y === -snakeState.dir.y)) {
      snakeState.dir = d;
    }
    const head = snakeState.snake[0];
    const newHead = {x: head.x + snakeState.dir.x, y: head.y + snakeState.dir.y};

    if (newHead.x < 0 || newHead.x >= cols || newHead.y < 0 || newHead.y >= rows ||
        snakeState.snake.some(s=>s.x===newHead.x && s.y===newHead.y)){
      snakeState.over = true;
      draw();
      return;
    }

    snakeState.snake.unshift(newHead);
    if (newHead.x === snakeState.food.x && newHead.y === snakeState.food.y){
      snakeState.score += 10;
      document.getElementById('snakeScore').textContent = snakeState.score;
      snakeState.food = spawnFood();
    } else {
      snakeState.snake.pop();
    }
    draw();
  }

  draw();
  snakeTimer = setInterval(tick, 130);

  window.addEventListener('keydown', snakeKeyHandler);

  let touchStartX=0, touchStartY=0;
  canvas.ontouchstart = (e)=>{
    const t = e.touches[0];
    touchStartX = t.clientX; touchStartY = t.clientY;
  };
  canvas.ontouchend = (e)=>{
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)){
      snakeState.nextDir = dx > 0 ? {x:1,y:0} : {x:-1,y:0};
    } else {
      snakeState.nextDir = dy > 0 ? {x:0,y:1} : {x:0,y:-1};
    }
  };

  document.getElementById('snakeRestart').onclick = ()=> startSnake();
}

function snakeKeyHandler(e){
  if (!snakeState) return;
  const map = {
    ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1},
    ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0}
  };
  if (map[e.key]){ snakeState.nextDir = map[e.key]; e.preventDefault(); }
}

function stopSnake(){
  if (snakeTimer) clearInterval(snakeTimer);
  snakeTimer = null;
  window.removeEventListener('keydown', snakeKeyHandler);
}
