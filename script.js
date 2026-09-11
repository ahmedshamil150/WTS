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

const pageHero = document.querySelector('.page-hero');

if (pageHero) {
  const pageName = location.pathname.split('/').pop()?.replace('.html', '') || 'about';
  const themes = {
    products: { name: 'products', background: '#23160b', line: '#fff0b7', glow: '#a85414', accent: '#ffc061' },
    about: { name: 'about', background: '#071f22', line: '#c7fff1', glow: '#087c81', accent: '#74d6cf' },
    blog: { name: 'blog', background: '#162024', line: '#d8ffe1', glow: '#32825b', accent: '#9fe0a8' },
    contact: { name: 'contact', background: '#21111d', line: '#ffe0f0', glow: '#a4316a', accent: '#ff94c1' }
  };
  const theme = themes[pageName] || themes.about;
  pageHero.classList.add(`page-hero--${theme.name}`);
  mountGhostFibers(pageHero, theme);
}

function mountGhostFibers(container, theme) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  container.prepend(canvas);
  const surface = document.createElement('div');
  surface.className = 'page-hero-fibers';
  surface.append(canvas);
  container.prepend(surface);

  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false });
  const showFallback = () => {
    canvas.remove();
    surface.style.background = `radial-gradient(circle at 72% 42%, ${theme.glow}, ${theme.background} 65%)`;
  };
  if (!gl) {
    showFallback();
    return;
  }

  const vertex = `#version 300 es
  in vec2 position;
  void main(){gl_Position=vec4(position,0.0,1.0);}`;
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
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    showFallback();
    return;
  }

  const hexToRgb = (hex) => hex.match(/\w\w/g).map((value) => parseInt(value, 16) / 255);
  const position = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, position);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.useProgram(program);
  const positionLocation = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  const uniforms = {
    resolution: gl.getUniformLocation(program, 'resolution'),
    time: gl.getUniformLocation(program, 'time'),
    line: gl.getUniformLocation(program, 'lineColor'),
    glow: gl.getUniformLocation(program, 'glowColor'),
    background: gl.getUniformLocation(program, 'background')
  };
  gl.uniform3fv(uniforms.line, hexToRgb(theme.line));
  gl.uniform3fv(uniforms.glow, hexToRgb(theme.glow));
  gl.uniform3fv(uniforms.background, hexToRgb(theme.background));

  let frame = 0;
  let visible = true;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const render = (now = 0) => {
    const rect = surface.getBoundingClientRect();
    const density = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.round(rect.width * density));
    const height = Math.max(1, Math.round(rect.height * density));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
    gl.uniform2f(uniforms.resolution, width, height);
    gl.uniform1f(uniforms.time, now * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop = (now) => {
    render(now);
    if (visible && !document.hidden && !motionQuery.matches) frame = requestAnimationFrame(loop);
  };
  const start = () => {
    cancelAnimationFrame(frame);
    render(performance.now());
    if (visible && !document.hidden && !motionQuery.matches) frame = requestAnimationFrame(loop);
  };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; start(); });
  const resizeObserver = new ResizeObserver(() => render(performance.now()));
  observer.observe(container);
  resizeObserver.observe(container);
  document.addEventListener('visibilitychange', start);
  motionQuery.addEventListener('change', start);
  start();
}
