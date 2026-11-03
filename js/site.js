/* ouisi.co — the menu drawer, the header over the hero, the Nature card lookup. No dependencies. */
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
})();
