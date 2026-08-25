let puzzleState = null;
let puzzleTimerInterval = null;

function startPuzzle(){
  stopPuzzle();
  const grid = document.getElementById('puzzleGrid');

  let board = [1, 2, 3, 4, 5, 6, 7, 8, 0];

  function shuffle(){
    let emptyIdx = 8;
    for (let i = 0; i < 150; i++){
      const row = Math.floor(emptyIdx / 3), col = emptyIdx % 3;
      const neighbors = [];
      if (row > 0) neighbors.push(emptyIdx - 3);
      if (row < 2) neighbors.push(emptyIdx + 3);
      if (col > 0) neighbors.push(emptyIdx - 1);
      if (col < 2) neighbors.push(emptyIdx + 1);
      const swapIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
      [board[emptyIdx], board[swapIdx]] = [board[swapIdx], board[emptyIdx]];
      emptyIdx = swapIdx;
    }
  }
  shuffle();

  puzzleState = { moves: 0, time: 0, over: false, won: false };

  function updateStats(){
    document.getElementById('puzzleMoves').textContent = puzzleState.moves;
    document.getElementById('puzzleMovesHint').textContent = puzzleState.moves;
    document.getElementById('puzzleTime').textContent = puzzleState.time;
  }

  function render(){
    grid.innerHTML = '';
    board.forEach((val, idx) => {
      const tile = document.createElement('div');
      tile.className = 'puzzle-tile' + (val === 0 ? ' empty' : '');
      tile.textContent = val === 0 ? '' : val;
      if (val !== 0){
        tile.onclick = () => tryMove(idx);
      }
      grid.appendChild(tile);
    });
  }

  function tryMove(idx){
    if (puzzleState.over) return;
    const emptyIdx = board.indexOf(0);
    const row = Math.floor(idx / 3), col = idx % 3;
    const eRow = Math.floor(emptyIdx / 3), eCol = emptyIdx % 3;
    const isAdjacent = (Math.abs(row - eRow) + Math.abs(col - eCol)) === 1;
    if (!isAdjacent) return;

    [board[idx], board[emptyIdx]] = [board[emptyIdx], board[idx]];
    puzzleState.moves++;
    updateStats();
    render();

    const solved = board.slice(0, 8).every((v, i) => v === i + 1) && board[8] === 0;
    if (solved){
      puzzleState.over = true;
      puzzleState.won = true;
      clearInterval(puzzleTimerInterval);
      const hint = document.querySelector('#puzzleContent .g-hint');
      if (hint) hint.innerHTML = `<span class="puzzle-win">🎉 Selesai! ${puzzleState.moves} langkah, ${puzzleState.time} detik</span>`;
    }
  }

  render();
  updateStats();

  puzzleTimerInterval = setInterval(() => {
    if (!puzzleState.over){
      puzzleState.time++;
      updateStats();
    }
  }, 1000);

  document.getElementById('puzzleRestart').onclick = () => startPuzzle();
}

function stopPuzzle(){
  if (puzzleTimerInterval) clearInterval(puzzleTimerInterval);
  puzzleTimerInterval = null;
        }
