(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // cabeçalho e menu do celular
  const header = $('.header'), nav = $('.nav'), burger = $('.burger');
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 20);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const setMenu = open => {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', e => e.target.closest('a') && setMenu(false));
  addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));
  document.addEventListener('click', e => !header.contains(e.target) && setMenu(false));

  // item ativo do menu
  const links = $$('.nav > a[href^="#"]');
  const spy = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    links.forEach(a => a.classList.toggle('on', a.hash === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = $(a.hash); if (s) spy.observe(s); });

  // revelar ao rolar
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    io.unobserve(en.target);
    // remove o atraso depois da entrada, para o hover responder na hora
    setTimeout(() => en.target.style.setProperty('--d', '0ms'), 1200);
  }), { threshold: 0.08 });
  $$('.reveal').forEach(el => io.observe(el));

  // antes e depois (com demonstração automática ao aparecer)
  $$('.ba-box').forEach(box => {
    const range = $('input', box);
    let frame = 0, touched = false;
    const set = v => box.style.setProperty('--p', v + '%');
    const stop = () => { touched = true; cancelAnimationFrame(frame); };
    range.addEventListener('input', () => { stop(); set(range.value); });
    range.addEventListener('pointerdown', stop);
    if (calm) return;
    const demo = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      demo.disconnect();
      if (touched) return;
      const t0 = performance.now();
      const step = t => {
        const k = Math.max(0, Math.min((t - t0) / 2600, 1));
        const v = 50 + Math.sin(k * Math.PI * 2) * 32;
        range.value = v; set(v);
        if (k < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }, { threshold: 0.6 });
    demo.observe(box);
  });

  // galeria ampliada
  const lb = $('.lightbox'), lbImg = $('img', lb), lbCap = $('figcaption', lb), shots = $$('.shot');
  let cur = 0;
  const show = i => {
    cur = (i + shots.length) % shots.length;
    lbImg.src = shots[cur].dataset.full;
    lbImg.alt = lbCap.textContent = shots[cur].dataset.cap;
  };
  shots.forEach((s, i) => s.addEventListener('click', () => { show(i); lb.showModal(); }));
  $('.lb-close', lb).addEventListener('click', () => lb.close());
  $('.lb-prev', lb).addEventListener('click', () => show(cur - 1));
  $('.lb-next', lb).addEventListener('click', () => show(cur + 1));
  lb.addEventListener('click', e => e.target === lb && lb.close());
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
  let x0 = null;
  lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    x0 = null;
  });

  $('#ano').textContent = new Date().getFullYear();
})();
