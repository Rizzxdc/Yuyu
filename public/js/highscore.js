(function () {
  var STORAGE_KEY = 'globalHighScore';
  // Elemen ini isinya "langkah" (makin kecil makin bagus), bukan skor,
  // jadi gak ikut dihitung buat High Score.
  var EXCLUDE_IDS = ['memoryMoves', 'puzzleMoves'];

  function getHighScore() {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10) || 0;
    } catch (e) {
      return 0;
    }
  }

  function setHighScore(val) {
    try { localStorage.setItem(STORAGE_KEY, String(val)); } catch (e) {}
    var el = document.getElementById('highScoreVal');
    if (el) el.textContent = val;
  }

  function maybeUpdate(newVal) {
    if (isNaN(newVal)) return;
    var current = getHighScore();
    if (newVal > current) setHighScore(newVal);
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Tampilkan High Score yang udah tersimpan begitu halaman dibuka
    setHighScore(getHighScore());

    // Pantau semua elemen skor game (tanpa perlu edit tiap file game)
    var scoreEls = document.querySelectorAll('.g-score b[id]');
    scoreEls.forEach(function (el) {
      if (EXCLUDE_IDS.indexOf(el.id) !== -1) return;
      var observer = new MutationObserver(function () {
        maybeUpdate(parseInt(el.textContent, 10));
      });
      observer.observe(el, { childList: true, characterData: true, subtree: true });
    });
  });
})();
