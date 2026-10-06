// Theme toggle (defaults to dark, remembers choice)
const root = document.documentElement;
document.getElementById('themeToggle').addEventListener('click', () => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
});

// Mobile menu
const navLinks = document.getElementById('navLinks');
document.getElementById('menuBtn').addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// Project filters
const chips = document.querySelectorAll('.chip');
const cards = document.querySelectorAll('.card');
chips.forEach(chip => chip.addEventListener('click', () => {
  chips.forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  const f = chip.dataset.filter;
  cards.forEach(card => card.classList.toggle('hidden', f !== 'all' && card.dataset.cat !== f));
}));

// Scroll reveal
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

document.getElementById('year').textContent = new Date().getFullYear();

/* ================= ANIMATIONS ================= */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll progress bar
const progress = document.getElementById('progress');
const onScroll = () => {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  progress.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Active nav link
const navMap = {};
document.querySelectorAll('.nav-links a').forEach(a => { navMap[a.getAttribute('href').slice(1)] = a; });
const navIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && navMap[e.target.id]) {
      Object.values(navMap).forEach(a => a.classList.remove('active'));
      navMap[e.target.id].classList.add('active');
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('section[id]').forEach(s => navIO.observe(s));

// Typewriter in the hero
const typedEl = document.getElementById('typed');
const phrases = [
  'AI agents that do real work.',
  'multi-agent LLM systems.',
  'RAG & text-to-SQL copilots.',
  'real-time vision for drones.',
  'robots that learn by doing.',
];
// Reserve room for the longest phrase so the page below never shifts
document.getElementById('typedGhost').textContent =
  'I build ' + phrases.reduce((a, b) => (b.length > a.length ? b : a)) + '|';
if (!reduceMotion) {
  let p = 0, i = phrases[0].length, deleting = true;
  const tick = () => {
    if (deleting) {
      i--;
      if (i === 0) { deleting = false; p = (p + 1) % phrases.length; }
    } else {
      i++;
    }
    typedEl.textContent = phrases[p].slice(0, i);
    let delay = deleting ? 35 : 70;
    if (!deleting && i === phrases[p].length) { deleting = true; delay = 2200; }
    setTimeout(tick, delay);
  };
  setTimeout(tick, 2600);
}

// Count-up stats
const countUp = el => {
  const raw = el.textContent.trim();
  const m = raw.match(/^([\d.]+)(.*)$/);
  if (!m) return;
  const target = parseFloat(m[1]), suffix = m[2], decimals = (m[1].split('.')[1] || '').length;
  const start = performance.now(), dur = 1400;
  const step = now => {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = (target * eased).toFixed(decimals) + suffix;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
const statsIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.querySelectorAll('.num').forEach(countUp); statsIO.unobserve(e.target); }
  });
}, { threshold: 0.4 });
if (!reduceMotion) document.querySelectorAll('.stats').forEach(s => statsIO.observe(s));

// Staggered reveal: siblings in the same container animate one after another
document.querySelectorAll('.grid, .timeline, .skills, .pubs, .edu-grid').forEach(group => {
  group.querySelectorAll(':scope > .reveal').forEach((el, idx) => {
    el.style.transitionDelay = `${Math.min(idx, 4) * 90}ms`;
    // clear the delay once revealed so hover effects stay snappy
    el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, { once: true });
  });
});

// Skill tiles pop in one by one when their group appears
if (!reduceMotion) {
  document.querySelectorAll('.skill').forEach(s => s.classList.add('pop'));
  const skillIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.skill').forEach((s, idx) => {
        setTimeout(() => s.classList.add('in'), 150 + idx * 45);
      });
      skillIO.unobserve(e.target);
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.skill-group').forEach(g => skillIO.observe(g));
}

// Cursor spotlight on cards
document.querySelectorAll('.card, .job, .skill-group, .pubs li, .stats > div').forEach(el => {
  el.classList.add('spot');
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

// Neural-network particle background in the hero
(() => {
  const canvas = document.getElementById('neural');
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext('2d');
  const hero = canvas.parentElement;
  let w, h, nodes = [], mouse = { x: -9999, y: -9999 };
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let lastW = 0;
  const resize = () => {
    w = hero.clientWidth; h = hero.clientHeight;
    const regen = w !== lastW; lastW = w;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!regen) return;
    const count = Math.round(Math.min(90, (w * h) / 14000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
    }));
  };
  const colors = () => {
    const cs = getComputedStyle(document.documentElement);
    return [cs.getPropertyValue('--accent').trim(), cs.getPropertyValue('--accent-2').trim()];
  };

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hero);

  const draw = () => {
    requestAnimationFrame(draw);
    if (!visible) return;
    const [c1, c2] = colors();
    ctx.clearRect(0, 0, w, h);
    const LINK = 130;
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      // gentle pull towards cursor
      const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
      if (d < 180) { n.x += dx * 0.004; n.y += dy * 0.004; }
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.globalAlpha = (1 - d / LINK) * 0.35;
          ctx.strokeStyle = c1;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const md = Math.hypot(nodes[i].x - mouse.x, nodes[i].y - mouse.y);
      if (md < 180) {
        ctx.globalAlpha = (1 - md / 180) * 0.6;
        ctx.strokeStyle = c2;
        ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    ctx.globalAlpha = 0.9;
    for (const n of nodes) {
      ctx.fillStyle = c2;
      ctx.beginPath(); ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  hero.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });
  window.addEventListener('resize', resize);
  resize();
  draw();
})();
