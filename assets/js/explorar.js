/* ================================================================
   ARENAS MOTOCICLETAS — explorar.js
   El recorrido pieza por pieza, para cualquier modelo del catálogo.

   QUÉ HACE, EN UNA LÍNEA
   Lee `?slug=`, monta una película que recorre la moto con el scroll y
   debajo los capítulos con las fotografías y los textos que ya existen.

   DE DÓNDE SALE EL CONTENIDO — Y POR QUÉ NO SE ESCRIBE AQUÍ
   Nada de esta página es contenido nuevo:

     · el nombre, la descripción y los tres datos, del catálogo (`NS.data`)
     · la historia, las razones y sus cifras, de `data/fichas-editorial.json`
     · las fotografías y dónde está cada pieza dentro de la lateral, de
       `assets/catalogo/photo-manifest.json`
     · el clip o el modelo 3D, si los hay, de `data/recorridos-medios.json`

   Es la misma capa editorial que pinta la ficha del modelo. Escribir
   aquí un segundo juego de textos garantizaría que algún día la ficha y
   el recorrido dijeran cosas distintas sobre la misma moto, y que nadie
   se enterara hasta que lo viera un cliente.

   LA PELÍCULA SIN MATERIAL NUEVO
   Todas las fotos de detalle de un modelo son recortes de la MISMA foto
   maestra que su lateral, y el manifiesto guarda dónde está cada recorte.
   Así que la cámara puede acercarse al motor dentro de la lateral y, al
   llegar, fundirse con el recorte del motor en alta resolución: encajan
   al píxel. Se pinta en un <canvas>, lo que además evita escribir
   estilos desde JavaScript.

   EL SCROLL NO SE SECUESTRA
   La página se desplaza sola, como cualquier otra. Este archivo solo LEE
   cuánto se ha bajado y coloca la cámara. Para no medir el diseño en
   cada fotograma, la posición de la película se mide al cargar y al
   cambiar el tamaño; en cada fotograma solo se lee `scrollY`. La cámara
   alcanza al scroll con un suavizado exponencial: llega y se asienta,
   nunca se pasa de largo.

   SIN DEPENDENCIAS Y SIN ESTILOS EN LÍNEA
   Solo se añaden y quitan clases. La política de contenido de este sitio
   prohíbe `style=` en el HTML, y esa prohibición es justo lo que permite
   que la política sea estricta. La única librería es three.js, local, y
   solo se descarga para los modelos que tienen 3D (ver explorar-3d.js).
   ================================================================ */

(function (NS) {
  "use strict";

  var U = NS.utils;

  /* Modelo que se abre cuando no llega `?slug=`. La portada enlaza con
     slug explícito; esto solo cubre a quien llegue con la URL pelada. */
  var POR_DEFECTO = "pulsar-200-ns-ug2";

  var RUTA_MEDIOS = "data/recorridos-medios.json";

  /* Rapidez con la que la cámara alcanza al scroll. Más alto, más
     pegada; más bajo, más «grúa». Con 6 tarda unos 0,4 s en asentarse. */
  var SUAVIDAD = 6;

  /* Densidad máxima del lienzo. Por encima de 1,5 la diferencia no se
     ve en una foto de 1800 px y el coste de pintar se dispara. */
  var DPR_MAX = 1.5;

  /* La franja superior de la pantalla, donde vive la cabecera. La
     sección que esté debajo decide si la cabecera va clara u oscura. */
  var FRANJA_CABECERA = "0px 0px -94% 0px";

  var dom = {};
  var reducido = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

  /* ---------------- Utilidades de la página ---------------- */

  function $(sel) { return document.querySelector(sel); }
  function limitar(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function dosCifras(n) { return ("0" + n).slice(-2); }
  function scrollY() { return window.scrollY || window.pageYOffset || 0; }

  /**
   * Curva de un tramo de la película: la cámara se queda quieta un rato
   * en cada plano y viaja entre ellos sin acelerones. `reposo` es la
   * fracción del tramo que pasa quieta a cada lado.
   */
  function tramo(t, reposo) {
    var r = typeof reposo === "number" ? reposo : 0.16;
    var u = limitar((t - r) / (1 - 2 * r), 0, 1);
    return u * u * u * (u * (u * 6 - 15) + 10);
  }

  /**
   * Sustituye el contenido de la página por un aviso legible.
   * No se deja el esqueleto vacío: una página en blanco parece un fallo
   * del navegador, y quien llegue aquí con un enlace viejo merece saber
   * que la moto existe pero el recorrido no.
   */
  function rendirse(titulo, texto) {
    var main = $("#main-content");
    if (!main) return;
    U.vaciar(main);
    var caja = U.el("section", { class: "ex-vacio" });
    caja.appendChild(U.el("h1", { class: "ex-vacio__titulo" }, titulo));
    caja.appendChild(U.el("p", { class: "ex-vacio__texto" }, texto));
    var acciones = U.el("div", { class: "ex-vacio__acciones" });
    acciones.appendChild(
      U.el("a", { class: "ex-pildora ex-pildora--contorno", href: "catalogo.html" }, "Ver el catálogo")
    );
    caja.appendChild(acciones);
    main.appendChild(caja);
  }

  /** JSON del propio sitio, o null. Un registro que no llega no rompe
   *  la página: sin él se ve la película de fotos. */
  function pedirJson(ruta) {
    var control = typeof AbortController === "function" ? new AbortController() : null;
    var reloj = control ? setTimeout(function () { control.abort(); }, 8000) : null;
    return fetch(ruta, { signal: control ? control.signal : undefined })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; })
      .then(function (d) { if (reloj) clearTimeout(reloj); return d; });
  }

  /** Ruta de un medio del registro: relativa, bajo assets/ y con una
   *  extensión conocida. Cualquier otra cosa se descarta. */
  function rutaMedio(valor) {
    var r = U.texto(valor, 200);
    if (!r || r.indexOf("..") !== -1) return "";
    return /^assets\/[A-Za-z0-9._\/-]+\.(glb|gz|mp4|webm|webp|jpg|jpeg|png)$/.test(r) ? r : "";
  }

  function nombreDe(modelo) { return modelo.titulo || modelo.modelo || ""; }

  /* ---------------- Contenido ---------------- */

  /**
   * Las paradas del recorrido, en orden: la historia con la moto entera
   * y luego las razones de la ficha, saltando las que no tengan
   * fotografía publicable — un capítulo sin foto se quedaría cojo justo
   * cuando se está leyendo su texto.
   */
  function construirParadas(modelo, ficha, fotos) {
    var nombre = nombreDe(modelo);
    var paradas = [];

    paradas.push({
      asset: "lateral",
      foto: fotos.lateral,
      kicker: U.texto(ficha.historiaKicker, 40) || "Historia",
      titulo: U.texto(ficha.historiaTitulo, 120) || nombre,
      texto: U.textoLargo(ficha.historia, 900),
      alt: U.texto(modelo.altText, 300) || nombre,
    });

    (ficha.razones || []).forEach(function (r) {
      if (!r || !r.asset) return;
      var foto = fotos[r.asset];
      if (!foto) return;
      paradas.push({
        asset: r.asset,
        foto: foto,
        kicker: U.texto(r.kicker, 40),
        titulo: U.texto(r.titulo, 120),
        texto: U.textoLargo(r.texto, 700),
        dato: U.texto(r.dato, 40),
        datoEtiqueta: U.texto(r.datoEtiqueta, 60),
        // El alt describe la pieza, no repite el nombre de la moto: un
        // lector de pantalla ya lo ha dicho en el título de la página.
        alt: U.texto(r.titulo, 120),
      });
    });

    return paradas;
  }

  /**
   * Rótulo de un plano de la película. Si la pieza tiene capítulo, su
   * tema («Frenada», «Chasis»), que es como la nombra la ficha; si no,
   * el nombre genérico de la pieza.
   */
  function rotuloPieza(pieza, paradas) {
    if (pieza === "lateral") return "Vista lateral";
    for (var i = 1; i < paradas.length; i++) {
      if (paradas[i].asset === pieza && paradas[i].kicker) return paradas[i].kicker;
    }
    var etiquetas = (NS.editorial.CONFIG && NS.editorial.CONFIG.etiquetas) || {};
    return etiquetas[pieza] || pieza;
  }

  /**
   * Los planos de la película de fotos. Abre con la moto completa, visita
   * el faro si existe y no
   * tiene capítulo propio —el plano de detalle con el que empiezan las
   * películas de producto—, se aleja a la lateral, visita las piezas de
   * los capítulos en su orden y vuelve a la lateral para entregar el
   * relevo a los capítulos. Un plano sin recorte no se puede situar
   * dentro de la lateral, y se salta.
   */
  function construirPlanosFotos(paradas, fotos) {
    var lat = fotos.lateral;
    if (!lat || !lat.recorte) return [];
    var usadas = paradas.map(function (p) { return p.asset; });
    var planos = [{ pieza: "lateral", foto: lat, rect: lat.recorte, cerca: false }];
    if (fotos.faro && fotos.faro.recorte && usadas.indexOf("faro") === -1) {
      planos.push({ pieza: "faro", foto: fotos.faro, rect: fotos.faro.recorte, cerca: true });
    }
    paradas.forEach(function (p) {
      if (p.asset === "lateral") return;
      if (p.foto && p.foto.recorte) planos.push({ pieza: p.asset, foto: p.foto, rect: p.foto.recorte, cerca: true });
    });
    planos.push({ pieza: "lateral", foto: lat, rect: lat.recorte, cerca: false });
    return planos;
  }

  /* Una cifra: número (o par de números, «300 / 230») y unidad. «CBS» o
     «LED» no son cifras: no tienen nada que contar. */
  var RE_CIFRA = /^\s*(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+(?:[.,]\d+)?)?)\s*(.*)$/;

  function partirCifra(valor) {
    var m = RE_CIFRA.exec(U.texto(valor, 60));
    if (!m) return null;
    return { num: m[1].replace(/\s*\/\s*/, "/"), unidad: U.texto(m[2], 30) };
  }

  /**
   * Las cifras grandes: hasta tres datos con número, primero los de las
   * razones (cada uno declara su fuente en la ficha editorial) y, si no
   * llegan a dos, los de las características del catálogo, que citan la
   * ficha oficial. Con menos de dos no hay banda: una cifra sola no es
   * una comparación, es un adorno.
   */
  function construirCifras(paradas, modelo) {
    var cifras = [];
    var vistos = {};
    paradas.forEach(function (p, i) {
      if (cifras.length >= 3 || !p.dato) return;
      var c = partirCifra(p.dato);
      if (!c || vistos[c.num]) return;
      vistos[c.num] = true;
      cifras.push({ num: c.num, unidad: c.unidad, etiqueta: p.datoEtiqueta || p.kicker, parada: i });
    });
    if (cifras.length < 2) {
      (modelo.caracteristicas || []).forEach(function (txt) {
        var d = U.partirDato(txt);
        d.valor.split("·").forEach(function (trozo) {
          if (cifras.length >= 3) return;
          var c = partirCifra(trozo);
          if (!c || vistos[c.num]) return;
          vistos[c.num] = true;
          cifras.push({ num: c.num, unidad: c.unidad, etiqueta: d.etiqueta, parada: -1 });
        });
      });
    }
    return cifras.length >= 2 ? cifras : [];
  }

  /** Los planos del modelo 3D, saneados. Un plano mal escrito se
   *  descarta entero: mejor un plano menos que una cámara en el suelo. */
  function sanearPlanos3d(lista) {
    if (!Array.isArray(lista)) return [];
    return lista.map(function (p) {
      if (!p || typeof p !== "object") return null;
      var objetivo = p.objetivo === "centro" ? "centro"
        : Array.isArray(p.objetivo) && p.objetivo.length === 3 && p.objetivo.every(function (v) { return isFinite(v); })
          ? p.objetivo.map(Number) : null;
      var distancia = p.distancia === "encuadre" ? "encuadre" : Number(p.distancia) > 0 ? Number(p.distancia) : null;
      if (!objetivo || !distancia || !isFinite(p.rumbo) || !isFinite(p.altura)) return null;
      return {
        pieza: U.texto(p.pieza, 40),
        objetivo: objetivo,
        rumbo: Number(p.rumbo),
        altura: Number(p.altura),
        distancia: distancia,
      };
    }).filter(Boolean);
  }

  /* ---------------- Pintado: apertura ---------------- */

  function pintarApertura(modelo, paradas) {
    var nombre = nombreDe(modelo);
    var ficha = "modelo.html?slug=" + encodeURIComponent(modelo.slug);

    var kicker = [modelo.subcategoria, modelo.linea].filter(Boolean).join(" · ");
    if (dom.kicker) dom.kicker.textContent = kicker || "Catálogo";

    if (dom.titulo) {
      U.vaciar(dom.titulo);
      // El nombre se parte en dos líneas: la familia arriba y la
      // cilindrada abajo, que es como se nombra una moto en la calle
      // («una Pulsar 200», no «una Pulsar200»). El corte es la primera
      // palabra, que funciona para todas las del catálogo: Pulsar/200 NS,
      // Dominar/400, Discover/125 ST, Boxer/BM150X Disc.
      var corte = nombre.indexOf(" ");
      if (corte > 0) {
        dom.titulo.appendChild(document.createTextNode(nombre.slice(0, corte) + " "));
        dom.titulo.appendChild(U.el("span", {}, nombre.slice(corte + 1)));
      } else {
        dom.titulo.textContent = nombre;
      }
    }

    if (dom.lead) dom.lead.textContent = U.texto(modelo.descripcionCorta, 220);

    var lateral = paradas[0].foto;
    if (dom.poster && lateral) {
      dom.poster.setAttribute("src", lateral.web);
      dom.poster.setAttribute("alt", paradas[0].alt);
      var dim = /^(\d+)x(\d+)$/.exec(lateral.resolucion || "");
      if (dim) { dom.poster.setAttribute("width", dim[1]); dom.poster.setAttribute("height", dim[2]); }
    }

    if (dom.fichaCta) dom.fichaCta.setAttribute("href", ficha);
    if (dom.fichaHero) dom.fichaHero.setAttribute("href", ficha);

    // Los tres datos del pie: las características del catálogo, tal
    // cual. «Motor: 199.5 cc · 23.2 HP» se parte en rótulo y valor.
    if (dom.datos) {
      U.vaciar(dom.datos);
      (modelo.caracteristicas || []).slice(0, 3).forEach(function (c) {
        var d = U.partirDato(c);
        var li = U.el("li");
        if (d.etiqueta) li.appendChild(U.el("span", { class: "ex-datos__etiqueta" }, d.etiqueta));
        li.appendChild(U.el("span", { class: "ex-datos__valor" }, d.valor));
        dom.datos.appendChild(li);
      });
      dom.datos.hidden = !dom.datos.children.length;
    }

    document.title = "Explora la " + nombre + " — ARENAS MOTOCICLETAS";
  }

  /* ---------------- Pintado: capítulos ---------------- */

  /**
   * Fotografía sobre placa de estudio. La proporción se fija desde el
   * manifiesto para que el navegador reserve el hueco antes de descargar
   * y la página no dé un salto. Las imágenes pequeñas usan el derivado
   * `mini`: en una placa de 320 px el `web` sería peso tirado.
   */
  function placa(foto, alt, clase, pequena) {
    var fig = U.el("figure", { class: "ex-placa " + clase });
    var img = U.el("img", {
      src: pequena ? foto.mini : foto.web,
      alt: alt,
      loading: "lazy",
      decoding: "async",
    });
    var dim = /^(\d+)x(\d+)$/.exec(foto.resolucion || "");
    if (dim) { img.setAttribute("width", dim[1]); img.setAttribute("height", dim[2]); }
    fig.appendChild(img);
    return fig;
  }

  function pintarCifras(modelo, cifras) {
    var sec = U.el("section", {
      class: "ex-cifras",
      "data-tono": "oscuro",
      "aria-labelledby": "ex-cifras-titulo",
    });
    var cab = U.el("div", { class: "ex-cifras__cab" });
    cab.appendChild(U.el("h2", { class: "ex-cifras__titulo", id: "ex-cifras-titulo" }, "En cifras"));
    cab.appendChild(U.el("p", { class: "ex-cifras__titulo", "aria-hidden": "true" }, nombreDe(modelo)));
    sec.appendChild(cab);

    cifras.forEach(function (c, i) {
      var p = U.el("p", { class: "ex-cifra" });
      if (c.etiqueta) p.appendChild(U.el("span", { class: "ex-cifra__etiqueta" }, c.etiqueta));
      var valor = U.el("span", { class: "ex-cifra__valor", "aria-hidden": "true" });
      // El número que cuenta lleva el valor final aparte: el contador lo
      // necesita para saber hasta dónde subir, y quien no ve la animación
      // lo lee completo en el <span> oculto.
      valor.appendChild(U.el("span", { class: "ex-cifra__num", "data-final": c.num }, c.num));
      if (c.unidad) valor.appendChild(U.el("span", { class: "ex-cifra__unidad" }, c.unidad));
      p.appendChild(valor);
      p.appendChild(U.el("span", { class: "sr-only" }, c.num + (c.unidad ? " " + c.unidad : "")));
      sec.appendChild(p);

      // La moto va entre la primera y la segunda cifra: así el orden del
      // documento es el mismo que se lee de izquierda a derecha.
      if (i === 0) {
        var fig = U.el("figure", { class: "ex-cifras__moto", "aria-hidden": "true" });
        var foto = dom.lateral;
        var img = U.el("img", { src: foto.web, alt: "", loading: "lazy", decoding: "async" });
        var dim = /^(\d+)x(\d+)$/.exec(foto.resolucion || "");
        if (dim) { img.setAttribute("width", dim[1]); img.setAttribute("height", dim[2]); }
        fig.appendChild(img);
        sec.appendChild(fig);
      }
    });
    return sec;
  }

  /**
   * Los capítulos. Alternan dos composiciones: (a) titular gigante con
   * una fotografía pequeña que flota, y (b) fotografía grande que se
   * revela con el texto al lado. La banda de cifras entra después del
   * tercero, a mitad de camino, que es donde un cambio de luz descansa
   * la vista.
   */
  function pintarCapitulos(modelo, paradas, cifras, fichaTecnica) {
    U.vaciar(dom.capitulos);

    // Un dato que ya sale en grande en la banda no se repite en pequeño
    // dentro de su capítulo.
    var promovidas = {};
    cifras.forEach(function (c) { if (c.parada >= 0) promovidas[c.parada] = true; });
    var dondeCifras = Math.min(3, paradas.length);

    paradas.forEach(function (p, i) {
      if (i === dondeCifras && cifras.length) dom.capitulos.appendChild(pintarCifras(modelo, cifras));

      var titular = i % 2 === 0;
      var id = "ex-cap-" + (i + 1);
      var sec = U.el("section", {
        class: "ex-cap " + (titular ? "ex-cap--titular" : "ex-cap--imagen"),
        "data-tono": "claro",
        "aria-labelledby": id,
      });

      var num = U.el("p", { class: "ex-num ex-revela" });
      num.appendChild(U.el("b", {}, dosCifras(i + 1)));
      num.appendChild(document.createTextNode("/ " + (p.kicker || "")));

      var h2 = U.el("h2", { class: "ex-cap__titulo ex-revela ex-revela--1", id: id }, p.titulo);
      var prosa = p.texto ? U.el("p", { class: "ex-prosa ex-revela ex-revela--2" }, p.texto) : null;

      var dato = null;
      if (p.dato && !promovidas[i]) {
        dato = U.el("p", { class: "ex-cap__dato ex-revela ex-revela--3" });
        dato.appendChild(U.el("span", { class: "ex-cap__dato-valor" }, p.dato));
        if (p.datoEtiqueta) dato.appendChild(U.el("span", { class: "ex-cap__dato-etiqueta" }, p.datoEtiqueta));
      }

      // La lámina técnica cierra el último capítulo: quien ha mirado el
      // motor y los frenos uno por uno es justo quien quiere después la
      // tabla completa. Se abre aparte porque es un documento, no una
      // página del sitio.
      var accion = null;
      if (i === paradas.length - 1 && fichaTecnica) {
        accion = U.el("a", {
          class: "ex-pildora ex-pildora--tinta ex-revela ex-revela--4",
          href: fichaTecnica,
          target: "_blank",
          rel: "noopener noreferrer",
        }, "Ver ficha técnica");
      }

      if (titular) {
        sec.appendChild(num);
        sec.appendChild(h2);
        sec.appendChild(placa(p.foto, p.alt, "ex-cap__detalle", true));
        var cuerpo = U.el("div", { class: "ex-cap__cuerpo" });
        [prosa, dato, accion].forEach(function (n) { if (n) cuerpo.appendChild(n); });
        sec.appendChild(cuerpo);
      } else {
        sec.appendChild(placa(p.foto, p.alt, "ex-cap__imagen", false));
        var texto = U.el("div", { class: "ex-cap__texto" });
        [num, h2, prosa, dato, accion].forEach(function (n) { if (n) texto.appendChild(n); });
        sec.appendChild(texto);
      }

      dom.capitulos.appendChild(sec);
    });

    if (cifras.length && dondeCifras >= paradas.length) {
      dom.capitulos.appendChild(pintarCifras(modelo, cifras));
    }
  }

  /* ---------------- Pintado: cierre ---------------- */

  function pintarCierre(modelo) {
    var nombre = nombreDe(modelo);
    if (dom.cierreTitulo) dom.cierreTitulo.textContent = "¿Te enseñamos la " + nombre + "?";
    if (dom.cierreCta) dom.cierreCta.setAttribute("href", "modelo.html?slug=" + encodeURIComponent(modelo.slug));

    // WhatsApp solo si gerencia aprobó el número. Sin canal confirmado el
    // botón no aparece: un botón que abre un chat inexistente es peor que
    // no tener botón. El enlace se pide al pulsar, no al pintar, porque
    // cada petición reparte la consulta al siguiente asesor.
    if (!NS.whatsapp || !dom.cierreAcciones) return;
    NS.whatsapp.cargar().then(function () {
      if (!NS.whatsapp.disponible()) return;
      var boton = U.el("button", { type: "button", class: "ex-pildora ex-pildora--tinta" }, "Escríbenos por WhatsApp");
      boton.addEventListener("click", function () {
        NS.whatsapp.abrir(NS.whatsapp.enlace(nombre));
      });
      dom.cierreAcciones.insertBefore(boton, dom.cierreCta);
      if (dom.cierreCta) dom.cierreCta.className = "ex-pildora ex-pildora--contorno-tinta";
    });
  }

  /* ---------------- Película de fotografías ---------------- */

  /**
   * La película hecha con las fotos de detalle, pintada en un <canvas>.
   *
   * La cámara es un rectángulo en coordenadas de la foto maestra. Se
   * pinta la lateral entera y, encima, el recorte de la pieza en alta
   * resolución, con los bordes fundidos: según la cámara se acerca, el
   * recorte se enciende y la lateral de alrededor se queda desenfocada
   * por la ampliación, como una profundidad de campo corta.
   *
   * @param {HTMLCanvasElement} lienzo
   * @param {Array<Object>} planos  ver construirPlanosFotos()
   * @param {function} alCargar  se llama cada vez que llega una imagen
   */
  function crearPeliculaFotos(lienzo, planos, alCargar) {
    var ctx = lienzo.getContext && lienzo.getContext("2d");
    if (!ctx || planos.length < 3) return null;

    var latPlano = planos.filter(function (p) { return p.pieza === "lateral"; })[0];
    var imagenes = {};
    var ancho = 1, alto = 1, dpr = 1;
    var camaras = [], anchoLateral = 1;
    var progreso = 0;
    var resolverListo;
    var listo = new Promise(function (r) { resolverListo = r; });

    /* Los bordes del recorte se funden una vez, al cargar, en un lienzo
       aparte: hacerlo en cada fotograma costaría cuatro pasadas más. */
    function fundir(img) {
      var c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      var g = c.getContext("2d");
      g.drawImage(img, 0, 0);
      g.globalCompositeOperation = "destination-in";
      [[c.width, 0], [0, c.height]].forEach(function (d) {
        var gr = g.createLinearGradient(0, 0, d[0], d[1]);
        gr.addColorStop(0, "rgba(0,0,0,0)");
        gr.addColorStop(0.14, "rgba(0,0,0,1)");
        gr.addColorStop(0.86, "rgba(0,0,0,1)");
        gr.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = gr;
        g.fillRect(0, 0, c.width, c.height);
      });
      return c;
    }

    function cargar(pieza, foto, alTerminar) {
      if (imagenes[pieza]) return;
      var img = new Image();
      imagenes[pieza] = { img: img, lista: null };
      img.decoding = "async";
      img.onload = function () {
        imagenes[pieza].lista = pieza === "lateral" ? img : fundir(img);
        if (alTerminar) alTerminar();
        alCargar();
      };
      img.src = foto.web;
    }

    // La lateral primero: sin ella no hay película. Las piezas, después.
    cargar("lateral", latPlano.foto, function () {
      planos.forEach(function (p) { if (p.cerca) cargar(p.pieza, p.foto); });
      resolverListo();
    });

    /** Cámara que deja `rect` ocupando la fracción `margen` del cuadro. */
    function encuadrar(rect, margen) {
      var asp = ancho / alto;
      return {
        cx: rect.x + rect.w / 2,
        cy: rect.y + rect.h / 2,
        w: Math.max(rect.w / margen, (rect.h / margen) * asp),
      };
    }

    function prepararCamaras() {
      var apaisada = ancho / alto > 1.2;
      camaras = planos.map(function (p, i) {
        // En el primer plano la pieza se aparta a la derecha, y si es la
        // moto entera además se aleja un poco: deja sitio al titular, que
        // está a la izquierda.
        var primera = i === 0 && apaisada;
        var c = encuadrar(p.rect, p.cerca ? 0.9 : primera ? 0.66 : (apaisada ? 0.78 : 0.9));
        if (primera) c.cx -= c.w * (p.cerca ? 0.17 : 0.15);
        c.cerca = p.cerca;
        c.wPieza = encuadrar(p.rect, 0.9).w;
        return c;
      });
      anchoLateral = encuadrar(latPlano.rect, 0.78).w;
    }

    /* Deriva dentro de un plano: la cámara no se para del todo, se acerca
       y se desliza un poco (el Ken Burns). `o` va de -1 a 1. */
    function conDeriva(c, o, i) {
      var lado = i % 2 ? 1 : -1;
      return { cx: c.cx + lado * 0.03 * c.w * o, cy: c.cy, w: c.w * (1 - 0.06 * o), cerca: c.cerca };
    }

    function camaraEn(p) {
      var n = camaras.length;
      var pos = p * (n - 1);
      var i = Math.min(n - 2, Math.max(0, Math.floor(pos)));
      var t = pos - i;
      var a = conDeriva(camaras[i], t, i);
      var b = conDeriva(camaras[i + 1], t - 1, i + 1);
      var e = tramo(t);
      // El zoom se interpola en escala logarítmica: acercarse al doble y
      // alejarse a la mitad se sienten a la misma velocidad. Entre dos
      // piezas, la cámara se retira a mitad de camino para que se vea de
      // dónde viene y adónde va.
      var logA = Math.log(a.w), logB = Math.log(b.w);
      var logW = logA + (logB - logA) * e;
      if (a.cerca && b.cerca) {
        var tope = Math.max(0, Math.log(anchoLateral) - Math.max(logA, logB));
        logW += 0.5 * tope * Math.sin(Math.PI * e);
      }
      return { cx: a.cx + (b.cx - a.cx) * e, cy: a.cy + (b.cy - a.cy) * e, w: Math.exp(logW), i: i };
    }

    function pintar() {
      var lat = imagenes.lateral && imagenes.lateral.lista;
      if (!lat || !camaras.length) return;
      var cam = camaraEn(progreso);
      var s = (ancho * dpr) / cam.w;
      var altoCam = cam.w * (alto / ancho);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, lienzo.width, lienzo.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.setTransform(s, 0, 0, s, -(cam.cx - cam.w / 2) * s, -(cam.cy - altoCam / 2) * s);

      // Cuánto se enciende cada pieza cercana: del todo cuando la cámara
      // la encuadra, nada cuando el cuadro es casi el doble de ancho.
      var capas = [];
      [cam.i, cam.i + 1].forEach(function (j) {
        var c = camaras[j], p = planos[j];
        if (!c || !c.cerca) return;
        var im = imagenes[p.pieza] && imagenes[p.pieza].lista;
        if (!im) return;
        var alfa = limitar((1.9 - cam.w / c.wPieza) / 0.75, 0, 1);
        if (alfa > 0) capas.push({ img: im, rect: p.rect, alfa: alfa * alfa * (3 - 2 * alfa) });
      });
      var foco = capas.reduce(function (m, c) { return Math.max(m, c.alfa); }, 0);

      var L = latPlano.rect;
      ctx.globalAlpha = 1 - 0.32 * foco;
      ctx.drawImage(lat, L.x, L.y, L.w, L.h);
      capas.forEach(function (c) {
        ctx.globalAlpha = c.alfa;
        ctx.drawImage(c.img, c.rect.x, c.rect.y, c.rect.w, c.rect.h);
      });
      ctx.globalAlpha = 1;
    }

    function redimensionar() {
      var r = lienzo.getBoundingClientRect();
      ancho = Math.max(1, r.width);
      alto = Math.max(1, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
      lienzo.width = Math.round(ancho * dpr);
      lienzo.height = Math.round(alto * dpr);
      prepararCamaras();
      pintar();
    }

    redimensionar();

    return {
      listo: listo,
      redimensionar: redimensionar,
      setProgreso: function (p) { progreso = p; pintar(); return false; },
      setVisible: function () {},
    };
  }

  /* ---------------- Clip real (fase 2) ---------------- */

  /**
   * El clip del modelo, avanzado por el scroll: su `currentTime` sigue
   * al progreso de la película. Para que eso vaya fluido el vídeo tiene
   * que estar codificado con un fotograma clave en CADA fotograma; si
   * no, cada salto obliga a decodificar desde el último clave y la
   * imagen va a tirones. Cómo codificarlo: ver `_comoSeAnadeUnClip` en
   * data/recorridos-medios.json, que es donde se da de alta.
   *
   * Mismo patrón que catalogo-video.js: el <video> arranca con poster y
   * sin `src`, y la ruta solo se asigna cuando la película está a la
   * vista. El poster es el suelo: si el vídeo no llega, se ve el poster
   * y luego las fotos, nunca un cuadro negro.
   */
  function crearClip(video, cfg, alListo, alFallar) {
    var listo = false;
    video.muted = true;
    video.setAttribute("poster", cfg.poster);
    video.hidden = false;

    video.addEventListener("loadeddata", function () {
      if (listo) return;
      listo = true;
      alListo();
    });
    video.addEventListener("error", function () {
      video.removeAttribute("src");
      video.hidden = true;
      alFallar();
    });

    return {
      cargar: function () {
        if (video.getAttribute("src")) return;
        video.preload = "auto";
        video.src = cfg.video;
        video.load();
      },
      setProgreso: function (p) {
        if (!listo || !isFinite(video.duration) || !video.duration) return false;
        // Mientras el navegador busca un instante no se le pide otro: se
        // reintenta en el fotograma siguiente.
        if (video.seeking) return true;
        var t = p * Math.max(0, video.duration - 0.04);
        if (Math.abs(video.currentTime - t) > 1 / 60) { video.currentTime = t; return true; }
        return false;
      },
      setVisible: function () {},
    };
  }

  /* ---------------- Director: el scroll mueve la cámara ---------------- */

  var estado = {
    capa: null,
    rotulos: [],
    objetivo: 0,
    actual: 0,
    ultimo: 0,
    cuadro: 0,
    visible: true,
    avanzado: false,
    plano: -1,
    top: 0,
    rango: 1,
  };

  /** Solo al cargar y al cambiar el tamaño: medir provoca recálculo de
   *  diseño, y en cada fotograma sería tirar rendimiento. */
  function medir() {
    if (!dom.film) return;
    var r = dom.film.getBoundingClientRect();
    estado.top = r.top + scrollY();
    estado.rango = Math.max(1, dom.film.offsetHeight - window.innerHeight);
  }

  function pedirCuadro() {
    if (!estado.cuadro && estado.visible) estado.cuadro = requestAnimationFrame(cuadro);
  }

  function cuadro(t) {
    estado.cuadro = 0;
    var dt = estado.ultimo ? Math.min(0.05, (t - estado.ultimo) / 1000) : 1 / 60;
    estado.ultimo = t;
    estado.objetivo = limitar((scrollY() - estado.top) / estado.rango, 0, 1);
    estado.actual += (estado.objetivo - estado.actual) * (1 - Math.exp(-dt * SUAVIDAD));
    if (Math.abs(estado.objetivo - estado.actual) < 0.0003) estado.actual = estado.objetivo;

    var otraVez = estado.capa ? estado.capa.setProgreso(estado.actual) : false;
    rotular(estado.actual);

    if (otraVez || estado.actual !== estado.objetivo) pedirCuadro();
    else estado.ultimo = 0;
  }

  /** Rótulo del plano, marcas del progreso y retirada del titular. */
  function rotular(p) {
    // Con histéresis: si el umbral fuera uno solo, un scroll que se
    // queda justo encima haría parpadear el titular.
    var avanzado = estado.avanzado ? p > 0.02 : p > 0.045;
    if (avanzado !== estado.avanzado) {
      estado.avanzado = avanzado;
      dom.film.classList.toggle("is-avanzado", avanzado);
    }

    var n = estado.rotulos.length;
    if (!n) return;
    var i = Math.round(p * (n - 1));
    if (i === estado.plano) return;
    estado.plano = i;

    if (dom.planoNum) dom.planoNum.textContent = dosCifras(i + 1);
    if (dom.plano) {
      U.vaciar(dom.plano);
      dom.plano.appendChild(U.el("b", {}, dosCifras(i + 1) + " / " + dosCifras(n)));
      dom.plano.appendChild(document.createTextNode(" · " + estado.rotulos[i]));
    }
    Array.prototype.forEach.call(dom.marcas.children, function (li, k) {
      li.classList.toggle("is-activo", k === i);
    });
  }

  /** Cambia la capa que manda (fotos, 3D o clip) y sus rótulos. */
  function usarCapa(capa, rotulos) {
    if (estado.capa && estado.capa !== capa && estado.capa.setVisible) estado.capa.setVisible(false);
    estado.capa = capa;
    estado.rotulos = rotulos;
    estado.plano = -1;
    U.vaciar(dom.marcas);
    rotulos.forEach(function () { dom.marcas.appendChild(U.el("li")); });
    if (capa && capa.setVisible) capa.setVisible(estado.visible);
    if (capa) capa.setProgreso(estado.actual);
    rotular(estado.actual);
  }

  /** ¿Merece la pena descargar el 3D aquí? Mismo criterio que la
   *  portada: escritorio con ratón, sin movimiento reducido y sin ahorro
   *  de datos. Son 14 MB. */
  function admite3D() {
    var amplio = window.matchMedia && window.matchMedia("(min-width: 900px) and (pointer: fine)").matches;
    var ahorro = navigator.connection && navigator.connection.saveData;
    return Boolean(amplio && !reducido.matches && !ahorro);
  }

  function cargar3D(cfg, rotulos, respaldo) {
    var host = dom.capa3d;
    if (!host) return;

    // Sin 3D no se pierde nada: la película de fotos sigue debajo.
    function volverAFotos() {
      dom.film.classList.remove("is-3d");
      if (dom.nota) dom.nota.hidden = true;
      if (respaldo && estado.capa !== respaldo.capa) usarCapa(respaldo.capa, respaldo.rotulos);
      pedirCuadro();
    }

    var url = new URL("assets/js/explorar-3d.js", document.baseURI).href;
    import(url)
      .then(function (mod) {
        return mod.crearPelicula3D(host, {
          glb: cfg.glb,
          glbGz: cfg.glbGz,
          planos: cfg.planos,
          // La tarjeta gráfica puede retirar el contexto en cualquier
          // momento (otra pestaña con WebGL, el portátil que ahorra).
          alPerder: volverAFotos,
        });
      })
      .then(function (capa) {
        dom.film.classList.add("is-3d");
        if (cfg.nota && dom.nota) { dom.nota.textContent = cfg.nota; dom.nota.hidden = false; }
        usarCapa(capa, rotulos);
        pedirCuadro();
      })
      .catch(function (error) {
        if (error && error.name !== "AbortError" && window.console) console.warn("Explorar: sin 3D.", error);
        volverAFotos();
      });
  }

  /**
   * Arranca la película. Siempre hay una capa de fotos; el clip o el 3D
   * se ponen encima si el registro los tiene, y si fallan se retiran
   * solos y se vuelve a las fotos.
   */
  function arrancarPelicula(paradas, fotos, medios) {
    var planos = construirPlanosFotos(paradas, fotos);
    var rotulosFotos = planos.map(function (p) { return rotuloPieza(p.pieza, paradas); });
    var fotosCapa = crearPeliculaFotos(dom.lienzo, planos, pedirCuadro);
    var respaldo = fotosCapa ? { capa: fotosCapa, rotulos: rotulosFotos } : null;

    medir();
    if (fotosCapa) {
      usarCapa(fotosCapa, rotulosFotos);
      fotosCapa.listo.then(function () {
        dom.film.classList.add("is-pelicula");
        pedirCuadro();
      });
    }

    window.addEventListener("scroll", pedirCuadro, { passive: true });
    window.addEventListener("resize", U.debounce(function () {
      medir();
      if (fotosCapa) fotosCapa.redimensionar();
      pedirCuadro();
    }, 120), { passive: true });
    window.addEventListener("pageshow", function () { medir(); pedirCuadro(); });

    if ("IntersectionObserver" in window) {
      var cerca = false;
      new IntersectionObserver(function (entradas) {
        estado.visible = entradas[0].isIntersecting;
        if (estado.capa && estado.capa.setVisible) estado.capa.setVisible(estado.visible);
        if (estado.visible) { cerca = true; pedirCuadro(); }
        if (cerca && clip) clip.cargar();
      }, { rootMargin: "200px 0px" }).observe(dom.film);
    }

    var registro = (medios && medios.recorridos && medios.recorridos[dom.slug]) || {};

    // Fase 2: el clip real, si lo hay. Manda sobre el 3D y las fotos.
    var clip = null;
    var cfgClip = registro.clip || {};
    var video = rutaMedio(cfgClip.video), poster = rutaMedio(cfgClip.poster);
    if (video && poster && dom.clip) {
      clip = crearClip(dom.clip, { video: video, poster: poster }, function () {
        dom.film.classList.add("is-clip");
        usarCapa(clip, rotulosFotos);
        pedirCuadro();
      }, function () {
        dom.film.classList.remove("is-clip");
        clip = null;
        if (respaldo) usarCapa(respaldo.capa, respaldo.rotulos);
      });
      dom.film.classList.add("is-clip");
      if (!("IntersectionObserver" in window)) clip.cargar();
      return;
    }

    // El modelo 3D, si lo hay y el equipo lo aguanta. Se pide cuando la
    // película de fotos ya está en pantalla: la primera imagen no espera
    // a una descarga de 14 MB.
    var m3d = registro.modelo3d || {};
    var cfg3d = {
      glb: rutaMedio(m3d.glb),
      glbGz: rutaMedio(m3d.glbGz),
      planos: sanearPlanos3d(m3d.planos),
      nota: U.texto(m3d.nota, 140),
    };
    if (cfg3d.glb && cfg3d.planos.length >= 2 && admite3D()) {
      var rotulos3d = cfg3d.planos.map(function (p) { return rotuloPieza(p.pieza, paradas); });
      (fotosCapa ? fotosCapa.listo : Promise.resolve()).then(function () {
        window.setTimeout(function () { cargar3D(cfg3d, rotulos3d, respaldo); }, 400);
      });
    }
  }

  /* ---------------- Cabecera, revelados y contadores ---------------- */

  /** La cabecera toma el tono de la sección que tiene debajo. */
  function conectarCabecera() {
    if (!dom.header || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) dom.header.classList.toggle("is-claro", e.target.getAttribute("data-tono") === "claro");
      });
    }, { rootMargin: FRANJA_CABECERA });
    Array.prototype.forEach.call(document.querySelectorAll("[data-tono]"), function (el) { io.observe(el); });
  }

  /**
   * Respaldo de los revelados para navegadores sin líneas de tiempo de
   * scroll. Donde las hay, este código no hace nada: lo hace el CSS.
   */
  function conectarRevelados() {
    var soporta = window.CSS && CSS.supports && CSS.supports("animation-timeline: view()");
    if (soporta || reducido.matches || !("IntersectionObserver" in window)) return;
    document.documentElement.classList.add("ex-revela-io");
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    Array.prototype.forEach.call(dom.capitulos.querySelectorAll(".ex-cap"), function (c) { io.observe(c); });
  }

  /**
   * Vuelve a escribir una cifra con sus números multiplicados por `f`,
   * respetando los decimales y el separador del original: «23.2» pasa
   * por «11.6» y no por «11.600000001».
   */
  function cifraParcial(final, f) {
    return final.replace(/\d+(?:[.,]\d+)?/g, function (m) {
      var coma = m.indexOf(",") !== -1;
      var decimales = (m.split(/[.,]/)[1] || "").length;
      var v = (parseFloat(m.replace(",", ".")) * f).toFixed(decimales);
      return coma ? v.replace(".", ",") : v;
    });
  }

  /**
   * Las cifras suben de cero al entrar en pantalla, una vez. Sin
   * movimiento, o sin observador, se quedan con su valor final, que es
   * lo que ya trae el HTML.
   */
  function conectarContadores() {
    var nums = dom.capitulos.querySelectorAll(".ex-cifra__num");
    if (!nums.length || reducido.matches || !("IntersectionObserver" in window)) return;

    Array.prototype.forEach.call(nums, function (n) {
      n.textContent = cifraParcial(n.getAttribute("data-final"), 0);
    });

    function contar(el, retraso) {
      var final = el.getAttribute("data-final");
      var inicio = null;
      function paso(t) {
        if (inicio === null) inicio = t + retraso;
        var u = limitar((t - inicio) / 1600, 0, 1);
        // Sale rápido y frena al llegar, sin pasarse del valor.
        el.textContent = cifraParcial(final, 1 - Math.pow(1 - u, 3));
        if (u < 1) requestAnimationFrame(paso);
        else el.textContent = final;
      }
      requestAnimationFrame(paso);
    }

    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        Array.prototype.forEach.call(e.target.querySelectorAll(".ex-cifra__num"), function (n, i) {
          contar(n, i * 140);
        });
      });
    }, { threshold: 0.4 });
    Array.prototype.forEach.call(dom.capitulos.querySelectorAll(".ex-cifras"), function (s) { io.observe(s); });
  }

  /* ---------------- Arranque ---------------- */

  function iniciar() {
    dom = {
      header: $("#ex-header"),
      film: $("#ex-film"),
      kicker: $("#ex-kicker"),
      titulo: $("#ex-titulo"),
      lead: $("#ex-lead"),
      poster: $("#ex-poster"),
      lienzo: $("#ex-lienzo"),
      capa3d: $("#ex-3d"),
      clip: $("#ex-clip"),
      plano: $("#ex-plano"),
      planoNum: $("#ex-plano-num"),
      marcas: $("#ex-marcas"),
      datos: $("#ex-datos"),
      nota: $("#ex-nota"),
      fichaCta: $("#ex-ficha-cta"),
      fichaHero: $("#ex-ficha-hero"),
      capitulos: $("#ex-capitulos"),
      cierreTitulo: $("#ex-cierre-titulo"),
      cierreCta: $("#ex-cierre-cta"),
      cierreAcciones: $("#ex-cierre-acciones"),
    };
    if (!dom.film || !dom.capitulos || !dom.marcas) return;

    // El slug se valida antes de usarse: llega de la URL, y la URL la
    // escribe cualquiera. Un slug con formato raro no busca nada.
    var slug = U.paramUrl("slug", 80).toLowerCase() || POR_DEFECTO;
    if (!U.slugValido(slug)) {
      rendirse("Recorrido no encontrado", "La dirección no corresponde a ningún modelo del catálogo.");
      return;
    }
    dom.slug = slug;

    Promise.all([NS.data.cargar(), NS.editorial.cargar(), pedirJson(RUTA_MEDIOS)])
      .then(function (r) {
        var modelo = NS.data.porSlug(r[0], slug);
        if (!modelo) {
          rendirse("Modelo no encontrado", "Puede que ya no esté publicado. En el catálogo están todos los disponibles.");
          return;
        }

        var ficha = NS.editorial.fichaDe(slug);
        var fotos = NS.editorial.fotosDe(slug);
        if (!ficha || !fotos.lateral) {
          rendirse(
            "Todavía no hay recorrido de esta moto",
            "Estamos fotografiándola pieza por pieza. Mientras tanto, su ficha completa sí está lista."
          );
          return;
        }

        var paradas = construirParadas(modelo, ficha, fotos);
        if (paradas.length < 4) {
          rendirse(
            "Todavía no hay recorrido de esta moto",
            "Nos faltan fotografías de algunas piezas. Mientras tanto, su ficha completa sí está lista."
          );
          return;
        }

        dom.lateral = fotos.lateral;
        var cifras = construirCifras(paradas, modelo);
        var fichaTecnica = NS.editorial.fichaTecnicaDe ? NS.editorial.fichaTecnicaDe(slug) : "";

        pintarApertura(modelo, paradas);
        pintarCapitulos(modelo, paradas, cifras, fichaTecnica);
        pintarCierre(modelo);
        if (NS.recorridos) NS.recorridos.pintar(r[0], modelo);

        conectarCabecera();
        conectarRevelados();
        conectarContadores();

        // Con movimiento reducido no hay película: la lateral quieta y
        // los textos, como en una ficha impresa.
        if (!reducido.matches) arrancarPelicula(paradas, fotos, r[2]);

        document.documentElement.classList.add("ex-listo");
      })
      .catch(function (error) {
        if (window.console) console.error("Explorar:", error);
        rendirse(
          "No pudimos cargar el recorrido",
          "Puede ser la conexión. Vuelve a intentarlo, o entra al catálogo."
        );
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})(window.ARENAS_CATALOGO);
