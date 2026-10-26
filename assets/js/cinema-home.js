const story = document.querySelector('.cinema-story');
if (story) {
  const viewport = document.querySelector('#cinema-viewport');
  const status = document.querySelector('#cinema-status');
  const start = document.querySelector('#cinema-start');
  const toggle = document.querySelector('#cinema-toggle');
  const views = document.querySelector('#cinema-views');
  const pagination = [...story.querySelectorAll('.cinema-pagination a')];
  const lifecycle = new AbortController();
  const events = { signal: lifecycle.signal };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let engine, loading = false, interactive = false, inView = true, scrollFrame = 0;
  let loaderAbort;
  let automatic = true;
  story.querySelector('.cinema-tools').hidden = false;
  status.textContent = `Experiencia 3D · descarga de ${typeof DecompressionStream !== 'undefined' ? 14 : 20} MB`;

  function fallback() {
    const lostFocus = viewport.contains(document.activeElement) || views.contains(document.activeElement) || document.activeElement === toggle || document.activeElement === start;
    engine?.dispose(); engine = undefined; loading = false;
    viewport.classList.remove('is-ready');
    setInteractive(false);
    toggle.hidden = true; start.hidden = false; start.disabled = false;
    start.textContent = 'Reintentar 3D ↗';
    if (lostFocus) start.focus({ preventScroll: true });
    status.textContent = 'La vista previa sigue disponible. Puedes continuar al catálogo.';
  }
  async function loadModel(explore = false) {
    if (loading || engine) return;
    loading = true; start.disabled = true; status.textContent = 'Cargando la experiencia 3D…';
    loaderAbort = new AbortController();
    try {
      const { createCinema } = await import('./cinema-engine.js');
      engine = await createCinema(viewport, { signal: loaderAbort.signal, onProgress: text => { status.textContent = text; }, onContextLost: fallback });
      if (lifecycle.signal.aborted) { engine.dispose(); return; }
      loading = false;
      viewport.classList.add('is-ready');
      start.hidden = true; toggle.hidden = false;
      status.textContent = 'Desliza para descubrirla o gira la moto a tu ritmo.';
      updateScroll();
      engine.setVisible(inView && !document.hidden);
      if (explore) setInteractive(true);
    } catch (error) {
      if (error.name !== 'AbortError') { console.warn('No se pudo iniciar la experiencia 3D.', error); fallback(); }
    }
  }
  function setInteractive(value) {
    const restoreFocus = interactive && (viewport.contains(document.activeElement) || views.contains(document.activeElement));
    interactive = value && Boolean(engine);
    story.classList.toggle('is-interactive', interactive);
    viewport.classList.toggle('is-interactive', interactive);
    // Hidden copy must also leave the keyboard order while the canvas is in use.
    for (const copy of story.querySelectorAll('.cinema-copy')) copy.inert = interactive;
    toggle.setAttribute('aria-pressed', String(interactive));
    toggle.textContent = interactive ? 'Volver al recorrido' : 'Girar la moto ↗';
    views.hidden = !interactive;
    viewport.setAttribute('role', interactive ? 'group' : 'img');
    engine?.setInteractive(interactive);
    if (interactive) viewport.querySelector('canvas')?.focus({ preventScroll: true });
    else if (restoreFocus && !toggle.hidden) toggle.focus({ preventScroll: true });
    if (engine) status.textContent = interactive ? 'Arrastra para girar. También puedes usar las flechas del teclado.' : 'Desliza para descubrirla o gira la moto a tu ritmo.';
  }
  function updateScroll() {
    scrollFrame = 0;
    const rect = story.getBoundingClientRect();
    const range = Math.max(1, story.offsetHeight - innerHeight);
    const progress = Math.max(0, Math.min(1, -rect.top / range));
    const chapter = Math.min(2, Math.round(progress * 2));
    pagination.forEach((link, index) => { if (index === chapter) link.setAttribute('aria-current', 'step'); else link.removeAttribute('aria-current'); });
    engine?.setProgress(progress);
  }
  function scroll() { if (inView && !scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }
  const visibility = new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    if (!inView && interactive) setInteractive(false);
    engine?.setVisible(inView && !document.hidden);
    if (inView) {
      updateScroll();
      if (automatic && matchMedia('(min-width: 900px) and (pointer: fine)').matches && !reduceMotion.matches && !navigator.connection?.saveData) {
        automatic = false;
        // Let the lightweight poster and readable copy paint before importing Three.
        requestAnimationFrame(() => requestAnimationFrame(() => { if (inView && !document.hidden && !lifecycle.signal.aborted) loadModel(); }));
      }
    }
  }, { threshold: 0 });
  visibility.observe(story);
  start.addEventListener('click', () => { automatic = false; loadModel(true); }, events);
  toggle.addEventListener('click', () => setInteractive(!interactive), events);
  for (const button of views.querySelectorAll('button')) button.addEventListener('click', () => engine?.pose(button.dataset.cinemaPose), events);
  for (const link of pagination) link.addEventListener('click', () => setInteractive(false), events);
  story.addEventListener('keydown', event => { if (event.key === 'Escape' && interactive) { setInteractive(false); toggle.focus(); } }, events);
  window.addEventListener('scroll', scroll, { passive: true, ...events });
  window.addEventListener('resize', scroll, events);
  document.addEventListener('visibilitychange', () => engine?.setVisible(inView && !document.hidden), events);
  window.addEventListener('pagehide', event => {
    if (event.persisted) { engine?.setVisible(false); return; }
    lifecycle.abort(); loaderAbort?.abort(); visibility.disconnect(); cancelAnimationFrame(scrollFrame); engine?.dispose();
  }, events);
  window.addEventListener('pageshow', () => { updateScroll(); engine?.setVisible(inView && !document.hidden); }, events);
}
