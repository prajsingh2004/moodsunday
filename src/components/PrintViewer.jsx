import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  PROTOTYPE,
  createPrototypeGeometry,
  createLayerTexture,
  createShadowTexture,
  prototypeRadiusAt,
} from '../three/prototype';
import { scrollStore } from '../utils/scrollStore';
import { clamp, easeInOutCubic, prefersReducedMotion } from '../utils/motion';

const PRINT_IN_MS = 2600;

/**
 * Imperative three.js scene wrapped in a React component.
 *  mode "hero"    – prints itself in on load, reacts to scroll + cursor
 *  mode "preview" – drag to rotate (used for uploaded files + colour section)
 */
export default function PrintViewer({ mode = 'hero', colour, geometry = null, onFail }) {
  const mountRef = useRef(null);
  const apiRef = useRef(null);

  // Build the scene once per mode.
  useEffect(() => {
    const el = mountRef.current;
    const isHero = mode === 'hero';
    const reduce = prefersReducedMotion();

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (err) {
      onFail?.(err);
      return undefined;
    }
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.domElement.className = 'viewer__canvas';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    el.appendChild(renderer.domElement);

    /* scene + light */
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTexture = pmrem.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.5;
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(3, 5, 4);
    const rim = new THREE.DirectionalLight(0xffeedd, 1.1);
    rim.position.set(-4, 2, -3);
    scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.2));

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 60);
    const group = new THREE.Group();
    scene.add(group);

    /* object */
    const protoGeometry = createPrototypeGeometry();
    const layerTexture = createLayerTexture(PROTOTYPE.layers, Math.min(8, renderer.capabilities.getMaxAnisotropy()));
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colour.hex),
      roughness: 0.5,
      metalness: 0,
      bumpMap: layerTexture,
      bumpScale: 2.2,
    });
    const mesh = new THREE.Mesh(protoGeometry, material);
    group.add(mesh);

    /* "nozzle" ring that rides up the object while it prints */
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.018, 8, 80),
      new THREE.MeshBasicMaterial({ color: 0xbba8ff }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.visible = false;
    group.add(ring);

    /* contact shadow */
    const shadowTexture = createShadowTexture();
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    scene.add(shadow);

    /* state */
    const extent = { R: 1.1, Hh: PROTOTYPE.height / 2 };
    const target = new THREE.Color(colour.hex);
    const s = { px: 0, py: 0, tx: 0, ty: 0, p: 0, idle: 0.6, dragYaw: 0, dragPitch: 0, dragging: false, printed: isHero && !reduce ? 0 : 1, printStart: null, dist: 8 };
    let usingProto = true;
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let colourSettled = true;

    const setDraw = () => {
      if (!usingProto) return;
      const layersDone = Math.max(1, Math.floor(s.printed * PROTOTYPE.layers));
      protoGeometry.setDrawRange(0, layersDone * PROTOTYPE.segments * 6);
      const done = s.printed >= 1;
      ring.visible = !done;
      if (!done) {
        const t = layersDone / PROTOTYPE.layers;
        ring.position.y = t * PROTOTYPE.height - PROTOTYPE.height / 2;
        ring.scale.setScalar(Math.max(0.05, prototypeRadiusAt(t) * 1.14));
      }
    };

    const placeShadow = (bottomY, radius) => {
      shadow.position.y = bottomY - 0.02;
      shadow.scale.set(radius * 3.1, radius * 3.1, 1);
    };
    placeShadow(-PROTOTYPE.height / 2, 1.1);

    const layout = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const margin = isHero ? 1.32 : 1.4;
      const dV = (extent.Hh * margin) / tanHalf;
      const dH = (extent.R * margin) / (tanHalf * camera.aspect);
      s.dist = Math.max(dV, dH);
      camera.updateProjectionMatrix();
      requestRender();
    };

    const render = () => {
      renderer.render(scene, camera);
    };

    function frame(now) {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // cursor + scroll easing
      const ease = 1 - Math.exp(-dt * 5);
      s.px += (s.tx - s.px) * ease;
      s.py += (s.ty - s.py) * ease;
      const sp = isHero ? scrollStore.progress : 0;
      s.p += (sp - s.p) * (1 - Math.exp(-dt * 6));

      if (!reduce && !s.dragging) s.idle += dt * (isHero ? 0.32 : 0.45);

      // print-in
      if (s.printed < 1) {
        if (s.printStart == null) s.printStart = now;
        s.printed = easeInOutCubic(clamp((now - s.printStart) / PRINT_IN_MS));
        if (now - s.printStart >= PRINT_IN_MS) s.printed = 1;
        setDraw();
      }

      // colour tween
      if (!colourSettled) {
        material.color.lerp(target, 1 - Math.exp(-dt * 10));
        if (Math.abs(material.color.r - target.r) + Math.abs(material.color.g - target.g) + Math.abs(material.color.b - target.b) < 0.004) {
          material.color.copy(target);
          colourSettled = true;
        }
      }

      group.rotation.y = s.idle + s.dragYaw + s.px * 0.4 + s.p * Math.PI * 0.85;
      group.rotation.x = 0.1 + s.py * 0.16 + s.dragPitch + s.p * 0.3;
      group.position.y = -s.p * 0.45;
      camera.position.set(s.px * 0.3, s.dist * 0.1 + s.p * 0.7, s.dist);
      camera.lookAt(0, s.p * 0.12, 0);

      render();
      if (!reduce) kick();
    }

    function kick() {
      if (!raf && visible && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    // Reduced motion: no loop, just render on demand.
    function requestRender() {
      if (reduce) {
        group.rotation.set(0.1, 0.6 + (isHero ? 0.2 : 0), 0);
        camera.position.set(0, s.dist * 0.1, s.dist);
        camera.lookAt(0, 0, 0);
        material.color.copy(target);
        render();
      } else {
        kick();
      }
    }

    /* public API for the React effects below */
    const api = {
      setColour(hex) {
        target.set(hex);
        if (reduce) {
          material.color.copy(target);
          requestRender();
        } else {
          colourSettled = false;
          kick();
        }
      },
      setGeometry(geo) {
        if (geo) {
          usingProto = false;
          ring.visible = false;
          geo.computeBoundingBox();
          const size = new THREE.Vector3();
          geo.boundingBox.getSize(size);
          const scale = 2.1 / Math.max(size.x, size.y, size.z, 0.0001);
          mesh.geometry = geo;
          mesh.scale.setScalar(scale);
          material.bumpMap = null;
          material.needsUpdate = true;
          extent.R = (Math.hypot(size.x, size.z) / 2) * scale;
          extent.Hh = (size.y / 2) * scale;
          placeShadow(-extent.Hh, extent.R);
        } else {
          usingProto = true;
          mesh.geometry = protoGeometry;
          mesh.scale.setScalar(1);
          material.bumpMap = layerTexture;
          material.needsUpdate = true;
          extent.R = 1.1;
          extent.Hh = PROTOTYPE.height / 2;
          placeShadow(-extent.Hh, 1.1);
          s.printed = 1;
          setDraw();
        }
        layout();
      },
    };
    apiRef.current = api;

    /* events */
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    io.observe(el);
    const onVisibility = () => !document.hidden && kick();
    document.addEventListener('visibilitychange', onVisibility);

    const onPointerMove = (e) => {
      if (e.pointerType === 'touch') return;
      s.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      s.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Drag to rotate (preview mode). Vertical swipes still scroll the page on touch.
    let lastX = 0;
    let lastY = 0;
    const canvas = renderer.domElement;
    const onDown = (e) => {
      s.dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e) => {
      if (!s.dragging) return;
      s.dragYaw += (e.clientX - lastX) * 0.012;
      s.dragPitch = clamp(s.dragPitch + (e.clientY - lastY) * 0.006, -0.5, 0.6);
      lastX = e.clientX;
      lastY = e.clientY;
      requestRender();
    };
    const onUp = () => {
      s.dragging = false;
    };
    if (!isHero) {
      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointercancel', onUp);
    }

    // initial state
    api.setColour(colour.hex);
    material.color.copy(target);
    setDraw();
    layout();
    if (geometry) api.setGeometry(geometry);

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);
      apiRef.current = null;
      protoGeometry.dispose();
      layerTexture.dispose();
      shadowTexture.dispose();
      shadow.geometry.dispose();
      shadow.material.dispose();
      ring.geometry.dispose();
      ring.material.dispose();
      material.dispose();
      envTexture.dispose();
      roomEnv.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    apiRef.current?.setColour(colour.hex);
  }, [colour.hex]);

  useEffect(() => {
    apiRef.current?.setGeometry(geometry);
  }, [geometry]);

  return <div ref={mountRef} className="viewer__mount" />;
}
