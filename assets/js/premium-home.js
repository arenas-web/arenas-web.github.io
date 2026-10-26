const studio = document.querySelector('.premium-studio');
if (studio) {
  const host = studio.querySelector('#studio-viewport');
  const activation = studio.querySelector('.studio-activation');
  const status = studio.querySelector('#studio-status');
  const load = studio.querySelector('#studio-load');
  const dock = studio.querySelector('.studio-dock');
  const hint = studio.querySelector('.studio-hint');
  const lighting = studio.querySelector('.studio-lighting');
  const spin = studio.querySelector('#studio-spin');
  const viewLabel = studio.querySelector('#studio-view-name');
  const lifecycle = new AbortController();
  const events = { signal:lifecycle.signal };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let engine, controller, pending = false, visible = true, automatic = true;
  const viewNames = { whole:'01 / TRES CUARTOS', side:'02 / PERFIL', front:'03 / LUZ Y CARÁCTER', detail:'04 / EN LOS DETALLES' };
  studio.querySelector('#studio-hint-text').textContent = matchMedia('(max-width: 699px), (pointer: coarse)').matches ? 'DESLIZA DE LADO PARA GIRAR' : 'ARRASTRA PARA EXPLORAR';
  activation.hidden = false;
  status.textContent = `Explora en 3D · descarga de ${typeof DecompressionStream !== 'undefined' ? '14' : '20'} MB`;

  function selectView(name) {
    studio.querySelectorAll('[data-studio-pose]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.studioPose === name)));
    if (name) viewLabel.textContent = viewNames[name] || viewNames.whole;
  }
  function stopSpin() {
    engine?.setAutoRotate(false);
    spin.setAttribute('aria-pressed','false'); spin.setAttribute('aria-label','Activar giro automático');
  }
  function fail() {
    const restore = host.contains(document.activeElement) || dock.contains(document.activeElement) || lighting.contains(document.activeElement);
    controller?.abort(); engine?.dispose(); engine = undefined; pending = false;
    selectView('whole');
    host.classList.remove('is-ready'); activation.hidden = false; dock.hidden = true; hint.hidden = true; lighting.hidden = true;
    studio.dataset.light = 'studio'; load.disabled = false; load.textContent = 'Reintentar experiencia 3D ↗';
    status.textContent = 'Puedes seguir explorando el catálogo y el recorrido fotográfico.';
    if (restore) load.focus({preventScroll:true});
  }
  async function enter(manual = false) {
    if (pending || engine || lifecycle.signal.aborted) return;
    pending = true; load.disabled = true; status.textContent = 'Preparando tu nueva perspectiva…';
    controller = new AbortController();
    try {
      const {createPremiumStudio} = await import('./premium-studio.js');
      engine = await createPremiumStudio(host, {signal:controller.signal, onProgress:text => {status.textContent = text;}, onContextLost:fail, onInteraction:() => { stopSpin(); selectView(''); viewLabel.textContent='TU PERSPECTIVA / VISTA LIBRE'; }});
      if (lifecycle.signal.aborted) {engine.dispose(); return;}
      pending = false; activation.hidden = true; dock.hidden = false; hint.hidden = false; lighting.hidden = false;
      engine.setInteractive(true); engine.setVisible(visible && !document.hidden); host.classList.add('is-ready');
      if (manual) host.querySelector('canvas')?.focus({preventScroll:true});
    } catch(error) { if (error.name !== 'AbortError') {console.warn('La experiencia 3D no pudo iniciarse.',error); fail();} }
  }
  load.addEventListener('click',()=>{automatic=false; enter(true);},events);
  for (const button of dock.querySelectorAll('[data-studio-pose]')) button.addEventListener('click',()=>{stopSpin();engine?.pose(button.dataset.studioPose);selectView(button.dataset.studioPose);},events);
  for (const button of lighting.querySelectorAll('[data-studio-light]')) button.addEventListener('click',()=>{
    const mode=button.dataset.studioLight; studio.dataset.light=mode; engine?.setLighting(mode);
    lighting.querySelectorAll('button').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
  },events);
  spin.disabled = reduceMotion.matches;
  spin.addEventListener('click',()=>{
    if (!engine || reduceMotion.matches) return;
    const next=spin.getAttribute('aria-pressed')!=='true';
    if (next) engine.pose('whole',true);
    engine.setAutoRotate(next); selectView(''); viewLabel.textContent=next?'GIRO 360° / ESTUDIO':'TU PERSPECTIVA / VISTA LIBRE'; spin.setAttribute('aria-pressed',String(next)); spin.setAttribute('aria-label',next?'Detener giro automático':'Activar giro automático');
  },events);
  host.addEventListener('keydown',event=>{if(event.key==='Home')selectView('whole');if(event.key==='Escape'){stopSpin();engine?.pose('whole');selectView('whole');dock.querySelector('button').focus({preventScroll:true});}},events);
  reduceMotion.addEventListener('change',()=>{spin.disabled=reduceMotion.matches;if(reduceMotion.matches)stopSpin();},events);
  const observer=new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting; engine?.setVisible(visible&&!document.hidden);
    if (automatic && visible && matchMedia('(min-width: 900px) and (pointer: fine)').matches && !reduceMotion.matches && !navigator.connection?.saveData) {
      automatic=false; requestAnimationFrame(()=>requestAnimationFrame(()=>{if(visible&&!lifecycle.signal.aborted)enter();}));
    }
  },{threshold:0});
  observer.observe(studio);
  document.addEventListener('visibilitychange',()=>engine?.setVisible(visible&&!document.hidden),events);
  window.addEventListener('pagehide',event=>{if(event.persisted){engine?.setVisible(false);return;}lifecycle.abort();controller?.abort();observer.disconnect();engine?.dispose();},events);
  window.addEventListener('pageshow',()=>engine?.setVisible(visible&&!document.hidden),events);
}
