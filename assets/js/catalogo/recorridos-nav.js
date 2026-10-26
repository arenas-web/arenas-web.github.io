/* Navigation shares the catalogue publication gate and the editorial media gate. */
(function (NS) {
  'use strict';
  var U = NS.utils;
  function enlace(modelo, actual, imagen) {
    var a = U.el('a', { class: imagen ? 'rec-card' : 'rec-selector__link',
      href: 'explorar.html?slug=' + encodeURIComponent(modelo.slug),
      'aria-current': modelo.slug === actual ? 'page' : null });
    if (imagen) {
      var foto = NS.editorial.fotosDe(modelo.slug).lateral;
      var media = U.el('span', { class: 'rec-card__media' });
      media.appendChild(U.el('img', { src: foto.mini || foto.web, alt: '', width: 360, height: 240,
        loading: 'lazy', decoding: 'async' }));
      a.appendChild(media);
    }
    a.appendChild(U.el('span', { class: 'rec-card__nombre' }, modelo.titulo || modelo.modelo));
    a.appendChild(U.el('span', { class: 'rec-card__flecha', 'aria-hidden': 'true' }, modelo.slug === actual ? '•' : '↗'));
    return a;
  }
  function pintar(estado, modelo) {
    var modelos = estado.modelos.filter(function (m) {
      return NS.schema.esPublicable(m, false) && U.slugValido(m.slug) && NS.editorial.tieneRecorrido(m.slug);
    });
    var nav = document.querySelector('.ex-header__nav');
    if (!nav || modelos.length < 2 || nav.querySelector('.rec-selector')) return;
    var menu = U.el('details', { class: 'rec-selector' });
    var resumen = U.el('summary', {}, 'Motos');
    resumen.appendChild(U.el('span', { class: 'rec-selector__cantidad', 'aria-hidden': 'true' }, ('0' + modelos.length).slice(-2)));
    menu.appendChild(resumen);
    var panel = U.el('div', { class: 'rec-selector__panel' });
    panel.appendChild(U.el('p', { class: 'rec-selector__titulo' }, 'Elige tu próxima ruta'));
    var lista = U.el('ul', { class: 'rec-selector__lista' });
    modelos.forEach(function (m) { var li = U.el('li'); li.appendChild(enlace(m, modelo.slug, false)); lista.appendChild(li); });
    panel.appendChild(lista);
    menu.appendChild(panel);
    nav.insertBefore(menu, nav.firstChild);
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.open) { menu.open = false; resumen.focus(); }
    });
    document.addEventListener('click', function (e) { if (menu.open && !menu.contains(e.target)) menu.open = false; });
    var main = document.getElementById('main-content');
    var coleccion = U.el('section', { class: 'rec-coleccion', 'data-tono': 'oscuro', 'aria-labelledby': 'rec-coleccion-titulo' });
    var cabecera = U.el('div', { class: 'rec-coleccion__cabecera' });
    var textos = U.el('div');
    textos.appendChild(U.el('p', { class: 'rec-coleccion__kicker' }, 'La colección ARENAS'));
    textos.appendChild(U.el('h2', { id: 'rec-coleccion-titulo' }, 'Otra moto. Otra forma de avanzar.'));
    cabecera.appendChild(textos);
    cabecera.appendChild(U.el('a', { href: 'catalogo.html', class: 'rec-coleccion__catalogo' }, 'Ver catálogo ↗'));
    coleccion.appendChild(cabecera);
    var grid = U.el('div', { class: 'rec-coleccion__grid' });
    modelos.forEach(function (m) { grid.appendChild(enlace(m, modelo.slug, true)); });
    coleccion.appendChild(grid);
    main.appendChild(coleccion);
  }
  NS.recorridos = { pintar: pintar };
})(window.ARENAS_CATALOGO);
