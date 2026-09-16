(() => {
  const screens = {
    question: document.getElementById('screen-question'),
    yes: document.getElementById('screen-yes'),
  };

  const THEME_BY_SCREEN = { question: 'space', yes: 'pink' };

  function showScreen(name) {
    Object.values(screens).forEach((el) => el.classList.remove('is-active'));
    screens[name].classList.add('is-active');
    document.body.setAttribute('data-theme', THEME_BY_SCREEN[name]);
  }

  showScreen('question');

  document.getElementById('btn-replay').addEventListener('click', () => {
    resetNoButton();
    showScreen('question');
  });

  document.getElementById('btn-yes').addEventListener('click', () => {
    burstConfetti();
    setTimeout(() => showScreen('yes'), 250);
  });

  // ---------- floating hearts background ----------

  const heartsField = document.getElementById('hearts-field');
  const heartGlyphs = ['❤', '💕', '💗', '🧸'];

  function spawnHeart() {
    if (document.body.getAttribute('data-theme') === 'space') return;
    const el = document.createElement('span');
    el.className = 'floating-heart';
    el.textContent = heartGlyphs[Math.floor(Math.random() * heartGlyphs.length)];
    const size = 14 + Math.random() * 20;
    const left = Math.random() * 100;
    const duration = 7 + Math.random() * 6;
    const drift = (Math.random() - 0.5) * 120;
    el.style.left = left + 'vw';
    el.style.fontSize = size + 'px';
    el.style.animationDuration = duration + 's';
    el.style.setProperty('--drift', drift + 'px');
    heartsField.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  setInterval(spawnHeart, 900);

  // ---------- falling stars (space screen) ----------

  const spaceField = document.getElementById('space-field');

  function initStars(count) {
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'star';
      const size = 1 + Math.random() * 2.4;
      const duration = 6 + Math.random() * 10;
      const drift = (Math.random() - 0.5) * 60;
      el.style.left = Math.random() * 100 + 'vw';
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.animationDuration = duration + 's';
      el.style.animationDelay = -Math.random() * duration + 's';
      el.style.setProperty('--drift', drift + 'px');
      spaceField.appendChild(el);
    }
  }

  initStars(70);

  // ---------- "Нет" button runs away ----------

  const btnNo = document.getElementById('btn-no');
  const btnYes = document.getElementById('btn-yes');
  const buttonsField = document.getElementById('buttons-field');
  const caption = document.getElementById('dodge-caption');

  const captions = [
    'Точно-точно?',
    'Подумай ещё раз... 🥺',
    'Мишка расстроится 🧸',
    'А если подумать?',
    'Ну пожалуйста...',
    'Последний шанс! 💔',
    'Серьёзно?',
    'Мишка плачет 😢',
  ];

  let dodgeCount = 0;
  const MIN_SCALE = 0.42;
  const START_SCALE = 1;
  const SAFE_DODGES = 6;
  const SAFE_DISTANCE = 150;

  function resetNoButton() {
    dodgeCount = 0;
    btnNo.style.position = 'static';
    btnNo.style.left = '';
    btnNo.style.top = '';
    btnNo.style.transform = `scale(${START_SCALE})`;
    caption.textContent = ' ';
  }

  function dodge() {
    dodgeCount++;
    const scale = Math.max(MIN_SCALE, START_SCALE - dodgeCount * 0.09);

    const fieldRect = buttonsField.getBoundingClientRect();
    const btnRect = btnNo.getBoundingClientRect();
    const w = btnRect.width;
    const h = btnRect.height;

    const maxLeft = Math.max(0, fieldRect.width - w);
    const maxTop = Math.max(0, fieldRect.height - h);

    let newLeft = Math.random() * maxLeft;
    let newTop = Math.random() * maxTop;

    if (dodgeCount <= SAFE_DODGES) {
      const yesRect = btnYes.getBoundingClientRect();
      const yesCenterX = yesRect.left - fieldRect.left + yesRect.width / 2;
      const yesCenterY = yesRect.top - fieldRect.top + yesRect.height / 2;

      let attempts = 0;
      let candidateLeft = newLeft;
      let candidateTop = newTop;
      let farEnough = false;

      while (attempts < 25 && !farEnough) {
        candidateLeft = Math.random() * maxLeft;
        candidateTop = Math.random() * maxTop;
        const centerX = candidateLeft + w / 2;
        const centerY = candidateTop + h / 2;
        const dist = Math.hypot(centerX - yesCenterX, centerY - yesCenterY);
        farEnough = dist >= SAFE_DISTANCE;
        attempts++;
      }

      newLeft = candidateLeft;
      newTop = candidateTop;
    }

    if (btnNo.style.position !== 'absolute') {
      btnNo.style.position = 'absolute';
      btnNo.style.left = (fieldRect.width / 2 - w / 2) + 'px';
      btnNo.style.top = (fieldRect.height / 2 - h / 2) + 'px';
      // force layout so the first jump also transitions smoothly
      void btnNo.offsetWidth;
    }

    btnNo.style.left = newLeft + 'px';
    btnNo.style.top = newTop + 'px';
    btnNo.style.transform = `scale(${scale})`;

    caption.textContent = captions[Math.min(dodgeCount - 1, captions.length - 1)];
  }

  btnNo.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    dodge();
  });

  btnNo.addEventListener('mouseenter', dodge);

  btnNo.addEventListener('click', (e) => {
    // if somehow still caught, treat it as an extra dodge instead of "success"
    e.preventDefault();
    dodge();
  });

  // gentle idle drift so it "бегает то вверх, то вниз" even without interaction
  setInterval(() => {
    if (btnNo.style.position !== 'absolute') return;
    const fieldRect = buttonsField.getBoundingClientRect();
    const btnRect = btnNo.getBoundingClientRect();
    const curTop = parseFloat(btnNo.style.top || '0');
    const jitter = (Math.random() - 0.5) * 40;
    const maxTop = Math.max(0, fieldRect.height - btnRect.height);
    const newTop = Math.min(maxTop, Math.max(0, curTop + jitter));
    btnNo.style.top = newTop + 'px';
  }, 1400);

  // ---------- confetti burst ----------

  const confettiField = document.getElementById('confetti-field');
  const confettiGlyphs = ['💕', '❤', '🎉', '🧸', '✨'];

  function burstConfetti() {
    const count = 26;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'confetti-piece';
      el.textContent = confettiGlyphs[Math.floor(Math.random() * confettiGlyphs.length)];
      const angle = Math.random() * Math.PI * 2;
      const distance = 120 + Math.random() * 180;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      el.style.setProperty('--tx', tx + 'px');
      el.style.setProperty('--ty', ty + 'px');
      el.style.setProperty('--rot', (Math.random() * 360 - 180) + 'deg');
      el.style.fontSize = (16 + Math.random() * 14) + 'px';
      el.style.animationDelay = (Math.random() * 120) + 'ms';
      confettiField.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }
  }
})();
