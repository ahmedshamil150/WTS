/* ─── Hero slider ─────────────────────────────────────── */
const heroSlides = document.querySelectorAll('.hero-slide');
const heroDots   = document.querySelectorAll('.hero-dot');
const heroRegion = document.querySelector('.home-hero');
let heroIndex = 0;
let heroTimer;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const showHeroSlide = (next) => {
  heroIndex = (next + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((s, i) => {
    const active = i === heroIndex;
    s.classList.toggle('is-active', active);
    s.setAttribute('aria-hidden', active ? 'false' : 'true');
  });
  heroDots.forEach((d, i) => {
    d.classList.toggle('is-active', i === heroIndex);
    d.setAttribute('aria-current', i === heroIndex ? 'true' : 'false');
  });
};

const stopHeroTimer = () => clearInterval(heroTimer);

const startHeroTimer = () => {
  stopHeroTimer();
  if (!heroSlides.length || reduceMotion.matches || document.hidden) return;
  heroTimer = setInterval(() => showHeroSlide(heroIndex + 1), 6000);
};

if (heroSlides.length) {
  showHeroSlide(0);

  document.querySelector('.hero-prev')?.addEventListener('click', () => { showHeroSlide(heroIndex - 1); startHeroTimer(); });
  document.querySelector('.hero-next')?.addEventListener('click', () => { showHeroSlide(heroIndex + 1); startHeroTimer(); });
  heroDots.forEach((d, i) => d.addEventListener('click', () => { showHeroSlide(i); startHeroTimer(); }));

  // Pause while hovered or focused inside the hero
  heroRegion?.addEventListener('mouseenter', stopHeroTimer);
  heroRegion?.addEventListener('mouseleave', startHeroTimer);
  heroRegion?.addEventListener('focusin', stopHeroTimer);
  heroRegion?.addEventListener('focusout', (e) => {
    if (!heroRegion.contains(e.relatedTarget)) startHeroTimer();
  });

  // Arrow keys while focus is on the slide controls
  heroRegion?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { showHeroSlide(heroIndex - 1); startHeroTimer(); }
    if (e.key === 'ArrowRight') { showHeroSlide(heroIndex + 1); startHeroTimer(); }
  });

  // Touch swipe
  let touchStartX = null;
  heroRegion?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  heroRegion?.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) {
      showHeroSlide(delta < 0 ? heroIndex + 1 : heroIndex - 1);
      startHeroTimer();
    }
    touchStartX = null;
  }, { passive: true });

  document.addEventListener('visibilitychange', () => (document.hidden ? stopHeroTimer() : startHeroTimer()));
  reduceMotion.addEventListener('change', startHeroTimer);
  startHeroTimer();
}

/* ─── Contact form validation (mock submit) ───────────── */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const setFieldError = (field, text) => {
  const label = field.closest('label');
  if (!label) return;
  let error = label.querySelector('.field-error');
  if (!error) {
    error = document.createElement('span');
    error.className = 'field-error';
    error.id = `${field.id}-error`;
    label.appendChild(error);
  }
  error.textContent = text;
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', error.id);
};

const clearFieldError = (field) => {
  const label = field.closest('label');
  label?.querySelector('.field-error')?.remove();
  field.removeAttribute('aria-invalid');
  field.removeAttribute('aria-describedby');
};

const firstInvalidField = (form) => {
  let first = null;
  form.querySelectorAll('input[required], select[required], input[type="email"]').forEach(field => {
    const value = field.value.trim();
    if (!value && !field.required) {
      clearFieldError(field);
    } else if (!value) {
      setFieldError(field, 'This field is required.');
      first ||= field;
    } else if (field.type === 'email' && !EMAIL_PATTERN.test(value)) {
      setFieldError(field, 'Enter a valid email address.');
      first ||= field;
    } else {
      clearFieldError(field);
    }
  });
  return first;
};

const form    = document.querySelector('#contact-form');
const message = document.querySelector('.form-message');

const FORM_ENDPOINT = 'https://formsubmit.co/ajax/wellnesstechnicalsolutions@gmail.com';
const SUPPORT_EMAIL = 'wellnesstechnicalsolutions@gmail.com';

let sending = false;

form?.addEventListener('submit', async e => {
  e.preventDefault();
  if (sending) return;
  const invalid = firstInvalidField(form);
  if (invalid) {
    message.textContent = 'Please check the highlighted fields.';
    message.classList.add('is-error');
    invalid.focus();
    return;
  }
  message.classList.remove('is-error');

  const button    = form.querySelector('button[type="submit"]');
  const firstName = new FormData(form).get('name')?.split(' ')[0].replace(/[.,]+$/, '');
  const success   = `Thanks${firstName ? `, ${firstName}` : ''}. A WTS specialist will be in touch shortly.`;

  sending = true;
  form.setAttribute('aria-busy', 'true');
  button?.setAttribute('disabled', '');

  try {
    const payload = Object.fromEntries(new FormData(form).entries());
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`FormSubmit responded with ${res.status}`);
    message.textContent = success;
    form.reset();
    setTimeout(() => { window.location.href = '/thank-you'; }, 900);
  } catch {
    message.textContent = `Something went wrong. Please email us at ${SUPPORT_EMAIL}.`;
    message.classList.add('is-error');
  } finally {
    sending = false;
    form.removeAttribute('aria-busy');
    button?.removeAttribute('disabled');
  }
});

form?.querySelectorAll('input, select').forEach(field => {
  field.addEventListener('input', () => clearFieldError(field));
});

/* ─── Product filter (Products page) ───────────────────── */
const filterBtns  = document.querySelectorAll('.filter-btn');
const filterCards = document.querySelectorAll('.product-card[data-category]');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.toggle('active', b === btn));
    filterCards.forEach(card => {
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter);
    });
  });
});

/* ─── Page hero WebGL fibers ───────────────────────────── */
const pageHero = document.querySelector('.page-hero');
if (pageHero) {
  const pageName = location.pathname.split('/').pop()?.replace('.html', '') || 'about';
  const themes = {
    products: { name: 'products', background: '#23160b', line: '#fff0b7', glow: '#a85414', accent: '#ffc061' },
    about:    { name: 'about',    background: '#071f22', line: '#c7fff1', glow: '#087c81', accent: '#74d6cf' },
    blog:     { name: 'blog',     background: '#162024', line: '#d8ffe1', glow: '#32825b', accent: '#9fe0a8' },
    contact:  { name: 'contact',  background: '#21111d', line: '#ffe0f0', glow: '#a4316a', accent: '#ff94c1' },
  };
  const key = Object.keys(themes).find(k => pageName === k || pageName.startsWith(`${k}-`)) || 'about';
  const theme = themes[key];
  pageHero.classList.add(`page-hero--${theme.name}`);
  mountGhostFibers(pageHero, theme);
}

function mountGhostFibers(container, theme) {
  const canvas  = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const surface = document.createElement('div');
  surface.className = 'page-hero-fibers';
  surface.append(canvas);
  container.prepend(surface);

  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false });
  const showFallback = () => {
    canvas.remove();
    surface.style.background = `radial-gradient(circle at 72% 42%, ${theme.glow}, ${theme.background} 65%)`;
  };
  if (!gl) { showFallback(); return; }

  const vertex   = `#version 300 es\nin vec2 position;\nvoid main(){gl_Position=vec4(position,0.0,1.0);}`;
  const fragment = `#version 300 es
  precision highp float;
  uniform vec2 resolution;
  uniform float time;
  uniform vec3 lineColor;
  uniform vec3 glowColor;
  uniform vec3 background;
  out vec4 fragColor;
  mat2 rotate2d(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
  void main(){
    vec2 uv=(2.0*gl_FragCoord.xy-resolution)/resolution.y;
    vec2 p=rotate2d(time*.035)*uv/1.65;
    vec3 color=vec3(0.0);
    for(int i=1;i<=5;i++){
      float layer=float(i);
      p+=.018*sin(p.yx*layer*3.0+time*(.16+layer*.07));
      float radius=length(p);
      float angle=atan(p.y,p.x)+sin(radius*4.6-time*.65+layer)*.12;
      p=vec2(cos(angle),sin(angle))*radius;
      float bands=abs(sin(p.x*(4.5+layer*1.8)+sin(p.y*3.0+time)));
      float fiber=pow(max(0.0,1.0-bands),15.0);
      float bloom=exp(-8.0*abs(sin(p.x*3.0+time+layer)));
      color+=lineColor*fiber/layer;
      color+=glowColor*bloom*.7/(layer*2.0);
    }
    float center=exp(-2.0*dot(uv,uv));
    color+=lineColor*center*.28;
    float vignette=1.0-smoothstep(.3,1.42,length(uv));
    vec3 outputColor=background+color*vignette;
    fragColor=vec4(clamp(outputColor,0.0,1.0),1.0);
  }`;
  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { showFallback(); return; }

  const hexToRgb = h => h.match(/\w\w/g).map(v => parseInt(v, 16) / 255);
  const pos = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pos);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
  gl.useProgram(program);
  const pl = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(pl);
  gl.vertexAttribPointer(pl, 2, gl.FLOAT, false, 0, 0);
  const u = {
    resolution: gl.getUniformLocation(program, 'resolution'),
    time:       gl.getUniformLocation(program, 'time'),
    line:       gl.getUniformLocation(program, 'lineColor'),
    glow:       gl.getUniformLocation(program, 'glowColor'),
    background: gl.getUniformLocation(program, 'background'),
  };
  gl.uniform3fv(u.line,       hexToRgb(theme.line));
  gl.uniform3fv(u.glow,       hexToRgb(theme.glow));
  gl.uniform3fv(u.background, hexToRgb(theme.background));

  let frame = 0, visible = true;
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const render = (now = 0) => {
    const rect    = surface.getBoundingClientRect();
    const density = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.round(rect.width  * density));
    const h = Math.max(1, Math.round(rect.height * density));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    gl.uniform2f(u.resolution, w, h);
    gl.uniform1f(u.time, now * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop  = (now) => { render(now); if (visible && !document.hidden && !mq.matches) frame = requestAnimationFrame(loop); };
  const start = ()    => { cancelAnimationFrame(frame); render(performance.now()); if (visible && !document.hidden && !mq.matches) frame = requestAnimationFrame(loop); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }).observe(container);
  new ResizeObserver(() => render(performance.now())).observe(container);
  document.addEventListener('visibilitychange', start);
  mq.addEventListener('change', start);
  start();
}

/* ─── Scroll reveal ────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ─── Stat count-up ─────────────────────────────────────── */
const countObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    obs.unobserve(el);

    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion.matches) {
      el.textContent = target + suffix;
      return;
    }

    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });

document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

/* ─── Sticky mobile CTA ─────────────────────────────────── */
const mobileCta = document.querySelector('.mobile-cta');
if (mobileCta) {
  const toggleCta = () => mobileCta.classList.toggle('is-visible', window.scrollY > 480);
  toggleCta();
  window.addEventListener('scroll', toggleCta, { passive: true });
}
