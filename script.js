/* ─── Hero slider ─────────────────────────────────────── */
const heroSlides = document.querySelectorAll('.hero-slide');
const heroDots   = document.querySelectorAll('.hero-dot');
let heroIndex = 0;
let heroTimer;

const showHeroSlide = (next) => {
  heroIndex = (next + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((s, i) => s.classList.toggle('is-active', i === heroIndex));
  heroDots.forEach((d, i) => {
    d.classList.toggle('is-active', i === heroIndex);
    d.setAttribute('aria-current', i === heroIndex ? 'true' : 'false');
  });
};

const restartHeroTimer = () => {
  clearInterval(heroTimer);
  heroTimer = setInterval(() => showHeroSlide(heroIndex + 1), 6000);
};

if (heroSlides.length) {
  document.querySelector('.hero-prev')?.addEventListener('click', () => { showHeroSlide(heroIndex - 1); restartHeroTimer(); });
  document.querySelector('.hero-next')?.addEventListener('click', () => { showHeroSlide(heroIndex + 1); restartHeroTimer(); });
  heroDots.forEach((d, i) => d.addEventListener('click', () => { showHeroSlide(i); restartHeroTimer(); }));
  restartHeroTimer();
}

/* ─── Review scroll carousel ───────────────────────────── */
const reviewGrid = document.querySelector('.review-grid');
if (reviewGrid) {
  const track = document.createElement('div');
  track.className = 'review-track';
  const cards = [...reviewGrid.children];
  cards.forEach(c => track.appendChild(c));
  cards.forEach(c => {
    const dup = c.cloneNode(true);
    dup.setAttribute('aria-hidden', 'true');
    track.appendChild(dup);
  });
  reviewGrid.replaceChildren(track);
}

/* ─── Contact form ─────────────────────────────────────── */
const form    = document.querySelector('#contact-form');
const message = document.querySelector('.form-message');
form?.addEventListener('submit', e => {
  e.preventDefault();
  const name = new FormData(form).get('name');
  const first = name?.split(' ')[0].replace(/[.,]+$/, '');
  message.textContent = `Thanks${first ? `, ${first}` : ''}. A WTS specialist will be in touch shortly.`;
  form.reset();
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
  const theme = themes[pageName] || themes.about;
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
