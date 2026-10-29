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
  // On phones in portrait the word stacks so its letters, and the menu fitted
  // to the "i", can be much larger: 2 for "Er / ic.", 4 for "E / r / i / c.".
  const PHONE_STACK = 2;
  document.documentElement.dataset.stack = PHONE_STACK;

  const ROUTES = [
    { key: 'home',       path: '',            label: 'Home',            icon: 'house' },
    { key: 'about',      path: 'about/',      label: 'About',           icon: 'person-crop-circle' },
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
  // The word is two rows ("Er", "ic.") that sit on one line except when stacked
  // on phones; .brk adds the extra breaks for the four-row stack. Both depend
  // on PHONE_STACK (see app.css).
  const brk = sets => `<span class="brk ${sets}"></span>`;

  document.body.insertAdjacentHTML('afterbegin', SYMBOLS + `
<div class="stage" aria-hidden="true"><div class="word"><span class="row">${letter('E')}${brk('b4')}${letter('r')}</span><span class="row"><span class="i"><span class="i-glyph">i</span><span class="i-baseline"></span></span>${brk('b4')}${letter('c')}${letter('.')}</span></div></div>
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
    // Room above the "i" before any letter: unlimited on one line; on phones,
    // where the word is stacked, down to the baseline of the row above.
    // (Layout offsets, which ignore the letters' float-away transforms.)
    G.room = Infinity;
    for (const ch of letters) {
      const left = ch.offsetLeft, base = ch.offsetTop + ch.offsetHeight * .9;
      if (left < G.home.x + g.w && left + ch.offsetWidth > G.home.x && base <= G.home.y)
        G.room = Math.min(G.room, G.home.y - base);
    }
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

  // Rest on the current page; the landing page lives in the dot, so hide it.
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

  // CSS-style cubic-bezier(x1, y1, x2, y2) as a function of time, for sampling
  // a motion path in script. y may run past 0..1, which is how it overshoots.
  function cubicBezier(x1, y1, x2, y2) {
    const curve = (a, b, t) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
    const slope = (a, b, t) => 3 * a * (1 - t) ** 2 + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t * t;
    return x => {
      let t = x;
      for (let i = 0; i < 8; i++) {
        const d = slope(x1, x2, t);
        if (Math.abs(d) < 1e-6) break;
        t -= (curve(x1, x2, t) - x) / d;
      }
      return curve(y1, y2, Math.min(1, Math.max(0, t)));
    };
  }

  // Where each letter drifts to when it floats away: its own sideways drift
  // and spin, kept so the trip home can retrace it.
  // "c" and "." drift left, away from the edge the menu flies to.
  const away = letters.map((_, i) => ({
    dx: i < 2 ? rand(-7, 7) : rand(-7, -1.5),
    rot: rand(7, 15) * (Math.random() < .5 ? -1 : 1),
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
  // picks up speed. Staggered so they leave one by one, right to left: the
  // "." goes first, being nearest the menu's path to the right edge.
  function floatAway() {
    return Promise.all(letters.map((el, i) => {
      const { dx, rot } = away[i];
      return letterAnim(el, [
        { transform: 'translate(0, 0) rotate(0deg)' },
        { transform: `translate(0, 1.2vh) rotate(${-rot * .12}deg) scale(1.025, .975)`, offset: .1 },
        { transform: `translate(${dx * .3}vw, -9vh) rotate(${rot * .35}deg)`, offset: .34 },
        { transform: `translate(${-dx * .2}vw, -46vh) rotate(${-rot * .4}deg)`, offset: .66 },
        { transform: awayTransform(away[i]) },
      ], { duration: 1000, delay: [105, 70, 25, 0][i] + (i < 3 ? rand(0, 35) : 0), easing: 'cubic-bezier(.4, 0, .65, .6)' });
    }));
  }

  // The same balloons drifting back down and landing with a little bounce.
  function floatHome(delay) {
    return Promise.all(letters.map((el, i) => {
      const { dx, rot } = away[i];
      return letterAnim(el, [
        { transform: awayTransform(away[i]) },
        { transform: `translate(${-dx * .2}vw, -38vh) rotate(${-rot * .35}deg)`, offset: .45 },
        { transform: `translate(${dx * .08}vw, 1vh) rotate(${rot * .08}deg) scale(1.025, .975)`, offset: .8 },
        { transform: `translate(0, -.5vh) rotate(${-rot * .03}deg)`, offset: .91 },
        { transform: 'none' },
      ], { duration: 1250, delay: delay + [50, 0, 100, 25][i] + rand(0, 50), easing: 'cubic-bezier(.2, .55, .35, 1)' });
    }));
  }

  // The menu's trip between the "i" and the right edge: one smooth U-shaped
  // curve that leaves the word straight downwards, sweeps beneath it and
  // rises into place. Keeping below the word means the glass never passes
  // over a letter (it isn't really transparent, so crossing one looks wrong).
  // A single easing runs the whole trip and overshoots at the end, so the
  // rise carries on into the bounce without a seam.
  function flyDock(from, to) {
    const DUR = 1100;
    const dir = Math.sign(to.x - from.x) || 1;
    const T = G.stemTop, H = G.stemH, D = G.w;
    // The bottom of the U: the word's baseline is the bottom of the menu when
    // it sits in the "i", so clear that, but stay on screen.
    const low = Math.min(G.home.y + G.h + D * .5, innerHeight - G.h * .8);
    const deep = low + (low - Math.min(from.y, to.y)) * .45;
    // One easing runs the whole trip; it runs past 1 near the end, which
    // carries the menu on upwards past its spot before it settles back.
    const ease = cubicBezier(.5, 0, .2, 1.35);
    let peak = 0, uMax = 1;  // when (as a fraction of the trip) it tops out
    for (let s = 0; s <= 1; s += .005) if (ease(s) > uMax) { uMax = ease(s); peak = s; }
    // How far past its spot it rises, and how far the dot then shoots up out
    // of the top. Returning to the "i", both are kept within the room above
    // it (on phones the word is stacked, with letters right above the "i").
    const home = to === G.home;
    const room = home ? G.room - 8 : Infinity;
    const over = Math.min(D * (home ? .45 : .3), room * .5);
    const shoot = Math.min(T * .25, room * .5);
    // Cubic Bézier: straight down from the start, straight up into the end.
    const P = [from, { x: from.x, y: deep }, { x: to.x, y: deep }, to];
    // The sideways part of the curve starts a beat after the drop and eases
    // in, so the menu is below the word before it moves across.
    const smooth = e => (e = Math.min(1, Math.max(0, e)), e * e * (3 - 2 * e));
    // Past the end of the curve, the overshoot: it leaves `to` at the climb's
    // own speed and slows to a stop `over` higher, so there's no seam.
    const climb = 3 * (deep - to.y) * (uMax - 1) / over;
    const at = u => {
      if (u > 1) {
        const f = Math.min(1, (u - 1) / (uMax - 1));
        return { x: to.x, y: to.y - over * (1 - (1 - f) ** Math.max(1, climb)) };
      }
      const v = 1 - u, a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, d = u * u * u;
      return { x: from.x + (to.x - from.x) * smooth((u - .2) / .72),
               y: a * P[0].y + b * P[1].y + c * P[2].y + d * P[3].y };
    };

    const frames = [];
    for (let k = 0, n = 60; k <= n; k++) {
      const s = k / n, u = ease(s), p = at(u);
      // Lean into the sideways sweep, and stretch a little along the drop
      // and the climb.
      const sweep = Math.sin(Math.PI * Math.min(1, Math.max(0, u)));
      const stretch = 1 + .03 * Math.sin(Math.PI * Math.min(1, Math.max(0, u)) * 2) ** 2;
      frames.push({
        transform: `translate(${px(p.x)}, ${px(p.y)}) rotate(${(dir * 3 * sweep).toFixed(2)}deg) scale(${(2 - stretch).toFixed(3)}, ${stretch.toFixed(3)})`,
        offset: s,
      });
    }
    const flight = dock.animate(frames, { duration: DUR, fill: 'both' });

    // Merge: the pill swallows the dot (their circles coincide at the top),
    // then, as one piece, shrinks into a small capsule for the fall and
    // springs back out to full size on the climb. It stays one piece until
    // the top of the overshoot; from there a damped spring lets the dot rise
    // out of the top while the pill's top settles back to its place.
    const M = H + T;  // the merged pill's full height
    const pill = (top, height, scale = 1) =>
      ({ top: px(top), height: px(height), left: px(D * (1 - scale) / 2), width: px(D * scale) });
    // Damped spring over the rest of the trip (τ from 0 to 1): `step` eases
    // from 0 to 1 with a soft overshoot; `kick` rises from 0, peaks at 1 and
    // decays back to 0 with a fading wobble.
    const zeta = .55, omega = 11, wd = omega * Math.sqrt(1 - zeta * zeta);
    const step = τ => 1 - Math.exp(-zeta * omega * τ) * (Math.cos(wd * τ) + zeta / Math.sqrt(1 - zeta * zeta) * Math.sin(wd * τ));
    const kickRaw = τ => Math.exp(-zeta * omega * τ) * Math.sin(wd * τ);
    const kickPeak = kickRaw(Math.atan(wd / (zeta * omega)) / wd);
    const kick = τ => kickRaw(τ) / kickPeak;
    const after = (n, fn) => Array.from({ length: n }, (_, k) => {
      const τ = (k + 1) / n;
      return { ...fn(τ), offset: peak + (1 - peak) * τ };
    });

    const merge = stem.animate([
      { ...pill(T, H), easing: 'cubic-bezier(.5, 0, .3, 1.2)' },
      { ...pill(0, M), offset: .12, easing: 'cubic-bezier(.45, 0, .35, 1)' },
      { ...pill(M * .26, M * .48, .78), offset: .26 },
      { ...pill(M * .26, M * .48, .78), offset: peak - .26, easing: 'cubic-bezier(.3, 0, .2, 1.2)' },
      { ...pill(0, M), offset: peak - .08 },
      { ...pill(0, M), offset: peak },
      ...after(20, τ => { const top = T * step(τ); return pill(top, M - top); }),
    ], { duration: DUR, fill: 'both' });
    const bud = dot.animate([
      { opacity: 1, transform: 'translateY(0)', easing: 'cubic-bezier(.5, 0, .3, 1)' },
      { opacity: 1, transform: `translateY(${px(T * .2)})`, offset: .09 },
      { opacity: 0, transform: 'translateY(0)', offset: .12 },
      { opacity: 0, transform: 'translateY(0)', offset: peak },
      ...after(20, τ => ({ opacity: Math.min(1, τ * 6), transform: `translateY(${px(-shoot * kick(τ))})` })),
    ], { duration: DUR, fill: 'both' });

    // Icons and the lens duck out while the glass is in motion, and fade back
    // as it splits.
    const hide = [...items, lens].map(el => el.animate([
      { opacity: 1, scale: 1 },
      { opacity: 0, scale: .7, offset: .1 },
      { opacity: 0, scale: .7, offset: peak },
      ...after(12, τ => ({ opacity: Math.min(1, τ * 2.2), scale: .7 + .3 * step(τ) })),
    ], { duration: DUR, fill: 'both' }));

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
    ], { duration: 540, easing: 'cubic-bezier(.45, 0, .55, 1)' });
    return settle(a);
  }

  /* ---------- Page transitions ---------- */

  // A page can be many screens long, but only the screenful in view should
  // ever move: anything above or below it would slide into view and land on
  // top of the other page. This crops an element to the part on screen now.
  function cropToView(el) {
    const r = el.getBoundingClientRect();
    const top = Math.max(0, -r.top);
    const bottom = Math.max(0, r.bottom - innerHeight);
    el.style.clipPath = `inset(${px(top)} 0 ${px(bottom)} 0)`;
  }
  const uncrop = el => el.style.removeProperty('clip-path');

  async function landingToPage(page) {
    content.innerHTML = page.html;
    scrollTo(0, 0);
    cropToView(content);
    const rise = content.animate(
      [{ transform: 'translateY(100vh)' }, { transform: 'none' }],
      { duration: 850, delay: 600, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'both' });
    await Promise.all([floatAway(), flyDock(G.home, G.docked), settle(rise)]);
    uncrop(content);
    rise.cancel();
  }

  async function pageToLanding(page) {
    cropToView(content);
    const fall = content.animate(
      [{ transform: 'none' }, { transform: 'translateY(100vh)' }],
      { duration: 620, easing: 'cubic-bezier(.6, 0, .8, .3)', fill: 'both' });
    await Promise.all([settle(fall), flyDock(G.docked, G.home), floatHome(200)]);
    content.innerHTML = page.html;
    uncrop(content);
    fall.cancel();
    scrollTo(0, 0);
  }

  // Like scrolling a long page: the old screenful leaves one way while the new
  // page's first screenful arrives from the other, quicker for neighbours on
  // the menu.
  async function pageToPage(page, dir, steps) {
    cropToView(content);
    const r = content.getBoundingClientRect();
    const ghost = content.cloneNode(true);
    ghost.removeAttribute('id');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.inert = true;
    Object.assign(ghost.style, {
      position: 'fixed', top: px(r.top), left: px(r.left), width: px(r.width),
      margin: '0', pointerEvents: 'none',
    });
    document.body.append(ghost);
    content.innerHTML = page.html;
    scrollTo(0, 0);
    cropToView(content);

    const timing = { duration: 460 + 80 * steps, easing: 'cubic-bezier(.65, 0, .25, 1)', fill: 'both' };
    const out = ghost.animate([{ transform: 'none' }, { transform: `translateY(${-dir * 100}vh)` }], timing);
    const inn = content.animate([{ transform: `translateY(${dir * 100}vh)` }, { transform: 'none' }], timing);
    await Promise.all([settle(out), settle(inn), nudgeDock(dir)]);
    ghost.remove();
    uncrop(content);
    inn.cancel();
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

      if (from.key === 'home') await landingToPage(page);
      else if (route.key === 'home') await pageToLanding(page);
      else {
        const step = ROUTES.indexOf(route) - ROUTES.indexOf(from);
        await pageToPage(page, Math.sign(step), Math.abs(step));
      }
    } catch (err) {
      // Anything going wrong mid-transition falls back to a plain page load.
      console.error(err);
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
