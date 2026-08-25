let wordState = null;
let wordTimerInterval = null;

const WORD_BANK = [
  'RUMAH', 'MAKAN', 'BUKU', 'MOBIL', 'SEKOLAH', 'KUCING', 'AYAM', 'BUNGA',
  'GUNUNG', 'LAUT', 'PASAR', 'BADAN', 'MATA', 'TANGAN', 'KAKI', 'MEJA',
  'KURSI', 'PINTU', 'JENDELA', 'AWAN', 'HUJAN', 'MATAHARI', 'BULAN', 'BINTANG',
  'PISANG', 'JERUK', 'MANGGA', 'NASI', 'SUSU', 'ROTI', 'KOPI', 'GULA'
];

function startWord(){
  stopWord();
  const answerEl = document.getElementById('wordAnswer');
  const lettersEl = document.getElementById('wordLetters');
  const hintText = document.getElementById('wordHintText');
  const clearBtn = document.getElementById('wordClear');

  wordState = { score: 0, time: 45, over: false, word: '', picked: [], letters: [] };
  document.getElementById('wordScore').textContent = '0';
  document.getElementById('wordTime').textContent = '45';

  function scramble(str){
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (arr.join('') === str) return scramble(str);
    return arr;
  }

  function newWord(){
    wordState.word = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    wordState.picked = [];
    wordState.letters = scramble(wordState.word).map((ch, i) => ({ ch, id: i, used: false }));
    hintText.textContent = `Susun jadi kata (${wordState.word.length} huruf)`;
    renderLetters();
    renderAnswer();
  }

  function renderLetters(){
    lettersEl.innerHTML = '';
    wordState.letters.forEach(l => {
      const tile = document.createElement('div');
      tile.className = 'letter-tile' + (l.used ? ' used' : '');
      tile.textContent = l.ch;
      tile.onclick = () => pickLetter(l);
      lettersEl.appendChild(tile);
    });
  }

  function renderAnswer(){
    answerEl.innerHTML = '';
    wordState.picked.forEach((l, idx) => {
      const slot = document.createElement('div');
      slot.className = 'letter-slot';
      slot.textContent = l.ch;
      slot.onclick = () => removeLetter(idx);
      answerEl.appendChild(slot);
    });
    const remaining = wordState.word.length - wordState.picked.length;
    for (let i = 0; i < remaining; i++){
      const slot = document.createElement('div');
      slot.className = 'letter-slot';
      slot.textContent = '';
      answerEl.appendChild(slot);
    }
  }

  function pickLetter(l){
    if (wordState.over || l.used) return;
    l.used = true;
    wordState.picked.push(l);
    renderLetters();
    renderAnswer();
    checkAnswer();
  }

  function removeLetter(idx){
    if (wordState.over) return;
    const l = wordState.picked[idx];
    if (!l) return;
    l.used = false;
    wordState.picked.splice(idx, 1);
    renderLetters();
    renderAnswer();
  }

  function checkAnswer(){
    if (wordState.picked.length !== wordState.word.length) return;
    const guess = wordState.picked.map(l => l.ch).join('');
    if (guess === wordState.word){
      wordState.score += 15;
      document.getElementById('wordScore').textContent = wordState.score;
      hintText.textContent = '✓ Benar!';
      setTimeout(() => { if (!wordState.over) newWord(); }, 500);
    } else {
      hintText.textContent = '✕ Salah, coba lagi';
      setTimeout(() => {
        if (wordState.over) return;
        wordState.picked.forEach(l => l.used = false);
        wordState.picked = [];
        renderLetters();
        renderAnswer();
        hintText.textContent = `Susun jadi kata (${wordState.word.length} huruf)`;
      }, 500);
    }
  }

  clearBtn.onclick = () => {
    if (wordState.over) return;
    wordState.picked.forEach(l => l.used = false);
    wordState.picked = [];
    renderLetters();
    renderAnswer();
  };

  newWord();

  wordTimerInterval = setInterval(() => {
    wordState.time--;
    document.getElementById('wordTime').textContent = Math.max(0, wordState.time);
    if (wordState.time <= 0){
      wordState.over = true;
      clearInterval(wordTimerInterval);
      hintText.textContent = 'Waktu habis! Skor akhir: ' + wordState.score;
      lettersEl.innerHTML = '';
      let restartBtn = document.getElementById('wordRestartBtn');
      if (!restartBtn){
        restartBtn = document.createElement('div');
        restartBtn.className = 'g-btn primary';
        restartBtn.id = 'wordRestartBtn';
        restartBtn.style.marginTop = '14px';
        restartBtn.textContent = 'Main Lagi';
        restartBtn.onclick = () => startWord();
        lettersEl.parentElement.appendChild(restartBtn);
      }
    }
  }, 1000);
}

function stopWord(){
  if (wordTimerInterval) clearInterval(wordTimerInterval);
  wordTimerInterval = null;
  const oldBtn = document.getElementById('wordRestartBtn');
  if (oldBtn) oldBtn.remove();
                              }
