/*
  The shell shared by every page: the oversized "Eric." and the liquid-glass
  menu that stands in for its "i". Each page is a real HTML file with its own
  #content, so direct links work without this script; with it, moving between
  pages fetches the next page's #content and animates the change in place:

  - landing -> page: the letters float off like balloons, the menu merges into
    one pill, drops toward the right edge and bounces up into place, splits
    back into dot and pill, and the page scrolls up from below.
  - page -> landing: the same, in reverse.
  - page -> page: the content scrolls up or down, by the pages' order in the menu.
*/
(() => {
  const ROOT = new URL('..', document.currentScript.src);
  // Folder URLs ("about/") rely on the host serving index.html for a folder.
  // Hosts that don't can set this to "index.html".
  const INDEX = '';

  const ROUTES = [
    { key: 'about',      path: 'about/',      label: 'About',           icon: 'person-crop-circle' },
    { key: 'home',       path: '',            label: 'Home',            icon: 'house' },
    { key: 'projects',   path: 'projects/',   label: 'Projects',        icon: 'folder' },
    { key: 'experience', path: 'experience/', label: 'Experience',      icon: 'doc-text' },
    { key: 'resume',     path: 'resume/',     label: 'Download resume', icon: 'arrow-down-doc' },
  ];
  const urlOf = r => new URL(r.path + INDEX, ROOT).href;
  const routeAt = href => {
    const path = new URL(href, location.href).pathname.replace(/index\.html$/, '');
    return ROUTES.find(r => new URL(r.path, ROOT).pathname === path);
  };

  // Drawn after SF Symbols (Regular): person.crop.circle, house, folder,
  // doc.text, arrow.down.doc.
  const SYMBOLS = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <symbol id="sf-person-crop-circle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="9.25"/><circle cx="12" cy="9.6" r="3.3"/>
    <path d="M5.85 18.55c1.35-2.35 3.55-3.65 6.15-3.65s4.8 1.3 6.15 3.65"/>
  </symbol>
  <symbol id="sf-house" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3.4 11.4 12 4.1l8.6 7.3"/><path d="M17.6 5.2v2.6"/>
    <path d="M5.9 9.6v9.15c0 .8.65 1.45 1.45 1.45h9.3c.8 0 1.45-.65 1.45-1.45V9.6"/>
    <rect x="10.15" y="14.1" width="3.7" height="6.1" rx=".7" fill="currentColor" stroke="none"/>
  </symbol>
  <symbol id="sf-folder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3.25 7.3c0-1.05.85-1.9 1.9-1.9h3.9c.55 0 1.05.22 1.42.6l1.28 1.33h7.1c1.05 0 1.9.85 1.9 1.9v8.47c0 1.05-.85 1.9-1.9 1.9H5.15c-1.05 0-1.9-.85-1.9-1.9Z"/>
    <path d="M3.25 10.05h17.5"/>
  </symbol>
  <symbol id="sf-doc-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <rect x="5.75" y="3.25" width="12.5" height="17.5" rx="2.3"/><path d="M9 8.3h6M9 11.5h6M9 14.7h3.8"/>
  </symbol>
  <symbol id="sf-arrow-down-doc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13.6 3.25H8.05c-1.27 0-2.3 1.03-2.3 2.3v12.9c0 1.27 1.03 2.3 2.3 2.3h7.9c1.27 0 2.3-1.03 2.3-2.3V7.9Z"/>
    <path d="M13.6 3.25v3.4c0 .7.56 1.25 1.25 1.25h3.4"/><path d="M12 10.6v6.3M9.55 14.6 12 17.05l2.45-2.45"/>
  </symbol>
</defs></svg>`;

  const item = r => `<a class="item" href="${urlOf(r)}" data-route="${r.key}" aria-label="${r.label}" title="${r.label}">` +
    `<svg aria-hidden="true"><use href="#sf-${r.icon}"/></svg></a>`;
  const letter = c => `<span class="ch">${c}</span>`;

  document.body.insertAdjacentHTML('afterbegin', SYMBOLS + `
<div class="stage" aria-hidden="true"><div class="word">${letter('E')}${letter('r')}<span class="i"><span class="i-glyph">i</span><span class="i-baseline"></span></span>${letter('c')}${letter('.')}</div></div>
<nav class="dock" aria-label="Site">
  <div class="glass dot">${item(ROUTES[0])}</div>
  <div class="glass stem"><span class="lens" aria-hidden="true"></span>${ROUTES.slice(1).map(item).join('')}</div>
</nav>`);

  const html = document.documentElement;
  const content = document.getElementById('content');
  const slot = document.querySelector('.i');
  const glyph = slot.querySelector('.i-glyph');
  const probe = slot.querySelector('.i-baseline');
  const letters = [...document.querySelectorAll('.ch')];
  const dock = document.querySelector('.dock');
  const dot = dock.querySelector('.dot');
  const stem = dock.querySelector('.stem');
  const lens = dock.querySelector('.lens');
  const items = [...dock.querySelectorAll('.item')];
  const stemItems = [...stem.querySelectorAll('.item')];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  let current = ROUTES.find(r => r.key === document.body.dataset.page) || routeAt(location.href) || ROUTES[1];
  let busy = false;
  const G = {};  // menu geometry and its two resting places, in viewport px

  /* ---------- Fitting the menu to the "i" ---------- */

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const SS = 2; // supersampling for sub-pixel edges

  // Ink bounds of a run of rows/columns, with fractional (anti-aliased) edges.
  function span(sums, from, to) {
    let a = from, b = to, peak = 0;
    for (let k = from; k <= to; k++) peak = Math.max(peak, sums[k]);
    while (a < b && sums[a] < peak * .02) a++;
    while (b > a && sums[b] < peak * .02) b--;
    return [a + 1 - Math.min(1, sums[a] / peak), b + Math.min(1, sums[b] / peak)];
  }

  // Rasterise the real "i" and find its stem and tittle.
  function measureGlyph(cs, size) {
    const s = size * SS;
    const pad = Math.ceil(s * .25);
    canvas.width = Math.ceil(s * .6) + pad * 2;
    canvas.height = Math.ceil(s * 1.5);
    const baseline = Math.ceil(s * 1.15);
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${s}px ${cs.fontFamily}`;
    ctx.fillStyle = '#000';
    ctx.fillText('i', pad, baseline);
    const advance = ctx.measureText('i').width / SS;

    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const rows = new Float64Array(height);
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) rows[y] += data[(y * width + x) * 4 + 3] / 255;

    // Contiguous inked row runs: expect [tittle, stem].
    const runs = [];
    for (let y = 0; y < height; y++) {
      if (rows[y] > .5 && (y === 0 || rows[y - 1] <= .5)) runs.push([y, y]);
      if (rows[y] > .5) runs[runs.length - 1][1] = y;
    }
    if (runs.length < 2) return null;

    const box = ([r0, r1]) => {
      const cols = new Float64Array(width);
      for (let y = r0; y <= r1; y++)
        for (let x = 0; x < width; x++) cols[x] += data[(y * width + x) * 4 + 3] / 255;
      let c0 = 0, c1 = width - 1;
      while (c0 < c1 && cols[c0] === 0) c0++;
      while (c1 > c0 && cols[c1] === 0) c1--;
      const [top, bottom] = span(rows, Math.max(0, r0 - 1), Math.min(height - 1, r1 + 1));
      const [left, right] = span(cols, c0, c1);
      return {
        x: (left - pad) / SS, y: (top - baseline) / SS,
        w: (right - left) / SS, h: (bottom - top) / SS,
      };
    };
    return { advance, dot: box(runs[0]), stem: box(runs[runs.length - 1]) };
  }

  const px = v => v.toFixed(2) + 'px';

  function fit() {
    const cs = getComputedStyle(slot);
    const size = parseFloat(cs.fontSize);
    const m = measureGlyph(cs, size);
    const domAdvance = glyph.getBoundingClientRect().width - (parseFloat(cs.letterSpacing) || 0);
    const base = probe.getBoundingClientRect().top - slot.getBoundingClientRect().top;

    // The dot takes the stem's width (some faces, like Nunito, draw a larger
    // tittle) and sits in the same column, centred on the glyph's dot. If the
    // canvas didn't render the page's face, fall back to SF Pro Rounded's
    // proportions.
    const g = m && Math.abs(m.advance - domAdvance) / domAdvance < .03
      ? { x: m.stem.x, w: m.stem.w, h: m.stem.h, stemY: base + m.stem.y,
          dotY: base + m.dot.y + (m.dot.h - m.stem.w) / 2 }
      : { x: .062 * size, w: .136 * size, h: .54 * size, stemY: .26 * size, dotY: .043 * size };

    G.w = g.w;
    G.stemTop = g.stemY - g.dotY;
    G.stemH = g.h;
    G.h = G.stemTop + G.stemH;

    const r = slot.getBoundingClientRect();
    G.home = { x: r.left + g.x, y: r.top + g.dotY };
    const vw = html.clientWidth, vh = innerHeight;
    const margin = Math.max(16, Math.min(40, vw * .03));
    G.docked = { x: vw - margin - G.w, y: Math.max(margin, (vh - G.h) / 2) };

    dock.style.setProperty('--stem-w', px(G.w));
    dock.style.setProperty('--stem-top', px(G.stemTop));
    dock.style.setProperty('--stem-h', px(G.stemH));
    html.style.setProperty('--dock-space', px(G.w + margin * 2));
    if (!busy) {
      place(current.key === 'home' ? G.home : G.docked);
      restLens();
    }
    dock.classList.add('ready');
  }

  function place(p) {
    dock.style.setProperty('--x', px(p.x));
    dock.style.setProperty('--y', px(p.y));
  }

  /* ---------- Current page and the lens ---------- */

  function markCurrent() {
    items.forEach(a => a.dataset.route === current.key
      ? a.setAttribute('aria-current', 'page')
      : a.removeAttribute('aria-current'));
    html.classList.toggle('is-home', current.key === 'home');
    html.classList.toggle('is-page', current.key !== 'home');
  }

  function moveLens(a) {
    lens.style.setProperty('--lens-y', px(a.offsetTop + (a.offsetHeight - lens.offsetHeight) / 2));
    lens.classList.remove('is-hidden');
  }

  // Rest on the current page; the about page lives in the dot, so hide it.
  function restLens() {
    const a = stemItems.find(x => x.dataset.route === current.key);
    if (a) moveLens(a); else lens.classList.add('is-hidden');
  }

  stemItems.forEach(a => {
    a.addEventListener('pointerenter', () => moveLens(a));
    a.addEventListener('focus', () => moveLens(a));
  });
  stem.addEventListener('pointerleave', restLens);

  /* ---------- Animation helpers ---------- */

  const settle = a => a.finished.catch(() => {});
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const rand = (lo, hi) => lo + Math.random() * (hi - lo);

  // Where each letter drifts to when it floats away: its own sideways drift
  // and spin, kept so the trip home can retrace it.
  const away = letters.map(() => ({
    dx: rand(-7, 7),
    rot: rand(10, 22) * (Math.random() < .5 ? -1 : 1),
  }));
  const awayTransform = a => `translate(${a.dx}vw, -125vh) rotate(${a.rot}deg)`;

  function letterAnim(el, frames, opts) {
    const a = el.animate(frames, { fill: 'both', ...opts });
    return settle(a).then(() => {
      el.style.transform = frames[frames.length - 1].transform;
      a.cancel();
    });
  }

  // Balloons: a small dip as each lets go, then a slow, swaying climb that
  // picks up speed. Staggered so they leave one by one.
  function floatAway() {
    return Promise.all(letters.map((el, i) => {
      const { dx, rot } = away[i];
      return letterAnim(el, [
        { transform: 'translate(0, 0) rotate(0deg)' },
        { transform: `translate(0, 1.8vh) rotate(${-rot * .12}deg) scale(1.04, .96)`, offset: .1 },
        { transform: `translate(${dx * .3}vw, -9vh) rotate(${rot * .35}deg)`, offset: .34 },
        { transform: `translate(${-dx * .2}vw, -46vh) rotate(${-rot * .4}deg)`, offset: .66 },
        { transform: awayTransform(away[i]) },
      ], { duration: 1150, delay: [0, 80, 30, 120][i] + rand(0, 50), easing: 'cubic-bezier(.4, 0, .65, .6)' });
    }));
  }

  // The same balloons drifting back down and landing with a little bounce.
  function floatHome(delay) {
    return Promise.all(letters.map((el, i) => {
      const { dx, rot } = away[i];
      return letterAnim(el, [
        { transform: awayTransform(away[i]) },
        { transform: `translate(${-dx * .2}vw, -38vh) rotate(${-rot * .35}deg)`, offset: .45 },
        { transform: `translate(${dx * .08}vw, 1.6vh) rotate(${rot * .1}deg) scale(1.04, .96)`, offset: .8 },
        { transform: `translate(0, -.5vh) rotate(${-rot * .03}deg)`, offset: .91 },
        { transform: 'none' },
      ], { duration: 1400, delay: delay + [60, 0, 120, 30][i] + rand(0, 60), easing: 'cubic-bezier(.2, .55, .35, 1)' });
    }));
  }

  // The menu's trip between the "i" and the right edge. It hops, merges into a
  // single pill, falls past its target, springs back up and splits apart,
  // squashing and stretching as it goes.
  function flyDock(from, to) {
    const t = (x, y, rot = 0, sx = 1, sy = 1) =>
      `translate(${px(x)}, ${px(y)}) rotate(${rot}deg) scale(${sx}, ${sy})`;
    const dir = Math.sign(to.x - from.x) || 1;
    const drop = Math.min(innerHeight * .16, 150);
    const T = G.stemTop, H = G.stemH, D = G.w;

    const flight = dock.animate([
      { transform: t(from.x, from.y), easing: 'cubic-bezier(.3, 0, .5, 1)' },
      { transform: t(from.x, from.y - D * .5, 0, .96, 1.05), offset: .14, easing: 'cubic-bezier(.45, 0, .85, .55)' },
      { transform: t(from.x + (to.x - from.x) * .9, to.y + drop, dir * 6, 1.05, .95), offset: .52, easing: 'cubic-bezier(.15, .65, .35, 1)' },
      { transform: t(to.x, to.y - drop * .2, -dir * 2, .97, 1.04), offset: .72, easing: 'cubic-bezier(.45, 0, .55, 1)' },
      { transform: t(to.x, to.y + drop * .06, dir * .5), offset: .86, easing: 'cubic-bezier(.45, 0, .55, 1)' },
      { transform: t(to.x, to.y) },
    ], { duration: 1250, fill: 'both' });

    // Merge: the pill swallows the dot (their circles coincide at the top),
    // stays one piece through the fall, then buds the dot back off.
    const merge = stem.animate([
      { top: px(T), height: px(H), easing: 'cubic-bezier(.5, 0, .3, 1.2)' },
      { top: '0px', height: px(H + T), offset: .2 },
      { top: '0px', height: px(H + T), offset: .6, easing: 'cubic-bezier(.3, 0, .2, 1.4)' },
      { top: px(T * 1.12), height: px(H - T * .12), offset: .8, easing: 'cubic-bezier(.45, 0, .55, 1)' },
      { top: px(T), height: px(H) },
    ], { duration: 1250, fill: 'both' });
    const bud = dot.animate([
      { opacity: 1, transform: 'translateY(0)', easing: 'cubic-bezier(.5, 0, .3, 1)' },
      { opacity: 1, transform: `translateY(${px(T * .25)})`, offset: .16 },
      { opacity: 0, transform: 'translateY(0)', offset: .21 },
      { opacity: 0, transform: 'translateY(0)', offset: .6 },
      { opacity: 1, transform: `translateY(${px(-T * .3)})`, offset: .72, easing: 'cubic-bezier(.45, 0, .55, 1)' },
      { opacity: 1, transform: `translateY(${px(T * .06)})`, offset: .86 },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 1250, fill: 'both' });

    // Icons and the lens duck out while the glass is in motion.
    const hide = [...items, lens].map(el => el.animate([
      { opacity: 1, scale: 1 },
      { opacity: 0, scale: .6, offset: .12 },
      { opacity: 0, scale: .6, offset: .7 },
      { opacity: 1, scale: 1.08, offset: .88 },
      { opacity: 1, scale: 1 },
    ], { duration: 1250, fill: 'both', easing: 'ease-out' }));

    const all = [flight, merge, bud, ...hide];
    return Promise.all(all.map(settle)).then(() => {
      place(to);
      all.forEach(a => a.cancel());
    });
  }

  // A little nod of the menu when moving between two pages.
  function nudgeDock(dir) {
    const p = G.docked;
    const t = (y, sx = 1, sy = 1) => `translate(${px(p.x)}, ${px(y)}) scale(${sx}, ${sy})`;
    const a = dock.animate([
      { transform: t(p.y) },
      { transform: t(p.y + dir * 12, .97, 1.03), offset: .3 },
      { transform: t(p.y - dir * 4, 1.02, .98), offset: .65 },
      { transform: t(p.y) },
    ], { duration: 600, easing: 'cubic-bezier(.45, 0, .55, 1)' });
    return settle(a);
  }

  /* ---------- Page transitions ---------- */

  async function landingToPage(page) {
    content.innerHTML = page.html;
    scrollTo(0, 0);
    const rise = content.animate(
      [{ transform: 'translateY(100vh)' }, { transform: 'none' }],
      { duration: 950, delay: 680, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'both' });
    await Promise.all([floatAway(), flyDock(G.home, G.docked), settle(rise)]);
    rise.cancel();
  }

  async function pageToLanding(page) {
    const fall = content.animate(
      [{ transform: 'none' }, { transform: 'translateY(100vh)' }],
      { duration: 700, easing: 'cubic-bezier(.6, 0, .8, .3)', fill: 'both' });
    await Promise.all([settle(fall), flyDock(G.docked, G.home), floatHome(250)]);
    content.innerHTML = page.html;
    fall.cancel();
    scrollTo(0, 0);
  }

  // Like scrolling a long page: the old content leaves one way while the new
  // content arrives from the other, quicker for neighbours on the menu.
  async function pageToPage(page, dir, steps) {
    const r = content.getBoundingClientRect();
    const ghost = content.cloneNode(true);
    ghost.removeAttribute('id');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.inert = true;
    // Only what's on screen needs to leave: crop the copy at the viewport's
    // bottom so a long page clears the screen in one screen-height of travel.
    Object.assign(ghost.style, {
      position: 'fixed', top: px(r.top), left: px(r.left), width: px(r.width),
      height: px(innerHeight - r.top), overflow: 'hidden',
      margin: '0', pointerEvents: 'none',
    });
    document.body.append(ghost);
    content.innerHTML = page.html;
    scrollTo(0, 0);

    const timing = { duration: 520 + 90 * steps, easing: 'cubic-bezier(.65, 0, .25, 1)', fill: 'both' };
    const out = ghost.animate([{ transform: 'none' }, { transform: `translateY(${-dir * 100}vh)` }], timing);
    const inn = content.animate([{ transform: `translateY(${dir * 100}vh)` }, { transform: 'none' }], timing);
    await Promise.all([settle(out), settle(inn), nudgeDock(dir)]);
    ghost.remove();
    inn.cancel();
  }

  // Reduced motion: swap everything at once, with a brief fade.
  async function swapQuietly(page) {
    content.innerHTML = page.html;
    scrollTo(0, 0);
    const home = current.key === 'home';
    letters.forEach((el, i) => { el.style.transform = home ? 'none' : awayTransform(away[i]); });
    place(home ? G.home : G.docked);
    await settle(content.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 }));
  }

  /* ---------- Navigation ---------- */

  const pages = new Map();
  function load(route) {
    if (!pages.has(route.key)) {
      pages.set(route.key, fetch(urlOf(route))
        .then(res => { if (!res.ok) throw new Error(res.status); return res.text(); })
        .then(text => {
          const doc = new DOMParser().parseFromString(text, 'text/html');
          return { html: doc.getElementById('content').innerHTML, title: doc.title };
        })
        .catch(err => { pages.delete(route.key); throw err; }));
    }
    return pages.get(route.key);
  }

  async function go(route, push = true) {
    if (busy || route === current) return;
    busy = true;
    const from = current;
    try {
      const page = await load(route);
      current = route;
      if (push) history.pushState({ key: route.key }, '', urlOf(route));
      document.title = page.title;
      markCurrent();
      restLens();

      if (reduceMotion.matches) await swapQuietly(page);
      else if (from.key === 'home') await landingToPage(page);
      else if (route.key === 'home') await pageToLanding(page);
      else {
        const step = ROUTES.indexOf(route) - ROUTES.indexOf(from);
        await pageToPage(page, Math.sign(step), Math.abs(step));
      }
    } catch {
      location.href = urlOf(route);
      return;
    } finally {
      busy = false;
    }
    fit();
    // Catch up if the back/forward buttons were used mid-transition.
    const want = routeAt(location.href);
    if (want && want !== current) go(want, false);
  }

  dock.addEventListener('click', e => {
    const a = e.target.closest('.item');
    if (!a || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    go(ROUTES.find(r => r.key === a.dataset.route));
  });
  // Warm the next page while the pointer is on its way.
  items.forEach(a => a.addEventListener('pointerenter', () =>
    load(ROUTES.find(r => r.key === a.dataset.route)).catch(() => {})));

  addEventListener('popstate', () => {
    const route = routeAt(location.href);
    if (route) go(route, false);
  });

  /* ---------- Start ---------- */

  history.replaceState({ key: current.key }, '');
  markCurrent();
  if (current.key !== 'home')
    letters.forEach((el, i) => { el.style.transform = awayTransform(away[i]); });

  let frame;
  addEventListener('resize', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(fit);
  });
  document.fonts.ready.then(fit);
})();
