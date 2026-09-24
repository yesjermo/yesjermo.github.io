// Favourites stay in this browser. They still work for the session if storage is blocked.
function readSetting(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeSetting(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The current selection stays usable without local storage.
  }
}

// Restart the coin toss on each click, even if the popup is already showing.
const coinPopup = document.querySelector('#coin-pop');
let coinTimer;

function popCoin() {
  clearTimeout(coinTimer);
  coinPopup.hidden = false;
  const coinImage = coinPopup.querySelector('img');
  coinImage.style.animation = 'none';
  void coinImage.offsetWidth;
  coinImage.style.animation = '';
  coinTimer = setTimeout(() => {
    coinPopup.hidden = true;
  }, 1400);
}

if (coinPopup) {
  document.querySelector('#insert-credit').addEventListener('click', popCoin);
  document.addEventListener('keydown', event => {
    if (event.key.toLowerCase() === 'c' && !event.repeat && document.activeElement === document.body) {
      popCoin();
    }
  });
}

if (document.body.classList.contains('archive-page')) {
  // Give the background a one-second pause while someone uses the controls.
  let restTimer;
  const restStatus = document.querySelector('#breathing-status');

  function pauseBackground() {
    clearTimeout(restTimer);
    document.body.classList.add('interaction-rest');
    restStatus.textContent = 'A MOMENT TO LOOK…';
    restTimer = setTimeout(() => {
      document.body.classList.remove('interaction-rest');
      restStatus.textContent = 'TAKE YOUR TIME.';
    }, 1000);
  }

  document.addEventListener('click', event => {
    if (event.target.closest('button, summary, .memory-open')) {
      pauseBackground();
    }
  }, true);
  document.querySelector('.music-details').addEventListener('toggle', pauseBackground);
  document.addEventListener('keydown', event => {
    if (document.querySelector('#memory-viewer').open && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      pauseBackground();
    }
  });

  const savedData = readSetting('purejoy-favourites', []);
  const saved = new Set(Array.isArray(savedData) ? savedData.filter(item => typeof item === 'string') : []);
  const cards = [...document.querySelectorAll('figure.memory')];
  const categoryButtons = [...document.querySelectorAll('[data-filter]')];
  const savedFilter = document.querySelector('#saved-filter');
  let savedOnly = false;
  let category = 'all';

  // Apply the category and favourites filters together.
  function updateMemories() {
    let visibleCount = 0;
    let savedCount = 0;

    cards.forEach(card => {
      const link = card.querySelector('.memory-open');
      const isSaved = saved.has(link.getAttribute('href'));
      const matchesCategory = category === 'all'
        || link.dataset.kind === category
        || card.dataset.groups.split(' ').includes(category);

      card.hidden = !matchesCategory || (savedOnly && !isSaved);
      if (!card.hidden) visibleCount++;
      if (isSaved) savedCount++;

      const button = card.querySelector('.save-memory');
      button.setAttribute('aria-pressed', String(isSaved));
      button.textContent = isSaved ? '♥ SAVED TO FAVOURITES' : '♡ SAVE THIS MOMENT';
    });

    categoryButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.filter === category));
    });
    document.querySelector('#saved-count').textContent = savedCount;
    savedFilter.setAttribute('aria-pressed', String(savedOnly));

    const status = document.querySelector('#filter-status');
    if (visibleCount === 0) {
      status.textContent = 'NO MEMORIES HERE — try ALL FILES or turn off FAVOURITES.';
    } else {
      status.textContent = `${visibleCount} MEMORIES / ${category.toUpperCase()}`;
      if (savedOnly) status.textContent += ' / FAVOURITES';
    }
  }

  cards.forEach(card => {
    const link = card.querySelector('.memory-open');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'save-memory';
    button.setAttribute('aria-label', 'Save ' + link.dataset.title + ' to favourites');
    button.addEventListener('click', () => {
      const id = link.getAttribute('href');
      if (saved.has(id)) {
        saved.delete(id);
      } else {
        saved.add(id);
      }
      writeSetting('purejoy-favourites', [...saved]);
      updateMemories();
    });
    card.appendChild(button);
  });

  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      category = button.dataset.filter;
      updateMemories();
    });
  });
  savedFilter.addEventListener('click', () => {
    savedOnly = !savedOnly;
    updateMemories();
  });
  updateMemories();
}
