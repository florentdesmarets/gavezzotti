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

/* ===== STATUT OUVERT / FERMÉ ===== */
(() => {
  const badge = document.getElementById('open-status');
  if (!badge) return;

  // Horaires (timezone Europe/Paris)
  // 0=dim, 1=lun, 2=mar, 3=mer, 4=jeu, 5=ven, 6=sam
  const SLOTS = {
    2: [[12,0,14,0]],                          // Mardi
    3: [[12,0,14,0],[19,0,22,0]],              // Mercredi
    4: [[12,0,14,0],[19,0,22,0]],              // Jeudi
    5: [[12,0,14,0],[19,0,22,0]],              // Vendredi
    6: [[12,0,14,0],[19,0,22,0]],              // Samedi
  };
  const DAY_FR = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];

  function getParisParts() {
    const fmt = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris',
      weekday: 'narrow', hour: 'numeric', minute: 'numeric', hour12: false,
    });
    const now = new Date();
    // Reconstruct day index via locale-independent method
    const dayStr = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Paris', weekday: 'short' }).format(now);
    const days = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
    const day = days[dayStr];
    const timeStr = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
    const [h, m] = timeStr.split(':').map(Number);
    return { day, h, m };
  }

  function findNextOpen(day, h, m) {
    const cur = h * 60 + m;
    // Check remaining slots today
    for (const [oh, om, ch, cm] of (SLOTS[day] || [])) {
      if (cur < oh * 60 + om) return { day, oh, om };
    }
    // Next days
    for (let i = 1; i <= 7; i++) {
      const d = (day + i) % 7;
      if (SLOTS[d] && SLOTS[d].length) {
        const [oh, om] = SLOTS[d][0];
        return { day: d, oh, om };
      }
    }
    return null;
  }

  function render() {
    const { day, h, m } = getParisParts();
    const cur = h * 60 + m;
    const slots = SLOTS[day] || [];
    let openSlot = null;
    for (const [oh, om, ch, cm] of slots) {
      if (cur >= oh * 60 + om && cur < ch * 60 + cm) { openSlot = [ch, cm]; break; }
    }

    if (openSlot) {
      const [ch, cm] = openSlot;
      badge.textContent = `● Ouvert · jusqu'à ${ch}h${cm ? cm : ''}`;
      badge.className = 'open-badge is-open';
    } else {
      const next = findNextOpen(day, h, m);
      if (next) {
        const label = next.day === day ? `à ${next.oh}h${next.om ? next.om : ''}` : `${DAY_FR[next.day]} à ${next.oh}h${next.om ? next.om : ''}`;
        badge.textContent = `● Fermé · Ouvre ${label}`;
      } else {
        badge.textContent = '● Fermé';
      }
      badge.className = 'open-badge is-closed';
    }
  }

  render();
  setInterval(render, 60000); // mise à jour chaque minute
})();


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

/* ===== SLIDER AVANT / APRÈS ===== */
(() => {
  const slider = document.getElementById('aa-slider');
  if (!slider) return;
  const before = document.getElementById('aa-before');
  const handle = document.getElementById('aa-handle');
  let dragging = false;

  function move(clientX) {
    const rect = slider.getBoundingClientRect();
    let pct = (clientX - rect.left) / rect.width * 100;
    pct = Math.max(2, Math.min(98, pct));
    before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left     = pct + '%';
  }

  slider.addEventListener('mousedown',  e => { dragging = true; move(e.clientX); });
  window.addEventListener('mousemove',  e => { if (dragging) move(e.clientX); });
  window.addEventListener('mouseup',    () => dragging = false);
  slider.addEventListener('touchstart', e => move(e.touches[0].clientX), { passive: true });
  slider.addEventListener('touchmove',  e => { e.preventDefault(); move(e.touches[0].clientX); }, { passive: false });
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
  [...origSlides].reverse().forEach(s => track.prepend(s.cloneNode(true)));

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

/* ===== GALERIE EXPANSION (desktop uniquement) ===== */
(() => {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  function makeExpandable(selector) {
    document.querySelectorAll(selector).forEach(item => {
      item.addEventListener('click', () => {
        const isExpanded = item.classList.contains('expanded');
        document.querySelectorAll(selector + '.expanded').forEach(i => {
          i.classList.remove('expanded', 'expanding');
          i.classList.add('collapsing');
          setTimeout(() => i.classList.remove('collapsing'), 350);
        });
        if (!isExpanded) {
          item.classList.add('expanded', 'expanding');
          setTimeout(() => item.classList.remove('expanding'), 500);
        }
      });
    });
  }
  makeExpandable('.galerie-item');
})();

/* ===== CAROUSEL TRAVAUX (boucle infinie, desktop + mobile) ===== */
(() => {
  const track = document.getElementById('travaux-track');
  if (!track) return;
  const prev = document.querySelector('.travaux-prev');
  const next = document.querySelector('.travaux-next');
  const origImgs = [...track.querySelectorAll('img')];
  const total = origImgs.length;
  const gap = 12;
  const visible = () => window.innerWidth <= 768 ? 1 : 3;

  origImgs.forEach(img => track.appendChild(img.cloneNode(true)));
  [...origImgs].reverse().forEach(img => track.prepend(img.cloneNode(true)));

  const allImgs = [...track.querySelectorAll('img')];
  let idx = total;

  function setWidths() {
    const vp = track.parentElement;
    const w = (vp.offsetWidth - gap * (visible() - 1)) / visible();
    allImgs.forEach(img => {
      img.style.width = w + 'px';
      img.style.flexBasis = w + 'px';
      img.style.flexShrink = '0';
      img.style.flexGrow = '0';
    });
  }

  function imgW() { return allImgs[0] ? allImgs[0].offsetWidth : 0; }

  function jumpTo(i, animate) {
    track.style.transition = animate ? 'transform 0.4s ease' : 'none';
    track.style.transform = `translateX(-${i * (imgW() + gap)}px)`;
    idx = i;
  }

  function refresh() { setWidths(); jumpTo(idx, false); }

  next.addEventListener('click', () => {
    jumpTo(idx + 1, true);
    if (idx >= total * 2) setTimeout(() => jumpTo(total, false), 420);
  });
  prev.addEventListener('click', () => {
    jumpTo(idx - 1, true);
    if (idx <= 0) setTimeout(() => jumpTo(total, false), 420);
  });

  let touchStartX = 0;
  track.parentElement.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.parentElement.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        jumpTo(idx + 1, true);
        if (idx >= total * 2) setTimeout(() => jumpTo(total, false), 420);
      } else {
        jumpTo(idx - 1, true);
        if (idx <= 0) setTimeout(() => jumpTo(total, false), 420);
      }
    }
  }, { passive: true });

  window.addEventListener('resize', () => { idx = total; refresh(); });
  refresh();
})();

/* ===== ANIMATIONS SCROLL ===== */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
  .forEach(el => observer.observe(el));

/* ===== DATES AVIS GOOGLE ===== */
(() => {
  const now = new Date();
  document.querySelectorAll('.avis-source[data-date]').forEach(el => {
    const date = new Date(el.dataset.date);
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30.44);
    const diffYears = Math.floor(diffDays / 365.25);
    let label;
    if (diffDays < 30) label = diffDays <= 1 ? 'il y a 1 jour' : `il y a ${diffDays} jours`;
    else if (diffMonths < 12) label = diffMonths <= 1 ? 'il y a 1 mois' : `il y a ${diffMonths} mois`;
    else label = diffYears <= 1 ? 'il y a 1 an' : `il y a ${diffYears} ans`;
    el.querySelector('.avis-age').textContent = label;
  });
})();

/* ===== SCROLL SMOOTH POUR ANCRES ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
