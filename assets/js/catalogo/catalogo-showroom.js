/* Progressive catalogue entrance. Reuses the public model gate and media renderer.
   Manual navigation only: no timer, speculative image preloads or new data source. */
(function (NS) {
  'use strict';
  var host = document.getElementById('catalog-showroom');
  if (!host || !NS || !NS.data || !NS.ui) return;
  var U = NS.utils;
  var models = [], index = 0, revision = 0, current, currentLink;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var visual = U.el('div', {class:'pro-showroom__visual'});
  var word = U.el('span', {class:'pro-showroom__word', 'aria-hidden':'true'});
  var footer = U.el('div', {class:'pro-showroom__footer'});
  var text = U.el('div', {class:'pro-showroom__info'});
  var category = U.el('span', {class:'pro-showroom__category'});
  var name = U.el('div', {class:'pro-showroom__name', 'aria-live':'polite', 'aria-atomic':'true'});
  var controls = U.el('div', {class:'pro-showroom__controls', role:'group', 'aria-label':'Elegir motocicleta'});
  var counter = U.el('span', {class:'pro-showroom__counter', 'aria-hidden':'true'});
  function button(label, symbol, step) {
    var el = U.el('button', {type:'button', 'aria-label':label}, symbol);
    el.addEventListener('click', function () { index = (index + step + models.length) % models.length; show(); });
    return el;
  }
  text.appendChild(category); text.appendChild(name);
  controls.appendChild(counter);
  controls.appendChild(button('Moto anterior', '←', -1));
  controls.appendChild(button('Moto siguiente', '→', 1));
  footer.appendChild(text); footer.appendChild(controls);
  host.appendChild(word); host.appendChild(visual); host.appendChild(footer);
  function destination(model) {
    return NS.ui.urlRecorrido(model) || NS.ui.urlModelo(model);
  }
  function show() {
    var model = models[index], ticket = ++revision;
    var media = NS.ui.media(model, {prioritaria:true, clase:'pro-showroom__media'});
    var img = media.querySelector('img');
    var ready = img && img.decode ? img.decode().catch(function () {}) : Promise.resolve();
    ready.then(function () {
      if (ticket !== revision) return;
      current = model;
      visual.replaceChildren(media);
      category.textContent = NS.data.tituloCategoria(state, model.categoria) + ' / ' + model.linea;
      word.textContent = model.linea || 'ARENAS';
      var link = U.el('a', {class:'pro-showroom__link', href:destination(model)}, model.titulo || model.modelo);
      link.appendChild(U.el('span', {'aria-hidden':'true'}, '↗'));
      name.replaceChildren(link); currentLink = link;
      counter.textContent = String(index+1).padStart(2,'0') + ' / ' + String(models.length).padStart(2,'0');
      host.hidden = false; host.closest('.catalog-intro').classList.add('has-showroom');
      if (!reduceMotion.matches && media.animate) media.animate([{opacity:0,transform:'translateX(16px)'},{opacity:1,transform:'translateX(0)'}], {duration:350,easing:'cubic-bezier(.2,.7,.2,1)'});
    });
  }
  var state;
  NS.data.cargar().then(function (data) {
    state = data;
    models = data.modelos.filter(function (m) { return NS.schema.esPublicable(m,false) && U.slugValido(m.slug); });
    if (!models.length) return;
    var featured = models.findIndex(function (m) { return m.destacado; });
    index = featured < 0 ? 0 : featured;
    controls.hidden = models.length < 2;
    show();
  }).catch(function () { host.hidden = true; });
  // A slow or unavailable editorial source never delays catalogue rendering.
  if (NS.editorial) NS.editorial.cargar().then(function () {
    if (currentLink && current) currentLink.href = destination(current);
  }).catch(function () {});
})(window.ARENAS_CATALOGO);
