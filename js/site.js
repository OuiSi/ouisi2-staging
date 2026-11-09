/* ouisi.co — the menu drawer, the header over the hero, the Nature card lookup, the front door slideshow, the card pages' full-screen view. No dependencies. */
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

  // Nature card lookup: the number on the card -> the same page its QR code opens.
  var form = document.getElementById('lookup');
  if (form) {
    var input = form.querySelector('input');
    var hint = form.querySelector('.hint');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = parseInt((input.value || '').replace(/\D/g, ''), 10);
      if (n >= 1 && n <= 210) {
        window.location.href = 'https://go.ouisi.co/2/' + n;
      } else {
        if (hint) hint.textContent = 'Nature cards are numbered 1 to 210.';
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
  // Nature card pages, phone: the card and its whole photo open full screen (Paul, 11-09). Escape, the close
  // button and a tap beside the picture shut it; the two bars switch between card and photo.
  var viewer = document.querySelector('dialog.viewer');
  if (viewer && typeof viewer.showModal === 'function') {
    var bars = viewer.querySelectorAll('.v-bars button');
    var view = function (v) {
      viewer.setAttribute('data-view', v);
      for (var i = 0; i < bars.length; i++) bars[i].setAttribute('aria-current', bars[i].getAttribute('data-view') === v ? 'true' : 'false');
    };
    var zooms = document.querySelectorAll('.zoom');
    for (var z = 0; z < zooms.length; z++) zooms[z].addEventListener('click', function (e) { view(e.currentTarget.getAttribute('data-view')); viewer.showModal(); });
    for (var b = 0; b < bars.length; b++) bars[b].addEventListener('click', function (e) { view(e.currentTarget.getAttribute('data-view')); });
    viewer.querySelector('.v-close').addEventListener('click', function () { viewer.close(); });
    viewer.addEventListener('click', function (e) { if (e.target === viewer || e.target.classList.contains('v-stage')) viewer.close(); });
  }
})();
