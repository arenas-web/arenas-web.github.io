import * as THREE from '../vendor/three/three.module.js';
import { GLTFLoader } from '../vendor/three/GLTFLoader.js';
import { OrbitControls } from '../vendor/three/OrbitControls.js';
import { MeshoptDecoder } from '../vendor/meshopt/meshopt_decoder.js';

// This is the approved asset, losslessly packaged. No geometry or material edits.
export async function createCinema(host, { signal, onProgress = () => {}, onContextLost = () => {} } = {}) {
  let renderer;
  let scene, environment, controls, ground, model, observer;
  let frame = 0, disposed = false, visible = true, interactive = false;
  let progress = 0, current = 0, dirty = true, lastFrame = 0;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = () => matchMedia('(max-width: 699px), (pointer: coarse)').matches;
  const resources = new Set();
  const camera = new THREE.PerspectiveCamera(32, 1, .02, 40);
  const bounds = new THREE.Box3();
  const centre = new THREE.Vector3(0, .65, 0);
  const direction = new THREE.Vector3();
  let corners = [];

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    controls?.dispose();
    renderer?.domElement.removeEventListener('webglcontextlost', contextLost);
    renderer?.domElement.removeEventListener('keydown', keyboard);
    signal?.removeEventListener('abort', dispose);
    if (scene) scene.traverse(object => {
      if (object.geometry) resources.add(object.geometry);
      for (const material of (Array.isArray(object.material) ? object.material : [object.material])) {
        if (!material) continue;
        resources.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) resources.add(value);
      }
    });
    for (const resource of resources) resource.dispose();
    environment?.dispose();
    renderer?.dispose();
    renderer?.domElement.remove();
  }
  function contextLost(event) { event.preventDefault(); onContextLost(); dispose(); }
  function requestRender() { dirty = true; if (!frame && visible && !disposed) frame = requestAnimationFrame(render); }
  function fit(dir) {
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(up, dir).normalize();
    up.copy(dir).cross(right).normalize();
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    let distance = 1.4;
    for (const corner of corners) {
      const relative = corner.clone().sub(centre);
      distance = Math.max(distance, relative.dot(dir) + Math.abs(relative.dot(right)) / (tanV * camera.aspect * .95), relative.dot(dir) + Math.abs(relative.dot(up)) / (tanV * .93));
    }
    return distance;
  }
  function directedCamera() {
    // Native page scroll directs three restrained studio angles; no scroll hijack.
    const angle = current < .5 ? THREE.MathUtils.lerp(.46, .03, current * 2) : THREE.MathUtils.lerp(.03, -.48, (current - .5) * 2);
    direction.set(Math.sin(angle), .15 + .04 * Math.sin(current * Math.PI), Math.cos(angle)).normalize();
    controls.target.copy(centre);
    camera.position.copy(centre).addScaledVector(direction, fit(direction));
    camera.lookAt(centre);
  }
  function render(time) {
    frame = 0;
    if (disposed || !visible) return;
    if (time - lastFrame < 32) { frame = requestAnimationFrame(render); return; }
    lastFrame = time;
    if (!interactive) {
      current = reduceMotion.matches ? progress : current + (progress - current) * .24;
      if (Math.abs(progress - current) < .0005) current = progress;
      directedCamera();
    }
    if (dirty || (!interactive && current !== progress)) {
      dirty = false;
      renderer.render(scene, camera);
      host.dataset.frames = String(Number(host.dataset.frames || 0) + 1);
    }
    if (!interactive && current !== progress) frame = requestAnimationFrame(render);
  }
  function resize() {
    if (disposed) return;
    const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, compact() ? 1.15 : 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (interactive) pose('whole');
    requestRender();
  }
  function pose(name) {
    direction.set(name === 'side' ? 0 : name === 'front' ? .99 : .44, .17, name === 'front' ? .08 : .88).normalize();
    controls.target.copy(centre);
    camera.position.copy(centre).addScaledVector(direction, fit(direction));
    controls.update();
    requestRender();
  }
  function keyboard(event) {
    if (!interactive || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') return pose('whole');
    const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    if (event.key === 'ArrowLeft') spherical.theta -= .15;
    if (event.key === 'ArrowRight') spherical.theta += .15;
    if (event.key === 'ArrowUp') spherical.phi -= .1;
    if (event.key === 'ArrowDown') spherical.phi += .1;
    spherical.phi = THREE.MathUtils.clamp(spherical.phi, .25, Math.PI * .49);
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
    controls.update();
    requestRender();
  }

  try {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'default' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.transmissionResolutionScale = compact() ? .35 : .5;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute('aria-label', 'Arrastra para girar la moto. Usa las flechas del teclado para cambiar el ángulo y Home para volver.');
    renderer.domElement.tabIndex = -1;
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    renderer.domElement.addEventListener('keydown', keyboard);
    host.append(renderer.domElement);
    signal?.addEventListener('abort', dispose, { once: true });
    scene = new THREE.Scene();
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false;
    // OrbitControls sets an inline touchAction; let our mode classes own it.
    renderer.domElement.style.removeProperty('touch-action');
    controls.enableDamping = false;
    controls.enablePan = false;
    controls.minDistance = 1.5;
    controls.maxDistance = 6;
    controls.maxPolarAngle = Math.PI * .49;
    controls.addEventListener('change', requestRender);

    const studio = new THREE.Scene();
    studio.background = new THREE.Color(.075, .08, .09);
    const lamps = [];
    for (const [position, size, radiance] of [[[-2.5, 4, 3.6], [3, 3.2], 4.5], [[3.8, 2.1, 1.9], [2.4, 3], 1.7], [[-1.6, 2.8, -3.8], [3, 1.3], 3]]) {
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(...size), new THREE.MeshBasicMaterial({ color: new THREE.Color(radiance, radiance, radiance), side: THREE.DoubleSide }));
      plane.position.set(...position); plane.lookAt(centre); studio.add(plane); lamps.push(plane);
    }
    const pmrem = new THREE.PMREMGenerator(renderer);
    environment = pmrem.fromScene(studio, .04);
    pmrem.dispose();
    for (const lamp of lamps) { lamp.geometry.dispose(); lamp.material.dispose(); }
    scene.environment = environment.texture;
    scene.environmentIntensity = .95;
    scene.add(new THREE.HemisphereLight(0xf5f7fc, 0x353b44, 1.35));
    let key;
    for (const [color, strength, position] of [[0xfffaf2, 2.8, [-2.5, 4, 3.6]], [0xc8dcff, 1.3, [3.8, 2.1, 1.9]], [0x9fbdff, 2.1, [-1.6, 2.8, -3.8]]]) {
      const light = new THREE.DirectionalLight(color, strength); light.position.set(...position); scene.add(light);
      if (!key) { key = light; light.castShadow = true; light.shadow.mapSize.setScalar(compact() ? 512 : 1024); light.shadow.radius = 8; light.shadow.normalBias = .0008; light.shadow.bias = -.00004; }
    }
    const useGzip = typeof DecompressionStream !== 'undefined';
    const url = new URL(useGzip ? '../3d/ns200/ns200.glb.gz' : '../3d/ns200/ns200.glb', import.meta.url);
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error('Model response ' + response.status);
    onProgress('Preparando la escena…');
    const buffer = useGzip ? await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer() : await response.arrayBuffer();
    if (disposed || signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    let textureFailure = false;
    const manager = new THREE.LoadingManager();
    manager.onError = () => { textureFailure = true; };
    const loader = new GLTFLoader(manager).setMeshoptDecoder(MeshoptDecoder);
    await MeshoptDecoder.ready;
    const gltf = await loader.parseAsync(buffer, new URL('../3d/ns200/', import.meta.url).href);
    model = gltf.scene;
    scene.add(model);
    // parseAsync cannot be aborted: dispose a late result instead of retaining it.
    if (disposed || signal?.aborted) {
      disposed = false; dispose(); throw new DOMException('Aborted', 'AbortError');
    }
    if (textureFailure) throw new Error('Incomplete model textures');
    model.updateMatrixWorld(true);
    bounds.setFromObject(model);
    bounds.getCenter(centre);
    for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) corners.push(new THREE.Vector3(x, y, z));
    model.traverse(object => { if (object.isMesh) {
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      object.castShadow = !materials.some(material => material.transmission > .05 || material.transparent && material.opacity < .5);
      object.receiveShadow = true;
    } });
    ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ color: 0x000000, opacity: .25, depthWrite: false }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = bounds.min.y - .0005; ground.receiveShadow = true; scene.add(ground);
    key.target.position.copy(centre); scene.add(key.target);
    Object.assign(key.shadow.camera, { left: -2.2, right: 2.2, top: 2, bottom: -2, near: .1, far: 15 });
    key.shadow.camera.updateProjectionMatrix();
    renderer.shadowMap.needsUpdate = true;
    resize();
    directedCamera();
    await renderer.compileAsync(scene, camera);
    if (disposed) throw new DOMException('Aborted', 'AbortError');
    renderer.render(scene, camera);
    host.dataset.frames = '1';
    observer = new ResizeObserver(resize); observer.observe(host);
    return {
      setProgress(value) { if (disposed) return; progress = THREE.MathUtils.clamp(value, 0, 1); requestRender(); },
      setVisible(value) { visible = value; if (value) requestRender(); else { cancelAnimationFrame(frame); frame = 0; } },
      setInteractive(value) { interactive = value; controls.enabled = value; renderer.domElement.tabIndex = value ? 0 : -1; if (value) pose('whole'); requestRender(); },
      pose, dispose,
      snapshot() { renderer.render(scene, camera); return renderer.domElement.toDataURL('image/png'); },
    };
  } catch (error) { dispose(); throw error; }
}
