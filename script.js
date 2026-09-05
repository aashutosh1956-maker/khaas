const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

/* ===================================================================
   CATALOG — this is the whole site's content.
   To add a title, copy an object below and fill it in. To hook up
   YOUR video, paste a direct link to the file into videoUrl:

     videoUrl: 'https://your-cdn.com/videos/dark-signal-s1e1.mp4'

   Supported:
   - Direct files:  .mp4 / .webm  -> work in every browser, no setup
   - HLS streams:   .m3u8         -> auto-handled via hls.js (loaded
                     in index.html); these are what services like
                     Cloudflare Stream, Mux or Bunny hand you

   Leave videoUrl as '' to leave a title playable-but-empty — the
   player will show a "no video linked yet" state instead of breaking.

   poster: leave null to use the gradient placeholder, or set it to
   an image URL ('https://your-cdn.com/posters/dark-signal.jpg') to
   use a real poster image instead.
=================================================================== */
const CATALOG = [
  {
    id: 'dark-signal', type: 'show', title: 'Dark Signal',
    year: 2024, rating: 'TV-MA', meta: '2 Seasons', genres: 'Thriller, Mystery, Drama',
    description: "When a disgraced detective intercepts a mysterious radio transmission from an abandoned Cold War bunker, she unravels a conspiracy that reaches the highest levels of government — and threatens everyone she loves.",
    trending: true, poster: null,
    posterGradient: 'linear-gradient(160deg, #1b1420 0%, #241a2e 45%, #3a2438 100%)',
    videoUrl: ''
  },
  {
    id: 'hollow-choir', type: 'show', title: 'The Hollow Choir',
    year: 2023, rating: 'TV-MA', meta: '3 Seasons', genres: 'Horror, Drama',
    description: "A small parish choir's annual retreat turns into a fight for survival when an old ritual wakes something in the woods that never stopped listening.",
    trending: true, poster: null,
    posterGradient: 'linear-gradient(160deg, #180b0c 0%, #2a1012 45%, #3d1418 100%)',
    videoUrl: ''
  },
  {
    id: 'windowlight', type: 'show', title: 'Windowlight',
    year: 2022, rating: 'TV-14', meta: '1 Season', genres: 'Drama',
    description: "Three sisters return to their childhood home after their mother's death and slowly uncover the choices that quietly shaped all of their lives.",
    trending: false, poster: null,
    posterGradient: 'linear-gradient(160deg, #14100a 0%, #241b10 45%, #3a2a14 100%)',
    videoUrl: ''
  },
  {
    id: 'concrete-orbit', type: 'show', title: 'Concrete Orbit',
    year: 2025, rating: 'TV-MA', meta: '1 Season', genres: 'Sci-Fi, Thriller',
    description: "In a city built inside a decaying orbital ring, a maintenance engineer discovers a fault that isn't mechanical — it's someone else's plan.",
    trending: true, poster: null,
    posterGradient: 'linear-gradient(160deg, #0b1020 0%, #121a33 45%, #1b2a4a 100%)',
    videoUrl: ''
  },
  {
    id: 'marrow-coast', type: 'show', title: 'Marrow Coast',
    year: 2021, rating: 'TV-MA', meta: '4 Seasons', genres: 'Crime, Drama',
    description: "A veteran homicide detective in a fading fishing town keeps finding cases that lead back to the same family, generation after generation.",
    trending: false, poster: null,
    posterGradient: 'linear-gradient(160deg, #0a140f 0%, #12241a 45%, #1c3324 100%)',
    videoUrl: ''
  },
  {
    id: 'undertow-road', type: 'movie', title: 'Undertow Road',
    year: 2024, rating: 'R', meta: '118 min', genres: 'Thriller, Drama',
    description: "A rideshare driver picks up a passenger fleeing something unnamed, and the one-night drive turns into a reckoning with his own past.",
    trending: true, poster: null,
    posterGradient: 'linear-gradient(160deg, #0c0c0c 0%, #171313 50%, #241b17 100%)',
    videoUrl: ''
  },
  {
    id: 'static-hour', type: 'movie', title: 'Static Hour',
    year: 2023, rating: 'PG-13', meta: '104 min', genres: 'Mystery',
    description: "For sixty minutes every night, a small town's phones go silent — and a local radio host is the only one who wants to know why.",
    trending: true, poster: null,
    posterGradient: 'linear-gradient(160deg, #0d1416 0%, #16262a 45%, #1f3a3e 100%)',
    videoUrl: ''
  },
  {
    id: 'quiet-ledger', type: 'movie', title: 'The Quiet Ledger',
    year: 2022, rating: 'R', meta: '131 min', genres: 'Crime, Drama',
    description: "An accountant discovers a decades-old discrepancy in a family business and has to decide how far she's willing to go to make it right.",
    trending: false, poster: null,
    posterGradient: 'linear-gradient(160deg, #101214 0%, #1c1f22 45%, #2a2f33 100%)',
    videoUrl: ''
  },
  {
    id: 'painted-silence', type: 'movie', title: 'Painted Silence',
    year: 2025, rating: 'PG-13', meta: '97 min', genres: 'Drama',
    description: "A muralist mute since childhood is hired to restore a fresco in her hometown, and old memories start bleeding through the plaster.",
    trending: false, poster: null,
    posterGradient: 'linear-gradient(160deg, #1a1008 0%, #2c1a0d 45%, #4a2a12 100%)',
    videoUrl: ''
  },
  {
    id: 'nightshift-protocol', type: 'movie', title: 'Nightshift Protocol',
    year: 2021, rating: 'R', meta: '112 min', genres: 'Action, Thriller',
    description: "A night-shift security officer at a private research campus has twelve hours to stop a breach that isn't coming from outside the building.",
    trending: true, poster: null,
    posterGradient: 'linear-gradient(160deg, #10151a 0%, #1a2a2c 45%, #24403f 100%)',
    videoUrl: ''
  }
];

/* ---------- render rows from CATALOG ---------- */
function renderRow(containerEl, items, ranked) {
  containerEl.innerHTML = '';
  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'Play ' + item.title);
    const art = item.poster ? `url('${item.poster}') center/cover no-repeat` : item.posterGradient;
    card.innerHTML = `
      <div class="card-art" style="background:${art}"></div>
      <div class="card-shade"></div>
      ${ranked ? `<div class="card-num">${i + 1}</div>` : `<div class="card-title">${item.title}</div>`}
      <div class="card-play" aria-hidden="true"><span><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span></div>
    `;
    card.addEventListener('click', () => openDetail(item.id, true));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(item.id, true); }
    });
    containerEl.appendChild(card);
  });
}

renderRow(document.getElementById('trendingTrack'), CATALOG.filter(c => c.trending), true);
renderRow(document.getElementById('moviesTrack'), CATALOG.filter(c => c.type === 'movie'), false);
renderRow(document.getElementById('showsTrack'), CATALOG.filter(c => c.type === 'show'), false);

/* ---------- modal / player ---------- */
const overlay = document.getElementById('modalOverlay');
const video = document.getElementById('modalVideo');
const modalEmpty = document.getElementById('modalEmpty');
const modalEmptyName = document.getElementById('modalEmptyName');
const modalTitle = document.getElementById('modalTitle');
const modalMeta = document.getElementById('modalMeta');
const modalDesc = document.getElementById('modalDesc');
let hlsInstance = null;

function setModalSource(url) {
  if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }
  video.removeAttribute('src');
  video.load();
  if (!url) return;
  if (url.indexOf('.m3u8') !== -1 && window.Hls && Hls.isSupported()) {
    hlsInstance = new Hls();
    hlsInstance.loadSource(url);
    hlsInstance.attachMedia(video);
  } else {
    video.src = url;
  }
}

function openDetail(id, autoplay) {
  const item = CATALOG.find(c => c.id === id);
  if (!item) return;
  modalTitle.textContent = item.title;
  modalMeta.textContent = [item.year, item.rating, item.meta, item.genres].filter(Boolean).join('   •   ');
  modalDesc.textContent = item.description;
  modalEmptyName.textContent = item.title;

  const hasVideo = !!item.videoUrl;
  modalEmpty.style.display = hasVideo ? 'none' : 'flex';
  video.style.display = hasVideo ? 'block' : 'none';
  setModalSource(item.videoUrl);

  overlay.classList.add('open');
  document.body.classList.add('modal-open');
  if (hasVideo && autoplay) video.play().catch(() => {});
}

function closeDetail() {
  overlay.classList.remove('open');
  document.body.classList.remove('modal-open');
  video.pause();
  setModalSource('');
}

document.getElementById('modalClose').addEventListener('click', closeDetail);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeDetail(); });
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay.classList.contains('open')) closeDetail();
});

document.getElementById('heroPlayBtn').addEventListener('click', () => openDetail('dark-signal', true));
document.getElementById('heroInfoBtn').addEventListener('click', () => openDetail('dark-signal', false));
