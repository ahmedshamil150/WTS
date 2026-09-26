function initPillNav() {
  const circles = document.querySelectorAll('.pill .hover-circle');
  const pills = document.querySelectorAll('.pill');
  const hamburger = document.querySelector('.mobile-menu-button');
  const mobileMenu = document.querySelector('.mobile-menu-popover');
  const logo = document.querySelector('.pill-logo');
  const hasGsap = typeof window.gsap !== 'undefined';

  // ── Mobile menu (works with or without GSAP) ───────────
  if (hamburger && mobileMenu) {
    if (!mobileMenu.id) mobileMenu.id = 'mobile-menu';
    hamburger.setAttribute('aria-controls', mobileMenu.id);
    hamburger.setAttribute('aria-expanded', 'false');

    var setMenu = function(open) {
      mobileMenu.classList.toggle('open', open);
      hamburger.classList.toggle('is-open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-locked', open);
    };

    var isOpen = function() { return mobileMenu.classList.contains('open'); };

    hamburger.addEventListener('click', function() { setMenu(!isOpen()); });

    mobileMenu.querySelectorAll('.mobile-menu-link').forEach(function(link) {
      link.addEventListener('click', function() { setMenu(false); });
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen()) { setMenu(false); hamburger.focus(); }
    });

    document.addEventListener('click', function(e) {
      if (isOpen() && !mobileMenu.contains(e.target) && !hamburger.contains(e.target)) setMenu(false);
    });

    window.addEventListener('resize', function() {
      if (window.innerWidth > 768 && isOpen()) setMenu(false);
    });
  }

  if (!pills.length) return;

  // ── Hover circle geometry (GSAP only) ──────────────────
  if (!hasGsap) return;

  // Layout circles
  function layoutCircles() {
    circles.forEach(circle => {
      const pill = circle.parentElement;
      if (!pill) return;
      const rect = pill.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
      const originY = D - delta;

      circle.style.width = D + 'px';
      circle.style.height = D + 'px';
      circle.style.bottom = -delta + 'px';

      gsap.set(circle, {
        xPercent: -50,
        scale: 0,
        transformOrigin: '50% ' + originY + 'px'
      });

      var label = pill.querySelector('.pill-label');
      var white = pill.querySelector('.pill-label-hover');

      if (label) gsap.set(label, { y: 0 });
      if (white) gsap.set(white, { y: h + 12, opacity: 0 });
    });
  }

  layoutCircles();
  window.addEventListener('resize', layoutCircles);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(layoutCircles).catch(function() {});
  }

  // Hover animations
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  pills.forEach(function(pill, i) {
    var circle = pill.querySelector('.hover-circle');
    var label = pill.querySelector('.pill-label');
    var white = pill.querySelector('.pill-label-hover');
    if (!circle) return;

    var tl = gsap.timeline({ paused: true });
    var h = pill.getBoundingClientRect().height;

    tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease: 'power3.easeOut', overwrite: 'auto' }, 0);
    if (label) tl.to(label, { y: -(h + 8), duration: 2, ease: 'power3.easeOut', overwrite: 'auto' }, 0);
    if (white) {
      gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
      tl.to(white, { y: 0, opacity: 1, duration: 2, ease: 'power3.easeOut', overwrite: 'auto' }, 0);
    }

    pill.addEventListener('mouseenter', function() {
      gsap.killTweensOf(tl);
      tl.tweenTo(tl.duration(), { duration: reduced.matches ? 0 : 0.3, ease: 'power3.easeOut', overwrite: 'auto' });
    });

    pill.addEventListener('mouseleave', function() {
      gsap.killTweensOf(tl);
      tl.tweenTo(0, { duration: reduced.matches ? 0 : 0.2, ease: 'power3.easeOut', overwrite: 'auto' });
    });
  });

  // Logo spin on hover
  if (logo) {
    var logoImg = logo.querySelector('img');
    logo.addEventListener('mouseenter', function() {
      if (!logoImg || reduced.matches) return;
      gsap.set(logoImg, { rotate: 0 });
      gsap.to(logoImg, { rotate: 360, duration: 0.2, ease: 'power3.easeOut', overwrite: 'auto' });
    });
  }
}

document.addEventListener('DOMContentLoaded', initPillNav);
