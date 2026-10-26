/* ================================================================
   ARENAS MOTOCICLETAS — explorar-3d.js
   La película de explorar.html sobre el modelo 3D, para los modelos
   que lo tienen en data/recorridos-medios.json.

   QUÉ HACE, EN UNA LÍNEA
   Recibe un progreso de 0 a 1 y coloca la cámara en el plano que toca,
   interpolando entre las tomas del registro.

   POR QUÉ NO SE REUTILIZA cinema-engine.js
   El motor de la portada mueve la cámara entre tres ángulos fijos y
   además deja girar la moto con el ratón. Aquí la cámara viaja de pieza
   en pieza según una lista que viene de datos. Meter las dos cosas en un
   solo motor obligaría a tocar la portada para cambiar el recorrido. Lo
   que sí se comparte es lo que importa que sea idéntico: el mismo .glb
   aprobado, el mismo descompresor y la misma luz de estudio.

   CÓMO LLEGA AQUÍ
   explorar.js lo importa con `import()` solo en escritorio con ratón,
   sin movimiento reducido y sin ahorro de datos. En cualquier otro caso
   este archivo ni se descarga, y se ve la película de fotos.

   SIN SUAVIZADO PROPIO
   El suavizado del scroll lo hace explorar.js, el mismo para las fotos,
   el 3D y el clip. Si este módulo suavizara también, la cámara llegaría
   tarde dos veces.
   ================================================================ */

import * as THREE from '../vendor/three/three.module.js';
import { GLTFLoader } from '../vendor/three/GLTFLoader.js';
import { MeshoptDecoder } from '../vendor/meshopt/meshopt_decoder.js';

const GRADO = Math.PI / 180;

/** Curva de los tramos: se queda quieta un rato en cada plano y viaja
 *  entre ellos sin acelerones. `reposo` es la fracción de tramo que la
 *  cámara pasa quieta a cada lado. */
function tramo(t, reposo = 0.16) {
  const u = Math.min(1, Math.max(0, (t - reposo) / (1 - 2 * reposo)));
  return u * u * u * (u * (u * 6 - 15) + 10);
}

/**
 * @param {HTMLElement} host  contenedor del lienzo
 * @param {{glb:string, glbGz?:string, planos:Array, signal?:AbortSignal}} opciones
 */
export async function crearPelicula3D(host, { glb, glbGz, planos, signal, alPerder = () => {} } = {}) {
  let renderer, scene, environment, model;
  let disposed = false, visible = true, frame = 0, pendiente = false;
  let progreso = 0;
  const recursos = new Set();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.02, 40);
  const bounds = new THREE.Box3();
  // Antes de cargar el modelo, el centro aproximado de una moto: las
  // lámparas del estudio se orientan hacia él.
  const centro = new THREE.Vector3(0, 0.65, 0);
  const esquinas = [];
  let tomas = [];
  let observador;

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observador?.disconnect();
    signal?.removeEventListener('abort', dispose);
    if (scene) scene.traverse(object => {
      if (object.geometry) recursos.add(object.geometry);
      for (const material of (Array.isArray(object.material) ? object.material : [object.material])) {
        if (!material) continue;
        recursos.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) recursos.add(value);
      }
    });
    for (const recurso of recursos) recurso.dispose();
    environment?.dispose();
    renderer?.dispose();
    renderer?.domElement.remove();
  }

  /** Dirección de cámara desde el rumbo y la altura (ver _planos3d). */
  function direccion(rumbo, altura) {
    const r = rumbo * GRADO, a = altura * GRADO;
    return new THREE.Vector3(Math.sin(r) * Math.cos(a), Math.sin(a), Math.cos(r) * Math.cos(a)).normalize();
  }

  /** Distancia a la que la moto entera cabe en el cuadro, mirando desde
   *  `dir`. Es el mismo cálculo que el motor de la portada. */
  function encuadre(dir) {
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(up, dir).normalize();
    up.copy(dir).cross(right).normalize();
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    let distancia = 1.4;
    for (const esquina of esquinas) {
      const rel = esquina.clone().sub(centro);
      distancia = Math.max(distancia,
        rel.dot(dir) + Math.abs(rel.dot(right)) / (tanV * camera.aspect * 0.8),
        rel.dot(dir) + Math.abs(rel.dot(up)) / (tanV * 0.8));
    }
    return distancia;
  }

  /** Convierte los planos del registro en tomas numéricas. Se rehace al
   *  cambiar el tamaño: el encuadre depende de la proporción. */
  function prepararTomas() {
    tomas = planos.map(p => {
      const objetivo = Array.isArray(p.objetivo) && p.objetivo.length === 3
        ? new THREE.Vector3(+p.objetivo[0] || 0, +p.objetivo[1] || 0, +p.objetivo[2] || 0)
        : centro.clone();
      const rumbo = Number(p.rumbo) || 0;
      const altura = Number(p.altura) || 0;
      const distancia = p.distancia === 'encuadre' || !(Number(p.distancia) > 0)
        ? encuadre(direccion(rumbo, altura))
        : Number(p.distancia);
      return { objetivo, rumbo, altura, distancia, cerca: p.distancia !== 'encuadre' };
    });
  }

  /** La toma de un plano con su deriva: mientras se está «en» un plano
   *  la cámara no se para del todo, se acerca y rodea un poco. Es el
   *  efecto Ken Burns del 3D. `o` va de -1 (llegando) a 1 (saliendo). */
  function conDeriva(toma, o) {
    return {
      objetivo: toma.objetivo,
      rumbo: toma.rumbo + 2.5 * o,
      altura: toma.altura,
      distancia: toma.distancia * (1 - 0.045 * o),
      cerca: toma.cerca,
    };
  }

  function colocarCamara() {
    const n = tomas.length;
    if (!n) return;
    const pos = progreso * (n - 1);
    const i = Math.min(n - 2, Math.max(0, Math.floor(pos)));
    const t = n > 1 ? pos - i : 0;
    const a = conDeriva(tomas[i], t);
    const b = n > 1 ? conDeriva(tomas[i + 1], t - 1) : a;
    const e = tramo(t);

    const objetivo = a.objetivo.clone().lerp(b.objetivo, e);
    const rumbo = a.rumbo + (b.rumbo - a.rumbo) * e;
    const altura = a.altura + (b.altura - a.altura) * e;
    // La distancia se interpola en escala logarítmica para que acercarse
    // y alejarse se sientan a la misma velocidad. Entre dos primeros
    // planos lejanos, la cámara se retira a mitad de camino: si fuera en
    // línea recta pasaría rozando la moto.
    const salto = a.cerca && b.cerca ? 0.32 * a.objetivo.distanceTo(b.objetivo) / 0.5 : 0;
    const logD = Math.log(a.distancia) + (Math.log(b.distancia) - Math.log(a.distancia)) * e
      + Math.min(0.55, salto) * Math.sin(Math.PI * e);

    camera.position.copy(objetivo).addScaledVector(direccion(rumbo, altura), Math.exp(logD));
    camera.lookAt(objetivo);
  }

  function pintar() {
    frame = 0;
    pendiente = false;
    if (disposed || !visible) return;
    colocarCamara();
    renderer.render(scene, camera);
  }

  function pedirPintado() {
    if (pendiente || disposed || !visible) return;
    pendiente = true;
    frame = requestAnimationFrame(pintar);
  }

  function redimensionar() {
    if (disposed) return;
    const ancho = Math.max(1, host.clientWidth), alto = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(ancho, alto, false);
    camera.aspect = ancho / alto;
    camera.updateProjectionMatrix();
    prepararTomas();
    pedirPintado();
  }

  try {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    if (!Array.isArray(planos) || planos.length < 2) throw new Error('Sin planos 3D');

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.transmissionResolutionScale = 0.5;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    // La moto y las luces no se mueven: la sombra se calcula una vez.
    renderer.shadowMap.autoUpdate = false;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      const yaEnPantalla = Boolean(model);
      dispose();
      if (yaEnPantalla) alPerder();
    });
    host.append(renderer.domElement);
    signal?.addEventListener('abort', dispose, { once: true });

    scene = new THREE.Scene();

    // Luz de estudio: la misma receta que el motor de la portada, para
    // que la moto se vea igual en las dos páginas.
    const estudio = new THREE.Scene();
    estudio.background = new THREE.Color(0.075, 0.08, 0.09);
    const lamparas = [];
    for (const [posicion, tam, radiancia] of [[[-2.5, 4, 3.6], [3, 3.2], 4.5], [[3.8, 2.1, 1.9], [2.4, 3], 1.7], [[-1.6, 2.8, -3.8], [3, 1.3], 3]]) {
      const plano = new THREE.Mesh(new THREE.PlaneGeometry(...tam), new THREE.MeshBasicMaterial({ color: new THREE.Color(radiancia, radiancia, radiancia), side: THREE.DoubleSide }));
      plano.position.set(...posicion); plano.lookAt(centro); estudio.add(plano); lamparas.push(plano);
    }
    const pmrem = new THREE.PMREMGenerator(renderer);
    environment = pmrem.fromScene(estudio, 0.04);
    pmrem.dispose();
    for (const lampara of lamparas) { lampara.geometry.dispose(); lampara.material.dispose(); }
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.95;
    scene.add(new THREE.HemisphereLight(0xf5f7fc, 0x353b44, 1.35));
    let llave;
    for (const [color, fuerza, posicion] of [[0xfffaf2, 2.8, [-2.5, 4, 3.6]], [0xc8dcff, 1.3, [3.8, 2.1, 1.9]], [0x9fbdff, 2.1, [-1.6, 2.8, -3.8]]]) {
      const luz = new THREE.DirectionalLight(color, fuerza); luz.position.set(...posicion); scene.add(luz);
      if (!llave) { llave = luz; luz.castShadow = true; luz.shadow.mapSize.setScalar(1024); luz.shadow.radius = 8; luz.shadow.normalBias = 0.0008; luz.shadow.bias = -0.00004; }
    }

    // El .gz pesa 14 MB en vez de 20 y el navegador lo descomprime solo.
    const base = new URL(document.baseURI);
    const usarGz = Boolean(glbGz) && typeof DecompressionStream !== 'undefined';
    const url = new URL(usarGz ? glbGz : glb, base);
    const respuesta = await fetch(url, { signal });
    if (!respuesta.ok) throw new Error('Modelo ' + respuesta.status);
    const buffer = usarGz
      ? await new Response(respuesta.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
      : await respuesta.arrayBuffer();
    if (disposed || signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    let fallaTextura = false;
    const gestor = new THREE.LoadingManager();
    gestor.onError = () => { fallaTextura = true; };
    const loader = new GLTFLoader(gestor).setMeshoptDecoder(MeshoptDecoder);
    await MeshoptDecoder.ready;
    const gltf = await loader.parseAsync(buffer, new URL('.', new URL(glb, base)).href);
    model = gltf.scene;
    scene.add(model);
    if (disposed || signal?.aborted) { disposed = false; dispose(); throw new DOMException('Aborted', 'AbortError'); }
    if (fallaTextura) throw new Error('Texturas incompletas');

    model.updateMatrixWorld(true);
    bounds.setFromObject(model);
    bounds.getCenter(centro);
    for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) esquinas.push(new THREE.Vector3(x, y, z));
    model.traverse(object => {
      if (!object.isMesh) return;
      const materiales = Array.isArray(object.material) ? object.material : [object.material];
      object.castShadow = !materiales.some(m => m.transmission > 0.05 || (m.transparent && m.opacity < 0.5));
      object.receiveShadow = true;
    });
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.32, depthWrite: false }));
    suelo.rotation.x = -Math.PI / 2; suelo.position.y = bounds.min.y - 0.0005; suelo.receiveShadow = true; scene.add(suelo);
    llave.target.position.copy(centro); scene.add(llave.target);
    Object.assign(llave.shadow.camera, { left: -2.2, right: 2.2, top: 2, bottom: -2, near: 0.1, far: 15 });
    llave.shadow.camera.updateProjectionMatrix();
    renderer.shadowMap.needsUpdate = true;

    redimensionar();
    colocarCamara();
    await renderer.compileAsync(scene, camera);
    if (disposed) throw new DOMException('Aborted', 'AbortError');
    renderer.render(scene, camera);
    observador = new ResizeObserver(redimensionar);
    observador.observe(host);

    return {
      /** @param {number} valor progreso de 0 a 1, ya suavizado */
      setProgreso(valor) {
        if (disposed) return false;
        progreso = Math.min(1, Math.max(0, valor));
        pedirPintado();
        return false;
      },
      setVisible(valor) {
        visible = valor;
        if (valor) pedirPintado();
        else { cancelAnimationFrame(frame); frame = 0; pendiente = false; }
      },
      get vivo() { return !disposed; },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
