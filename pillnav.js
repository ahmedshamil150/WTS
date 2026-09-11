function initPillNav() {
  const circles = document.querySelectorAll('.pill .hover-circle');
  const pills = document.querySelectorAll('.pill');
  const hamburger = document.querySelector('.mobile-menu-button');
  const mobileMenu = document.querySelector('.mobile-menu-popover');
  const logo = document.querySelector('.pill-logo');

  if (!pills.length) return;

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
      tl.tweenTo(tl.duration(), { duration: 0.3, ease: 'power3.easeOut', overwrite: 'auto' });
    });

    pill.addEventListener('mouseleave', function() {
      gsap.killTweensOf(tl);
      tl.tweenTo(0, { duration: 0.2, ease: 'power3.easeOut', overwrite: 'auto' });
    });
  });

  // Logo spin on hover
  if (logo) {
    var logoImg = logo.querySelector('img');
    logo.addEventListener('mouseenter', function() {
      if (!logoImg) return;
      gsap.set(logoImg, { rotate: 0 });
      gsap.to(logoImg, { rotate: 360, duration: 0.2, ease: 'power3.easeOut', overwrite: 'auto' });
    });
  }

  // Mobile menu
  if (hamburger && mobileMenu) {
    gsap.set(mobileMenu, { visibility: 'hidden', opacity: 0, scaleY: 1 });
    var isOpen = false;

    hamburger.addEventListener('click', function() {
      isOpen = !isOpen;
      var lines = hamburger.querySelectorAll('.hamburger-line');

      if (isOpen) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease: 'power3.easeOut' });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease: 'power3.easeOut' });
        gsap.set(mobileMenu, { visibility: 'visible' });
        gsap.fromTo(mobileMenu,
          { opacity: 0, y: 10, scaleY: 1 },
          { opacity: 1, y: 0, scaleY: 1, duration: 0.3, ease: 'power3.easeOut', transformOrigin: 'top center' }
        );
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease: 'power3.easeOut' });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease: 'power3.easeOut' });
        gsap.to(mobileMenu, {
          opacity: 0, y: 10, scaleY: 1, duration: 0.2, ease: 'power3.easeOut', transformOrigin: 'top center',
          onComplete: function() { gsap.set(mobileMenu, { visibility: 'hidden' }); }
        });
      }
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('.mobile-menu-link').forEach(function(link) {
      link.addEventListener('click', function() {
        isOpen = false;
        var lines = hamburger.querySelectorAll('.hamburger-line');
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease: 'power3.easeOut' });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease: 'power3.easeOut' });
        gsap.to(mobileMenu, {
          opacity: 0, y: 10, duration: 0.2, ease: 'power3.easeOut',
          onComplete: function() { gsap.set(mobileMenu, { visibility: 'hidden' }); }
        });
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', initPillNav);
