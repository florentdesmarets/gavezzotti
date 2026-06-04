/* ===== MENU ===== */
const burger   = document.getElementById('menu-burger');
const sideMenu = document.getElementById('side-menu');
const overlay  = document.getElementById('menu-overlay');
const closeBtn = document.getElementById('menu-close');

function openMenu()  { sideMenu.classList.add('open'); overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeMenu() { sideMenu.classList.remove('open'); overlay.classList.remove('open'); document.body.style.overflow = ''; }

burger.addEventListener('click', openMenu);
closeBtn.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);
document.querySelectorAll('.menu-links a').forEach(a => a.addEventListener('click', closeMenu));

/* ===== 5 CLICS LOGO → ADMIN ===== */
let clickCount = 0;
let clickTimer;
document.getElementById('logo-click-zone').addEventListener('click', () => {
  clickCount++;
  clearTimeout(clickTimer);
  clickTimer = setTimeout(() => { clickCount = 0; }, 2000);
  if (clickCount >= 5) {
    clickCount = 0;
    window.location.href = 'admin.html';
  }
});

/* ===== CHARGEMENT SUGGESTIONS ===== */
async function loadSuggestions() {
  const grid = document.getElementById('suggestions-grid');
  try {
    const r = await fetch('data/suggestions.json?t=' + Date.now());
    if (!r.ok) throw new Error();
    const data = await r.json();
    grid.innerHTML = [data.plat1, data.plat2].map(p => `
      <div class="suggestion-card">
        <h3>${p.titre}</h3>
        <img src="${p.image}" alt="${p.titre}" onerror="this.style.display='none'" loading="lazy" />
        <p class="suggestion-prix">${p.prix}€</p>
        <p class="suggestion-desc">${p.description}</p>
      </div>
    `).join('');
  } catch {
    grid.innerHTML = '<p style="padding:24px;text-align:center;color:#7a5c3a;grid-column:1/-1">Les suggestions de la semaine arrivent bientôt&hellip;</p>';
  }
}

loadSuggestions();

/* ===== HERO SLIDESHOW ===== */
(() => {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  let current  = 0;
  let timer;

  function goTo(n) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() { goTo(current + 1); }

  function start() { timer = setInterval(next, 4500); }
  function reset() { clearInterval(timer); start(); }

  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); reset(); }));
  start();
})();

/* ===== CARROUSEL INFINI ===== */
(() => {
  const track = document.getElementById('carousel-track');
  if (!track) return;
  const btnPrev = document.getElementById('car-prev');
  const btnNext = document.getElementById('car-next');

  // Cloner les slides pour boucle infinie
  const origSlides = [...track.children];
  origSlides.forEach(s => track.appendChild(s.cloneNode(true)));
  origSlides.forEach(s => track.prepend(s.cloneNode(true)));

  const slideW = () => track.children[0].offsetWidth + 16;
  const total  = origSlides.length;
  let idx = total; // on commence au milieu (après les clones de début)

  function getPos(i) { return -i * slideW(); }

  function jumpTo(i, animate) {
    track.style.transition = animate ? 'transform 0.4s ease' : 'none';
    track.style.transform  = `translateX(${getPos(i)}px)`;
    idx = i;
  }

  // Init sans animation
  jumpTo(total, false);

  function next() {
    jumpTo(idx + 1, true);
    if (idx >= total * 2) setTimeout(() => jumpTo(total, false), 410);
  }
  function prev() {
    jumpTo(idx - 1, true);
    if (idx <= 0) setTimeout(() => jumpTo(total, false), 410);
  }

  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);

  // Recalcul au resize
  window.addEventListener('resize', () => jumpTo(idx, false));

  // Swipe / drag
  let startX, startPos, dragging = false;
  const wrap = track.parentElement;

  function dragStart(x) { dragging = true; startX = x; startPos = getPos(idx); track.style.transition = 'none'; }
  function dragMove(x)  { if (!dragging) return; track.style.transform = `translateX(${startPos + x - startX}px)`; }
  function dragEnd(x)   {
    if (!dragging) return; dragging = false;
    const diff = x - startX;
    if (Math.abs(diff) > 40) diff < 0 ? next() : prev();
    else jumpTo(idx, true);
  }

  wrap.addEventListener('mousedown',  e => dragStart(e.clientX));
  window.addEventListener('mousemove', e => dragMove(e.clientX));
  window.addEventListener('mouseup',   e => dragEnd(e.clientX));
  wrap.addEventListener('touchstart', e => dragStart(e.touches[0].clientX), { passive: true });
  wrap.addEventListener('touchmove',  e => dragMove(e.touches[0].clientX),  { passive: true });
  wrap.addEventListener('touchend',   e => dragEnd(e.changedTouches[0].clientX));
})();

/* ===== ANIMATIONS SCROLL ===== */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
  .forEach(el => observer.observe(el));

/* ===== SCROLL SMOOTH POUR ANCRES ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 66;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    }
  });
});
