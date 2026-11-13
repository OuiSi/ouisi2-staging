/* ouisi.co — the menu drawer, the header over the hero, the Nature card lookup, the front door slideshow and reviews, the card pages' full-screen view. No dependencies. */
(function () {
  // Menu: the shop's drawer, from the left. Escape, the veil and the close button all shut it;
  // focus stays inside while it is open and returns to the menu button after.
  var btn = document.querySelector('.menu-btn');
  var drawer = document.getElementById('menu');
  if (btn && drawer) {
    var closeBtn = drawer.querySelector('.drawer-close');
    var veil = drawer.querySelector('.drawer-overlay');
    var isOpen = function () { return drawer.classList.contains('open'); };
    var open = function () {
      // every submenu starts closed, its + showing, each time the menu opens (Paul, 11-09)
      drawer.querySelectorAll('.drawer-more').forEach(function (d) { d.open = false; });
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 60);
    };
    var close = function () {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      btn.focus();
    };
    btn.addEventListener('click', function () { if (isOpen()) { close(); } else { open(); } });
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (veil) veil.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      var f = drawer.querySelectorAll('.drawer-panel a, .drawer-panel button');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  // Teaching guides list (Paul, 11-13, direction A): search, subject, grade, time and four toggles narrow the 43 guides;
  // every button shows how many guides it would leave. On a phone the grade, time and toggles open in a sheet.
  (function () {   // its own scope: the names below (more, pick, count …) are used elsewhere in this file
  var gx = document.querySelector('.gx');
  if (gx) {
    var bar = gx.querySelector('.gx-bar'); bar.hidden = false;
    var pick = { q: '', subject: '', grade: '', time: '', np: false, mv: false, grp: false, any: false };
    var tiles = gx.querySelectorAll('.gx-tile'), groupsEls = gx.querySelectorAll('.gx-group');
    var input = bar.querySelector('input[type=search]'), more = bar.querySelector('.gx-more'), openBtn = bar.querySelector('.gx-open');
    var badge = bar.querySelector('.gx-badge'), countEl = bar.querySelector('.gx-count'), clearBtn = bar.querySelector('.gx-clear');
    var showBtn = bar.querySelector('.gx-show'), noneEl = gx.querySelector('.gx-none');
    var info = [];
    for (var i = 0; i < tiles.length; i++) {
      var tl = tiles[i], grp = tl.closest('.gx-group');
      info.push({ el: tl, subject: grp.getAttribute('data-subject'), grades: ' ' + tl.getAttribute('data-grades') + ' ', min: +tl.getAttribute('data-min'),
        np: tl.getAttribute('data-np') === '1', mv: tl.getAttribute('data-mv') === '1', grp: tl.getAttribute('data-grp') === '1', nat: tl.getAttribute('data-nat') === '1',
        text: (tl.textContent + ' ' + grp.querySelector('.gx-group-head').textContent).toLowerCase() });
    }
    var inTime = function (t, m) { return t === '10' ? m <= 15 : t === '30' ? m >= 20 && m <= 30 : t === '45' ? m >= 35 : true; };
    var fits = function (g, p) {
      if (p.subject && g.subject !== p.subject) return false;
      if (p.grade && g.grades.indexOf(' ' + p.grade + ' ') < 0) return false;
      if (p.time && !inTime(p.time, g.min)) return false;
      if (p.np && !g.np) return false;
      if (p.mv && !g.mv) return false;
      if (p.grp && !g.grp) return false;
      if (p.any && g.nat) return false;
      if (p.q && g.text.indexOf(p.q) < 0) return false;
      return true;
    };
    var count = function (change) {   // how many guides the current choices plus one change would leave
      var p = {}, k, n = 0;
      for (k in pick) p[k] = pick[k];
      for (k in change) p[k] = change[k];
      for (var c = 0; c < info.length; c++) if (fits(info[c], p)) n++;
      return n;
    };
    var plural = function (n) { return n + (n === 1 ? ' guide' : ' guides'); };
    var apply = function () {
      var shown = 0, c, g, b, k;
      for (c = 0; c < info.length; c++) { var ok = fits(info[c], pick); info[c].el.hidden = !ok; if (ok) shown++; }
      for (g = 0; g < groupsEls.length; g++) {
        var left = groupsEls[g].querySelectorAll('.gx-tile:not([hidden])').length;
        groupsEls[g].hidden = !left;
        groupsEls[g].querySelector('.gx-group-n').textContent = plural(left);
      }
      var subjBtns = bar.querySelectorAll('[data-subject]');
      for (b = 0; b < subjBtns.length; b++) {
        var sv = subjBtns[b].getAttribute('data-subject');
        subjBtns[b].setAttribute('aria-pressed', String(pick.subject === sv));
        subjBtns[b].querySelector('.gx-n').textContent = count({ subject: sv });
      }
      var segs = bar.querySelectorAll('[data-grade],[data-time]');
      for (b = 0; b < segs.length; b++) {
        k = segs[b].hasAttribute('data-grade') ? 'grade' : 'time';
        segs[b].setAttribute('aria-pressed', String(pick[k] === segs[b].getAttribute('data-' + k)));
      }
      var flagBtns = bar.querySelectorAll('[data-flag]');
      for (b = 0; b < flagBtns.length; b++) {
        k = flagBtns[b].getAttribute('data-flag'); var ch = {}; ch[k] = true;
        flagBtns[b].setAttribute('aria-pressed', String(pick[k]));
        flagBtns[b].querySelector('.gx-n').textContent = count(ch);
      }
      var extra = (pick.grade ? 1 : 0) + (pick.time ? 1 : 0) + (pick.np ? 1 : 0) + (pick.mv ? 1 : 0) + (pick.grp ? 1 : 0) + (pick.any ? 1 : 0);
      var active = extra + (pick.subject ? 1 : 0) + (pick.q ? 1 : 0);
      badge.hidden = !extra; badge.textContent = extra;
      countEl.textContent = active ? shown + ' of ' + info.length + ' guides' : plural(info.length);
      clearBtn.hidden = !active;
      showBtn.textContent = shown ? 'Show ' + plural(shown) : 'No guides match';
      noneEl.hidden = shown > 0;
    };
    var clearAll = function () { pick = { q: '', subject: '', grade: '', time: '', np: false, mv: false, grp: false, any: false }; input.value = ''; apply(); };
    var lastFocus = null;
    var setSheet = function (open) {
      more.classList.toggle('open', open); openBtn.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('gx-sheet-open', open);
      if (open) { lastFocus = document.activeElement; var f = more.querySelector('button'); if (f) f.focus(); }
      else if (lastFocus) lastFocus.focus();
    };
    input.addEventListener('input', function () { pick.q = input.value.trim().toLowerCase(); apply(); });
    bar.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.hasAttribute('data-subject')) pick.subject = t.getAttribute('data-subject');
      else if (t.hasAttribute('data-grade')) pick.grade = t.getAttribute('data-grade');
      else if (t.hasAttribute('data-time')) pick.time = t.getAttribute('data-time');
      else if (t.hasAttribute('data-flag')) { var fk = t.getAttribute('data-flag'); pick[fk] = !pick[fk]; }
      else if (t.classList.contains('gx-clear') || t.classList.contains('gx-clear2')) clearAll();
      else if (t === openBtn) { setSheet(!more.classList.contains('open')); return; }
      else if (t.classList.contains('gx-close') || t.classList.contains('gx-show')) { setSheet(false); return; }
      else return;
      apply();
    });
    gx.querySelector('.gx-clear3').addEventListener('click', clearAll);
    document.addEventListener('click', function (e) { if (more.classList.contains('open') && !more.contains(e.target) && !openBtn.contains(e.target)) setSheet(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && more.classList.contains('open')) setSheet(false); });
    apply();
  }
  })();

  // Teaching guides: Card / Guide / Planning (the teacher session's switch, 11-13). The choice is remembered on this device.
  var guide = document.querySelector('.guide');
  if (guide) {
    var vbtns = guide.querySelectorAll('.g-viewtoggle button'), views = ['card', 'guide', 'plan'];
    var setView = function (v) {
      if (views.indexOf(v) < 0) v = 'guide';
      for (var q = 0; q < views.length; q++) guide.classList.toggle('view-' + views[q], views[q] === v);
      for (var q2 = 0; q2 < vbtns.length; q2++) vbtns[q2].setAttribute('aria-pressed', String(vbtns[q2].getAttribute('data-view') === v));
      try { localStorage.setItem('ouisi-guide-view', v); } catch (e) {}
    };
    for (var vb = 0; vb < vbtns.length; vb++) vbtns[vb].addEventListener('click', function (e) { setView(e.currentTarget.getAttribute('data-view')); });
    try { var saved = localStorage.getItem('ouisi-guide-view'); if (saved) setView(saved); } catch (e) {}
  }

  // Pictures that wait for the hero photo (/portals' doors; Paul, 11-13): on a slow phone they shared its bandwidth and
  // held it back by seconds. They start once the hero photo has arrived (or failed). Without script, <noscript> shows them.
  var later = document.querySelectorAll('img[data-after-hero]');
  if (later.length) {
    var start = function () {
      for (var k = 0; k < later.length; k++) {
        var im = later[k];
        if (im.getAttribute('data-src')) { im.src = im.getAttribute('data-src'); im.removeAttribute('data-src'); }
      }
    };
    var heroPh = document.querySelector('.hero img.ph');
    if (heroPh && !heroPh.complete) {
      heroPh.addEventListener('load', start);
      heroPh.addEventListener('error', start);
    } else start();
  }

  // Header over the hero: transparent while the page is at the top, the shop's green once it moves.
  var hdr = document.querySelector('.hdr[data-transparent]');
  if (hdr) {
    var tick = function () { hdr.classList.toggle('is-solid', window.scrollY > 0); };
    tick();
    window.addEventListener('scroll', tick, { passive: true });
  }

  // Photo Cards text on phones: the first sentence, then "Read more" opens the rest. Without script, all of it shows.
  var more = document.querySelector('.more');
  if (more && window.matchMedia('(max-width: 740px)').matches) {
    var folds = document.querySelectorAll('.fold');
    for (var i = 0; i < folds.length; i++) folds[i].classList.add('folded');
    more.hidden = false;
    more.addEventListener('click', function () {
      for (var k = 0; k < folds.length; k++) folds[k].classList.remove('folded');
      more.setAttribute('aria-expanded', 'true');
      more.hidden = true;
    });
  }

  // Nature card lookup: the number on the card -> that card's page on ouisi.co (11-10; the printed QR codes still open
  // go.ouisi.co/2/N). The form's action is the list of all cards, so the card's page sits beside it at N/index.html.
  var form = document.getElementById('lookup');
  if (form) {
    var input = form.querySelector('input');
    var hint = form.querySelector('.hint');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = parseInt((input.value || '').replace(/\D/g, ''), 10);
      if (n >= 1 && n <= 210) {
        window.location.href = new URL(n + '/index.html', form.action).href;
      } else {
        if (hint) hint.textContent = form.getAttribute('data-hint') || 'Nature cards are numbered 1 to 210.';   // the Getty portal's says Art Cards (11-11)
        input.focus();
      }
    });
    input.addEventListener('input', function () { if (hint) hint.textContent = ''; });
  }

  // The front door's slideshow: the shop's (Focal) hero as read from its theme. Two slides, 4s each; the current bar
  // fills over the 4s and its end moves the show on. The next slide sweeps in from the right (0.5s), then its eyebrow,
  // heading and buttons rise in 0.1s apart. Swipe on touch; each bar is a button. A fade under reduced motion.
  // It holds still while a keyboard is inside it, while it is off the screen and while the tab is hidden.
  var show = document.querySelector('.hero.show');
  var slides = show ? show.querySelectorAll('.slide') : [];
  var nav = show ? show.querySelector('.dots') : null;
  var bars = nav ? nav.querySelectorAll('button') : [];
  if (slides.length > 1 && bars.length === slides.length) {
    var cur = 0, busy = false, holds = {};
    var still = window.matchMedia('(prefers-reduced-motion: reduce)');
    var hold = function (why, on) {
      if (on) { holds[why] = 1; } else { delete holds[why]; }
      show.classList.toggle('paused', Object.keys(holds).length > 0);
    };
    var run = function (i) {
      for (var k = 0; k < bars.length; k++) {
        bars[k].classList.remove('run');
        bars[k].setAttribute('aria-current', k === i ? 'true' : 'false');
      }
      void bars[i].offsetWidth;   // restarts the fill
      bars[i].classList.add('run');
    };
    var go = function (i, fromLeft) {
      if (busy || i === cur) return;
      var from = slides[cur], to = slides[i];
      busy = true;
      to.classList.add('on', 'top');
      run(i);
      var done = function () { from.classList.remove('on'); to.classList.remove('top'); cur = i; busy = false; };
      if (!to.animate) { done(); return; }
      if (still.matches) {
        to.animate({ opacity: [0, 1] }, { duration: 250, easing: 'ease-in-out' }).onfinish = done;
        return;
      }
      to.animate({ clipPath: [fromLeft ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)', 'inset(0 0 0 0)'] },
        { duration: 500, easing: 'cubic-bezier(1, 0, 0, 1)' }).onfinish = done;
      var rise = to.querySelectorAll('.in > *');
      for (var k = 0; k < rise.length; k++) {
        rise[k].animate({ opacity: [0, 1], clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0 0)'], transform: ['translateY(100%)', 'translateY(0)'] },
          { duration: 450, delay: 500 + 100 * k, easing: 'cubic-bezier(0.5, 0.06, 0.01, 0.99)', fill: 'backwards' });
      }
    };
    nav.hidden = false;
    run(0);
    nav.addEventListener('animationend', function (e) {
      if (e.target.parentNode === bars[cur]) go((cur + 1) % slides.length, false);
    });
    Array.prototype.forEach.call(bars, function (b, k) { b.addEventListener('click', function () { go(k, false); }); });
    var x0 = null, y0 = 0;
    show.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; } else { x0 = null; }
    }, { passive: true });
    show.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > 1.5 * Math.abs(dy)) go((cur + (dx < 0 ? 1 : slides.length - 1)) % slides.length, dx > 0);
    }, { passive: true });
    show.addEventListener('focusin', function (e) {
      var keys = true;
      try { keys = e.target.matches(':focus-visible'); } catch (err) { /* older browsers: hold on any focus */ }
      hold('focus', keys);
    });
    show.addEventListener('focusout', function (e) { if (!show.contains(e.relatedTarget)) hold('focus', false); });
    document.addEventListener('visibilitychange', function () { hold('tab', document.hidden); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { hold('away', !en[en.length - 1].isIntersecting); }).observe(show);
    }
  }
  // Front door reviews: the arrows move one quote at a time; a swipe works too; nothing moves on its own (Paul, 11-12).
  var rv = document.querySelector('.reviews');
  if (rv) {
    var rvTrack = rv.querySelector('.track'), rvItems = rvTrack.querySelectorAll('.review');
    var rvPrev = rv.querySelector('.prev'), rvNext = rv.querySelector('.next');
    var rvCalm = window.matchMedia('(prefers-reduced-motion: reduce)');
    var rvAt = function () {
      var step = rvItems.length > 1 ? rvItems[1].offsetLeft - rvItems[0].offsetLeft : 1;
      return Math.max(0, Math.min(rvItems.length - 1, Math.round(rvTrack.scrollLeft / step)));
    };
    var rvMark = function () {
      var i = rvAt();
      rvPrev.setAttribute('aria-disabled', i <= 0 ? 'true' : 'false');
      rvNext.setAttribute('aria-disabled', i >= rvItems.length - 1 ? 'true' : 'false');
    };
    var rvGo = function (d) {
      var i = Math.max(0, Math.min(rvItems.length - 1, rvAt() + d));
      rvTrack.scrollTo({ left: rvItems[i].offsetLeft - rvItems[0].offsetLeft, behavior: rvCalm.matches ? 'auto' : 'smooth' });
    };
    rvPrev.addEventListener('click', function () { rvGo(-1); });
    rvNext.addEventListener('click', function () { rvGo(1); });
    rvTrack.addEventListener('scroll', function () { window.requestAnimationFrame(rvMark); }, { passive: true });
    rv.querySelector('.arrows').hidden = false;
    rvMark();
  }

  // Nature card pages, phone: the card and its whole photo open full screen (Paul, 11-09). Escape, the close
  // button and a tap beside the picture shut it; the two bars switch between card and photo.
  var viewer = document.querySelector('dialog.viewer');
  if (viewer && typeof viewer.showModal === 'function') {
    var bars = viewer.querySelectorAll('.v-bars button');
    var photo = viewer.querySelector('.v-photo'), stage = viewer.querySelector('.v-stage');
    // Long side against long side (Paul, 11-10): when the photo's shape doesn't match how the phone is held, it turns a
    // quarter and fills the screen; turn the phone and it stands upright at full size.
    var fit = function () {
      if (!photo || !stage) return;
      photo.classList.remove('rot'); photo.style.width = '';
      if (viewer.getAttribute('data-view') !== 'photo' || !photo.naturalWidth) return;
      var cs = getComputedStyle(stage), ar = photo.naturalWidth / photo.naturalHeight;
      var W = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), H = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if ((ar > 1) === (H > W)) { photo.style.width = Math.floor(Math.min(H, W * ar)) + 'px'; photo.classList.add('rot'); }
    };
    var view = function (v) {
      viewer.setAttribute('data-view', v);
      for (var i = 0; i < bars.length; i++) bars[i].setAttribute('aria-current', bars[i].getAttribute('data-view') === v ? 'true' : 'false');
      fit();
    };
    if (photo) photo.addEventListener('load', fit);
    window.addEventListener('resize', function () { if (viewer.open) fit(); });
    var zooms = document.querySelectorAll('.zoom');
    for (var z = 0; z < zooms.length; z++) zooms[z].addEventListener('click', function (e) { viewer.showModal(); view(e.currentTarget.getAttribute('data-view')); });
    for (var b = 0; b < bars.length; b++) bars[b].addEventListener('click', function (e) { view(e.currentTarget.getAttribute('data-view')); });
    viewer.querySelector('.v-close').addEventListener('click', function () { viewer.close(); });
    viewer.addEventListener('click', function (e) { if (e.target === viewer || e.target.classList.contains('v-stage')) viewer.close(); });
  }
})();
