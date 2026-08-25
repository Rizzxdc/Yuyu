let mathState = null;
let mathTimerInterval = null;

function startMath(){
  stopMath();
  const qEl = document.getElementById('mathQuestion');
  const optEl = document.getElementById('mathOptions');

  mathState = { score: 0, time: 30, over: false, answer: 0 };
  document.getElementById('mathScore').textContent = '0';
  document.getElementById('mathTime').textContent = '30';

  function newQuestion(){
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer;
    if (op === '+'){
      a = Math.floor(Math.random() * 40) + 1;
      b = Math.floor(Math.random() * 40) + 1;
      answer = a + b;
    } else if (op === '-'){
      a = Math.floor(Math.random() * 40) + 10;
      b = Math.floor(Math.random() * a);
      answer = a - b;
    } else {
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      answer = a * b;
    }
    mathState.answer = answer;
    qEl.textContent = `${a} ${op} ${b}`;

    const opts = new Set([answer]);
    while (opts.size < 4){
      const delta = Math.floor(Math.random() * 10) - 5;
      const fake = answer + delta;
      if (fake !== answer && fake >= 0) opts.add(fake);
    }
    const arr = Array.from(opts);
    for (let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    optEl.innerHTML = '';
    arr.forEach(val => {
      const btn = document.createElement('div');
      btn.className = 'math-opt';
      btn.textContent = val;
      btn.onclick = () => handleAnswer(val, btn);
      optEl.appendChild(btn);
    });
  }

  function handleAnswer(val, btn){
    if (mathState.over) return;
    const isCorrect = val === mathState.answer;
    btn.classList.add(isCorrect ? 'correct' : 'wrong');
    if (isCorrect){
      mathState.score += 10;
      document.getElementById('mathScore').textContent = mathState.score;
    }
    setTimeout(() => {
      if (!mathState.over) newQuestion();
    }, 250);
  }

  newQuestion();

  mathTimerInterval = setInterval(() => {
    mathState.time--;
    document.getElementById('mathTime').textContent = Math.max(0, mathState.time);
    if (mathState.time <= 0){
      mathState.over = true;
      clearInterval(mathTimerInterval);
      qEl.textContent = 'Waktu Habis!';
      optEl.innerHTML = `<div style="grid-column:span 2; text-align:center; color:var(--muted); font-size:13px;">Skor akhir: ${mathState.score}</div>`;
      const restartBtn = document.createElement('div');
      restartBtn.className = 'g-btn primary';
      restartBtn.style.marginTop = '10px';
      restartBtn.textContent = 'Main Lagi';
      restartBtn.onclick = () => startMath();
      optEl.parentElement.appendChild(restartBtn);
    }
  }, 1000);
}

function stopMath(){
  if (mathTimerInterval) clearInterval(mathTimerInterval);
  mathTimerInterval = null;
  const quiz = document.querySelector('#mathContent .math-quiz');
  if (quiz){
    quiz.querySelectorAll('.g-btn.primary').forEach(b => b.remove());
  }
      }
