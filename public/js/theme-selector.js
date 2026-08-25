(function () {
  var THEMES = {
    cyan:   { accent: '#22e5ff', accent2: '#0891b2' },
    purple: { accent: '#a78bfa', accent2: '#7c5cff' },
    red:    { accent: '#ff5d6c', accent2: '#e0323f' },
    green:  { accent: '#34d17a', accent2: '#22b866' },
    yellow: { accent: '#ffb648', accent2: '#f5a623' },
    silver: { accent: '#cbd5e1', accent2: '#94a3b8' },
    gray:   { accent: '#7c8ba1', accent2: '#475569' },
    orange: { accent: '#fb923c', accent2: '#f97316' },
    blue:   { accent: '#3b82f6', accent2: '#2f6bff' }
  };
  var STORAGE_KEY = 'vipTheme';

  var overlay = document.getElementById('themeOverlay');
  var btn = document.getElementById('themeBtn');
  var closeBtn = document.getElementById('themeClose');
  var boxes = document.querySelectorAll('.theme-box');

  function applyTheme(name) {
    var t = THEMES[name];
    if (!t) return;
    var root = document.documentElement.style;
    root.setProperty('--accent', t.accent);
    root.setProperty('--accent-2', t.accent2);
    try { localStorage.setItem(STORAGE_KEY, name); } catch (e) {}
    boxes.forEach(function (b) {
      b.classList.toggle('active', b.dataset.theme === name);
    });
  }

  function openThemeSelector() {
    overlay.classList.remove('hidden');
  }

  function closeThemeSelector() {
    overlay.classList.add('hidden');
  }

  if (btn) btn.addEventListener('click', openThemeSelector);
  if (closeBtn) closeBtn.addEventListener('click', closeThemeSelector);
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeThemeSelector();
    });
  }

  boxes.forEach(function (box) {
    box.addEventListener('click', function () {
      applyTheme(box.dataset.theme);
      setTimeout(closeThemeSelector, 180);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay && !overlay.classList.contains('hidden')) {
      closeThemeSelector();
    }
  });

  // Sync active checkmark with saved theme on load
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES[saved]) {
      boxes.forEach(function (b) {
        b.classList.toggle('active', b.dataset.theme === saved);
      });
    }
  } catch (e) {}
})();
