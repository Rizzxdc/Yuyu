let g2048 = null;

const tileColors = {
  2:'#3b4560', 4:'#42507a', 8:'#4f8cff', 16:'#5a7bff',
  32:'#7c5cff', 64:'#9a5cff', 128:'#ff8a4f', 256:'#ff6ba0',
  512:'#ff5d6c', 1024:'#ffb648', 2048:'#34d17a'
};

function startGame2048(){
  g2048 = {
    grid: Array.from({length:4}, ()=>Array(4).fill(0)),
    score: 0,
    over: false
  };
  document.getElementById('score2048').textContent = '0';
  addRandomTile2048();
  addRandomTile2048();
  render2048();

  window.removeEventListener('keydown', key2048Handler);
  window.addEventListener('keydown', key2048Handler);

  const board = document.getElementById('board2048');
  let sx=0, sy=0;
  board.ontouchstart = (e)=>{
    const t = e.touches[0];
    sx = t.clientX; sy = t.clientY;
  };
  board.ontouchend = (e)=>{
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)){
      move2048(dx > 0 ? 'right' : 'left');
    } else {
      move2048(dy > 0 ? 'down' : 'up');
    }
  };

  document.getElementById('restart2048').onclick = ()=> startGame2048();
}

function key2048Handler(e){
  if (!g2048) return;
  const map = {ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right'};
  if (map[e.key]){ move2048(map[e.key]); e.preventDefault(); }
}

function addRandomTile2048(){
  const empty = [];
  for(let r=0;r<4;r++) for(let c=0;c<4;c++) if (g2048.grid[r][c]===0) empty.push([r,c]);
  if (!empty.length) return;
  const [r,c] = empty[Math.floor(Math.random()*empty.length)];
  g2048.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function move2048(dir){
  if (!g2048 || g2048.over) return;
  const grid = g2048.grid;
  let moved = false;

  function slideLine(line){
    const nums = line.filter(v=>v!==0);
    const result = [];
    for (let i=0;i<nums.length;i++){
      if (nums[i] === nums[i+1]){
        result.push(nums[i]*2);
        g2048.score += nums[i]*2;
        i++;
      } else {
        result.push(nums[i]);
      }
    }
    while(result.length < 4) result.push(0);
    return result;
  }

  function getLine(i, dir){
    if (dir==='left') return grid[i].slice();
    if (dir==='right') return grid[i].slice().reverse();
    if (dir==='up') return [grid[0][i],grid[1][i],grid[2][i],grid[3][i]];
    if (dir==='down') return [grid[3][i],grid[2][i],grid[1][i],grid[0][i]];
  }
  function setLine(i, dir, line){
    if (dir==='left'){ grid[i] = line; return; }
    if (dir==='right'){ grid[i] = line.slice().reverse(); return; }
    if (dir==='up'){ for(let r=0;r<4;r++) grid[r][i]=line[r]; return; }
    if (dir==='down'){ for(let r=0;r<4;r++) grid[3-r][i]=line[r]; return; }
  }

  for (let i=0;i<4;i++){
    const before = getLine(i, dir);
    const after = slideLine(before);
    if (JSON.stringify(before) !== JSON.stringify(after)) moved = true;
    setLine(i, dir, after);
  }

  if (moved){
    addRandomTile2048();
    document.getElementById('score2048').textContent = g2048.score;
    if (isGameOver2048()) g2048.over = true;
    render2048();
  }
}

function isGameOver2048(){
  const grid = g2048.grid;
  for(let r=0;r<4;r++) for(let c=0;c<4;c++){
    if (grid[r][c]===0) return false;
    if (c<3 && grid[r][c]===grid[r][c+1]) return false;
    if (r<3 && grid[r][c]===grid[r+1][c]) return false;
  }
  return true;
}

function render2048(){
  const container = document.getElementById('tiles2048');
  container.innerHTML = '';
  const board = document.getElementById('board2048');
  const size = board.clientWidth - 16;
  const gap = 8;
  const cellSize = (size - gap*3) / 4;

  for (let r=0;r<4;r++){
    for (let c=0;c<4;c++){
      const v = g2048.grid[r][c];
      if (!v) continue;
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.textContent = v;
      tile.style.width = cellSize + 'px';
      tile.style.height = cellSize + 'px';
      tile.style.left = (c * (cellSize+gap)) + 'px';
      tile.style.top = (r * (cellSize+gap)) + 'px';
      tile.style.background = tileColors[v] || '#34d17a';
      tile.style.fontSize = (v < 100 ? 22 : v < 1000 ? 18 : 14) + 'px';
      container.appendChild(tile);
    }
  }

  if (g2048.over){
    const over = document.createElement('div');
    over.className = 'g-over';
    over.innerHTML = '<h3>Game Over</h3><p>Skor akhir: '+g2048.score+'</p>';
    container.appendChild(over);
  }
}
