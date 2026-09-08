const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

menuToggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

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
