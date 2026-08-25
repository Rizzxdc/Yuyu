let memoryState = null;
let memoryLockTimeout = null;

function startMemory(){
  stopMemory();
  const grid = document.getElementById('memoryGrid');
  grid.innerHTML = '';

  const emojis = ['🍎', '🍋', '🍇', '🍓', '🍒', '🍉', '🍌', '🥝'];
  let deck = [...emojis, ...emojis];
  for (let i = deck.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  memoryState = {
    deck,
    flipped: [],
    matched: new Set(),
    moves: 0,
    locked: false
  };

  deck.forEach((emoji, idx) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.idx = idx;
    const face = document.createElement('div');
    face.className = 'memory-face';
    face.textContent = emoji;
    card.appendChild(face);
    card.onclick = () => flipCard(idx, card);
    grid.appendChild(card);
  });

  function updateMoves(){
    document.getElementById('memoryMoves').textContent = memoryState.moves;
    const hint = document.getElementById('memoryMovesHint');
    if (hint) hint.textContent = memoryState.moves;
  }
  updateMoves();

  function flipCard(idx, card){
    if (memoryState.locked) return;
    if (memoryState.matched.has(idx)) return;
    if (memoryState.flipped.some(f => f.idx === idx)) return;
    if (memoryState.flipped.length >= 2) return;

    card.classList.add('flipped');
    memoryState.flipped.push({ idx, card });

    if (memoryState.flipped.length === 2){
      memoryState.moves++;
      updateMoves();
      const [a, b] = memoryState.flipped;
      if (deck[a.idx] === deck[b.idx]){
        memoryState.matched.add(a.idx);
        memoryState.matched.add(b.idx);
        a.card.classList.add('matched');
        b.card.classList.add('matched');
        memoryState.flipped = [];
        if (memoryState.matched.size === deck.length){
          const hint = document.querySelector('#memoryContent .g-hint');
          if (hint) hint.textContent = 'Selesai! Total langkah: ' + memoryState.moves;
        }
      } else {
        memoryState.locked = true;
        memoryLockTimeout = setTimeout(() => {
          a.card.classList.remove('flipped');
          b.card.classList.remove('flipped');
          memoryState.flipped = [];
          memoryState.locked = false;
        }, 700);
      }
    }
  }

  document.getElementById('memoryRestart').onclick = () => startMemory();
}

function stopMemory(){
  if (memoryLockTimeout) clearTimeout(memoryLockTimeout);
  memoryLockTimeout = null;
    }
