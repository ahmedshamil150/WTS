function initCardNav() {
  const nav = document.querySelector('.card-nav');
  const hamburger = document.querySelector('.hamburger-menu');
  const content = document.querySelector('.card-nav-content');
  const cards = document.querySelectorAll('.nav-card');

  if (!nav || !hamburger || !content) return;

  let isExpanded = false;
  let tl = null;

  function calculateHeight() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      const wasVisible = content.style.visibility;
      const wasPointerEvents = content.style.pointerEvents;
      const wasPosition = content.style.position;
      const wasHeight = content.style.height;

      content.style.visibility = 'visible';
      content.style.pointerEvents = 'auto';
      content.style.position = 'static';
      content.style.height = 'auto';

      content.offsetHeight;

      const topBar = 60;
      const padding = 16;
      const contentHeight = content.scrollHeight;

      content.style.visibility = wasVisible;
      content.style.pointerEvents = wasPointerEvents;
      content.style.position = wasPosition;
      content.style.height = wasHeight;

      return topBar + contentHeight + padding;
    }
    return 260;
  }

  function createTimeline() {
    gsap.set(nav, { height: 60, overflow: 'hidden' });
    gsap.set(cards, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(nav, {
      height: calculateHeight,
      duration: 0.4,
      ease: 'power3.out'
    });

    tl.to(cards, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', stagger: 0.08 }, '-=0.1');

    return tl;
  }

  function toggleMenu() {
    if (!isExpanded) {
      hamburger.classList.add('open');
      isExpanded = true;
      if (tl) tl.kill();
      tl = createTimeline();
      tl.play(0);
    } else {
      hamburger.classList.remove('open');
      if (tl) {
        tl.eventCallback('onReverseComplete', function() {
          isExpanded = false;
        });
        tl.reverse();
      }
    }
  }

  hamburger.addEventListener('click', toggleMenu);

  hamburger.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  });

  tl = createTimeline();

  window.addEventListener('resize', function() {
    if (!tl) return;
    if (isExpanded) {
      const newHeight = calculateHeight();
      gsap.set(nav, { height: newHeight });
      tl.kill();
      tl = createTimeline();
      tl.progress(1);
    } else {
      tl.kill();
      tl = createTimeline();
    }
  });
}

document.addEventListener('DOMContentLoaded', initCardNav);
