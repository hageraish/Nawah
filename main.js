/* =========================================================
   Nawah — script.js
   1) Theme toggle  2) Navbar  3) Scroll reveal
   4) Counters  5) Interactive cards  6) Terminal  7) Form
   ========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1) Theme toggle with saved choice ---------- */
  const toggle = document.getElementById('themeToggle');
  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    // Enable the smooth transition briefly so other animations stay fast
    root.classList.add('theme-anim');
    root.setAttribute('data-bs-theme', next);
    try { localStorage.setItem('nawah-theme', next); } catch (e) { /* storage unavailable */ }
    setTimeout(() => root.classList.remove('theme-anim'), 600);
  });

  /* ---------- 2) Navbar: style on scroll + active link ---------- */
  const nav = document.getElementById('mainNav');
  const links = [...document.querySelectorAll('.nav-link')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
    const y = window.scrollY + 140;
    let current = null;
    sections.forEach(s => { if (s.offsetTop <= y) current = s.id; });
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Close the mobile menu after clicking a link
  links.forEach(a => a.addEventListener('click', () => {
    const menu = document.getElementById('navMenu');
    if (menu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(menu).hide();
  }));

  /* ---------- 3) Reveal elements on scroll ---------- */
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ---------- 4) Number counters: start when visible ---------- */
  const countObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, dur = 1600, t0 = performance.now();
      const tick = now => {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))); // easeOutCubic
        if (p < 1) requestAnimationFrame(tick);
      };
      reduceMotion ? (el.textContent = target) : requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

  /* ---------- 5) Service cards: cursor glow + 3D tilt ---------- */
  const canHover = matchMedia('(hover: hover)').matches;
  if (canHover && !reduceMotion) {
    document.querySelectorAll('.f-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');
        const rx = ((y / r.height) - .5) * -8, ry = ((x / r.width) - .5) * 8;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- 6) Terminal: auto-typing in the hero ---------- */
  const out = document.getElementById('typed');
  const script = [
    '<span class="c-m"># Deploy the latest app version</span>\n',
    '<span class="c-g">$</span> nawah deploy --env production\n',
    '<span class="c-b">›</span> Building project ......... <span class="c-g">done</span>\n',
    '<span class="c-b">›</span> Running tests (248) ...... <span class="c-g">passed</span>\n',
    '<span class="c-b">›</span> Scanning vulnerabilities . <span class="c-g">clean</span>\n',
    '<span class="c-b">›</span> Scaling servers .......... <span class="c-v">x4</span>\n\n',
    '<span class="c-g">✔ Your site is live</span>\n',
    '<span class="c-m">https://app.nawah.dev · 1.2s</span>'
  ];

  // Type line by line; HTML tags are added at once, plain characters one by one
  const typeLines = async () => {
    for (const line of script) {
      const parts = line.split(/(<[^>]+>)/g).filter(Boolean);
      let html = '';
      for (const p of parts) {
        if (p.startsWith('<')) { html += p; out.innerHTML = html; continue; }
        for (const ch of p) {
          html += ch; out.innerHTML = html;
          await new Promise(r => setTimeout(r, reduceMotion ? 0 : 22));
        }
      }
      await new Promise(r => setTimeout(r, reduceMotion ? 0 : 260));
    }
  };
  if (out) typeLines();

  /* ---------- 7) Contact form: simple validation (UI only) ---------- */
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('.form-control').forEach(f => {
      const ok = f.checkValidity() && f.value.trim() !== '';
      f.classList.toggle('is-invalid', !ok);
      if (!ok) valid = false;
    });
    if (valid) {
      // Send the data to your server here with fetch()
      document.getElementById('formOk').hidden = false;
      form.reset();
    }
  });
})();