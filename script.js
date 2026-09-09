const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const header = document.querySelector('.site-header');

menuToggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  header?.classList.toggle('nav-open', isOpen);
  document.body.classList.toggle('nav-locked', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    header?.classList.remove('nav-open');
    document.body.classList.remove('nav-locked');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open navigation');
  });
});

const heroSlides = document.querySelectorAll('.hero-slide');
const heroDots = document.querySelectorAll('.hero-dot');
let heroIndex = 0;
let heroTimer;

const showHeroSlide = (nextIndex) => {
  heroIndex = (nextIndex + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, index) => slide.classList.toggle('is-active', index === heroIndex));
  heroDots.forEach((dot, index) => {
    dot.classList.toggle('is-active', index === heroIndex);
    dot.setAttribute('aria-current', index === heroIndex ? 'true' : 'false');
  });
};

const restartHeroTimer = () => {
  clearInterval(heroTimer);
  heroTimer = setInterval(() => showHeroSlide(heroIndex + 1), 6000);
};

if (heroSlides.length) {
  document.querySelector('.hero-prev')?.addEventListener('click', () => { showHeroSlide(heroIndex - 1); restartHeroTimer(); });
  document.querySelector('.hero-next')?.addEventListener('click', () => { showHeroSlide(heroIndex + 1); restartHeroTimer(); });
  heroDots.forEach((dot, index) => dot.addEventListener('click', () => { showHeroSlide(index); restartHeroTimer(); }));
  restartHeroTimer();
}

const reviewGrid = document.querySelector('.review-grid');

if (reviewGrid) {
  const reviewTrack = document.createElement('div');
  reviewTrack.className = 'review-track';
  const reviewCards = [...reviewGrid.children];
  reviewCards.forEach((card) => reviewTrack.appendChild(card));
  reviewCards.forEach((card) => {
    const duplicate = card.cloneNode(true);
    duplicate.setAttribute('aria-hidden', 'true');
    reviewTrack.appendChild(duplicate);
  });
  reviewGrid.replaceChildren(reviewTrack);
}

const form = document.querySelector('#contact-form');
const message = document.querySelector('.form-message');

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = new FormData(form).get('name');
  const firstName = name?.split(' ')[0].replace(/[.,]+$/, '');
  message.textContent = `Thanks${firstName ? `, ${firstName}` : ''}. A WTS specialist will be in touch shortly.`;
  form.reset();
});

// Product category filter (Products page)
const filterButtons = document.querySelectorAll('.filter-btn');
const filterCards = document.querySelectorAll('.product-card[data-category]');

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    filterButtons.forEach((b) => b.classList.toggle('active', b === btn));
    filterCards.forEach((card) => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !show);
    });
  });
});
