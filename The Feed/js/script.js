// Play the screen-closing animation before opening the feed.
const start = document.querySelector('.start-button');
let leaving = false;
function enterFeed(event) {
  if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
  if (event) event.preventDefault();
  if (leaving || !start) return;
  leaving = true;
  const target = start.getAttribute('href');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.location.assign(target);
    return;
  }
  document.body.classList.add('crt-closing');
  window.setTimeout(() => window.location.assign(target), 850);
}
if (start) {
  start.addEventListener('click', enterFeed);
  document.addEventListener('keydown', event => {
    if (event.key === 'Enter' && document.activeElement === document.body) enterFeed(event);
  });
  window.addEventListener('pageshow', () => {
    leaving = false;
    document.body.classList.remove('crt-closing');
  });
}
const coin = document.querySelector('#insert-credit');
let credits = 1;
if (coin) {
  function addCredit() {
    credits = Math.min(credits + 1, 99);
    document.querySelector('#credit-count').textContent = 'CREDIT ' + String(credits).padStart(2, '0');
    coin.textContent = '[ C ] CREDIT ADDED';
    setTimeout(() => { coin.textContent = '[ C ] INSERT COIN'; }, 900);
  }
  coin.addEventListener('click', addCredit);
  document.addEventListener('keydown', event => {
    if (event.key.toLowerCase() === 'c' && !event.repeat && document.activeElement === document.body) addCredit();
  });
}

// Connect the sound button to Spotify.
const soundButton = document.querySelector('#sound-toggle');
if (soundButton) {
  let controller = null;
  let paused = true;
  const status = document.querySelector('#music-status');
  const fallback = setTimeout(() => { soundButton.textContent = '♫ SOUND / OPEN PLAYER'; }, 8000);
  window.onSpotifyIframeApiReady = api => {
    api.createController(document.querySelector('#spotify-mount'), {
      uri: 'spotify:track:3vjs2MDHoF9xhylNg6Y9un', width: '100%', height: 80
    }, player => {
      controller = player;
      player.addListener('ready', () => {
        clearTimeout(fallback);
        soundButton.textContent = '♫ SOUND / PLAY';
        player.play(); // Browsers may require a real click instead.
      });
      player.addListener('playback_update', event => {
        paused = event.data.isPaused;
        soundButton.textContent = paused ? '♫ SOUND / PLAY' : '♫ SOUND / PAUSE';
        soundButton.setAttribute('aria-pressed', String(!paused));
        status.textContent = paused ? 'Music paused. Press Sound to play.' : 'Music playing.';
      });
    });
  };
  soundButton.addEventListener('click', () => {
    if (controller) { if (paused) controller.play(); else controller.pause(); }
    else document.querySelector('.music-details').open = true;
  });
  const apiScript = document.createElement('script');
  apiScript.src = 'https://open.spotify.com/embed/iframe-api/v1';
  apiScript.async = true;
  apiScript.onerror = () => {
    clearTimeout(fallback);
    soundButton.textContent = '♫ SOUND / OPEN PLAYER';
    status.textContent = 'Spotify is unavailable. Open the track link in Player.';
  };
  document.body.appendChild(apiScript);
}

// Open photos and videos in the memory viewer.
const viewer = document.querySelector('#memory-viewer');
const memories = Array.from(document.querySelectorAll('.memory-open'));
let selected = 0;
let opener = null;
if (viewer && typeof viewer.showModal === 'function') {
  const media = document.querySelector('#viewer-media');
  function showMemory(index) {
    selected = (index + memories.length) % memories.length;
    const link = memories[selected];
    const oldVideo = media.querySelector('video');
    if (oldVideo) oldVideo.pause();
    media.replaceChildren();
    const element = document.createElement(link.dataset.kind === 'video' ? 'video' : 'img');
    element.src = link.getAttribute('href');
    if (element.tagName === 'VIDEO') {
      element.controls = true;
      element.playsInline = true;
      element.preload = 'metadata';
      element.poster = link.querySelector('img').getAttribute('src');
    } else {
      element.alt = link.dataset.title;
    }
    media.appendChild(element);
    document.querySelector('#viewer-title').textContent = link.dataset.title;
    document.querySelector('#viewer-caption').textContent = link.closest('figure').querySelector('figcaption p').textContent;
    document.querySelector('#viewer-slot').textContent = 'MEMORY ' + String(selected + 1).padStart(2, '0');
    document.querySelector('#viewer-counter').textContent = (selected + 1) + ' / ' + memories.length;
  }
  memories.forEach((link, index) => link.addEventListener('click', event => {
    event.preventDefault();
    opener = link;
    showMemory(index);
    viewer.showModal();
    document.body.classList.add('viewer-is-open');
  }));
  document.querySelector('.close-viewer').addEventListener('click', () => viewer.close());
  function stepMemory(direction) {
    const indices = memories.map((link, index) => link.closest('figure').hidden ? -1 : index).filter(index => index >= 0);
    const position = indices.indexOf(selected);
    showMemory(indices[(position + direction + indices.length) % indices.length]);
  }
  document.querySelector('#previous').addEventListener('click', () => stepMemory(-1));
  document.querySelector('#next').addEventListener('click', () => stepMemory(1));
  viewer.addEventListener('close', () => {
    const video = media.querySelector('video');
    if (video) video.pause();
    media.replaceChildren();
    document.body.classList.remove('viewer-is-open');
    if (opener) opener.focus();
  });
  viewer.addEventListener('keydown', event => {
    // Preserve the native seek shortcuts while a video has focus.
    if (event.target.tagName === 'VIDEO') return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); stepMemory(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); stepMemory(1); }
  });
}

const random = document.querySelector('.random-memory');
if (random) random.addEventListener('click', () => {
  const visible = memories.filter(link => !link.closest('figure').hidden);
  if (visible.length) visible[Math.floor(Math.random() * visible.length)].click();
});

// Freeze looping GIFs using their matching still frames.
const motionToggle = document.querySelector('.motion-toggle');
if (motionToggle) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = preference.matches;
  function setMotion() {
    document.body.classList.toggle('motion-paused', paused);
    motionToggle.setAttribute('aria-pressed', String(paused));
    motionToggle.textContent = paused ? 'RESUME ANIMATION' : 'PAUSE ANIMATION';
    if (preference.matches) {
      motionToggle.textContent = 'REDUCED MOTION ENABLED';
      motionToggle.disabled = true;
    } else motionToggle.disabled = false;
  }
  motionToggle.addEventListener('click', () => { paused = !paused; setMotion(); });
  preference.addEventListener('change', () => { paused = preference.matches; setMotion(); });
  setMotion();
}
