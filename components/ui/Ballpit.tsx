"use client"

import { useEffect, useRef } from 'react';
import {
  Vector3 as a,
  MeshPhysicalMaterial as c,
  InstancedMesh as d,
  Timer as e,
  AmbientLight as f,
  SphereGeometry as g,
  ShaderChunk as h,
  Scene as i,
  Color as l,
  Object3D as m,
  SRGBColorSpace as n,
  MathUtils as o,
  PMREMGenerator as p,
  Vector2 as r,
  WebGLRenderer as s,
  PerspectiveCamera as t,
  PointLight as u,
  ACESFilmicToneMapping as v,
  Plane as w,
  Raycaster as y
} from 'three';
import { RoomEnvironment as z } from 'three/examples/jsm/environments/RoomEnvironment.js';

class x {
  #e: any;
  canvas!: HTMLCanvasElement;
  camera!: t;
  cameraMinAspect: any;
  cameraMaxAspect: any;
  cameraFov: any;
  maxPixelRatio: any;
  minPixelRatio: any;
  scene!: i;
  renderer!: s;
  #t: any;
  size = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
  render = this.#i;
  onBeforeRender = (h: any) => {};
  onAfterRender = (h: any) => {};
  onAfterResize = (size: any) => {};
  #s = false;
  #n = false;
  isDisposed = false;
  #o: any;
  #r: any;
  #a: any;
  #c = new e();
  #h = { elapsed: 0, delta: 0 };
  #l: any;
  constructor(options: any) {
    this.#e = { ...options };
    this.#m();
    this.#d();
    this.#p();
    this.resize();
    this.#g();
  }
  #m() {
    this.camera = new t();
    this.cameraFov = this.camera.fov;
  }
  #d() {
    this.scene = new i();
  }
  #p() {
    if (this.#e.canvas) {
      this.canvas = this.#e.canvas;
    } else if (this.#e.id) {
      this.canvas = document.getElementById(this.#e.id) as HTMLCanvasElement;
    } else {
      console.error('Three: Missing canvas or id parameter');
    }
    this.canvas.style.display = 'block';
    const eOpts = {
      canvas: this.canvas,
      powerPreference: 'high-performance' as const,
      ...(this.#e.rendererOptions ?? {})
    };
    this.renderer = new s(eOpts);
    this.renderer.outputColorSpace = n;
  }
  #g() {
    if (!(this.#e.size instanceof Object)) {
      window.addEventListener('resize', this.#f.bind(this));
      if (this.#e.size === 'parent' && this.canvas.parentNode) {
        this.#r = new ResizeObserver(this.#f.bind(this));
        this.#r.observe(this.canvas.parentNode as Element);
      }
    }
    this.#o = new IntersectionObserver(this.#u.bind(this), {
      root: null,
      rootMargin: '0px',
      threshold: 0
    });
    this.#o.observe(this.canvas);
    document.addEventListener('visibilitychange', this.#v.bind(this));
  }
  #y() {
    window.removeEventListener('resize', this.#f.bind(this));
    this.#r?.disconnect();
    this.#o?.disconnect();
    document.removeEventListener('visibilitychange', this.#v.bind(this));
  }
  #u(entries: any) {
    this.#s = entries[0].isIntersecting;
    this.#s ? this.#w() : this.#z();
  }
  #v() {
    if (this.#s) {
      document.hidden ? this.#z() : this.#w();
    }
  }
  #f() {
    if (this.#a) clearTimeout(this.#a);
    this.#a = setTimeout(this.resize.bind(this), 100);
  }
  resize() {
    let width, height;
    if (this.#e.size instanceof Object) {
      width = this.#e.size.width;
      height = this.#e.size.height;
    } else if (this.#e.size === 'parent' && this.canvas.parentNode) {
      width = (this.canvas.parentNode as HTMLElement).offsetWidth;
      height = (this.canvas.parentNode as HTMLElement).offsetHeight;
    } else {
      width = window.innerWidth;
      height = window.innerHeight;
    }
    this.size.width = width;
    this.size.height = height;
    this.size.ratio = width / height;
    this.#x();
    this.#b();
    this.onAfterResize(this.size);
  }
  #x() {
    this.camera.aspect = this.size.width / this.size.height;
    if (this.camera.isPerspectiveCamera && this.cameraFov) {
      if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
        this.#A(this.cameraMinAspect);
      } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
        this.#A(this.cameraMaxAspect);
      } else {
        this.camera.fov = this.cameraFov;
      }
    }
    this.camera.updateProjectionMatrix();
    this.updateWorldSize();
  }
  #A(ratio: number) {
    const tangent = Math.tan(o.degToRad(this.cameraFov / 2)) / (this.camera.aspect / ratio);
    this.camera.fov = 2 * o.radToDeg(Math.atan(tangent));
  }
  updateWorldSize() {
    if (this.camera.isPerspectiveCamera) {
      const fovRad = (this.camera.fov * Math.PI) / 180;
      this.size.wHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.length();
      this.size.wWidth = this.size.wHeight * this.camera.aspect;
    }
  }
  #b() {
    this.renderer.setSize(this.size.width, this.size.height);
    this.#t?.setSize(this.size.width, this.size.height);
    let ratio = window.devicePixelRatio;
    if (this.maxPixelRatio && ratio > this.maxPixelRatio) {
      ratio = this.maxPixelRatio;
    } else if (this.minPixelRatio && ratio < this.minPixelRatio) {
      ratio = this.minPixelRatio;
    }
    this.renderer.setPixelRatio(ratio);
    this.size.pixelRatio = ratio;
  }
  get postprocessing() {
    return this.#t;
  }
  set postprocessing(eVal: any) {
    this.#t = eVal;
    this.render = eVal.render.bind(eVal);
  }
  #w() {
    if (this.#n) return;
    const animate = () => {
      this.#l = requestAnimationFrame(animate);
      this.#c.update();
      this.#h.delta = this.#c.getDelta();
      this.#h.elapsed += this.#h.delta;
      this.onBeforeRender(this.#h);
      this.render();
      this.onAfterRender(this.#h);
    };
    this.#n = true;
    this.#c.reset();
    animate();
  }
  #z() {
    if (this.#n) {
      cancelAnimationFrame(this.#l);
      this.#n = false;
    }
  }
  #i() {
    this.renderer.render(this.scene, this.camera);
  }
  clear() {
    this.scene.traverse((node: any) => {
      if (node.isMesh && typeof node.material === 'object' && node.material !== null) {
        Object.keys(node.material).forEach((key) => {
          const val = node.material[key];
          if (val !== null && typeof val === 'object' && typeof val.dispose === 'function') {
            val.dispose();
          }
        });
        node.material.dispose();
        node.geometry.dispose();
      }
    });
    this.scene.clear();
  }
  dispose() {
    this.#y();
    this.#z();
    this.#c.dispose();
    this.clear();
    this.#t?.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.isDisposed = true;
  }
}

const b = new Map();
const A = new r();
let R = false;

function S(options: any) {
  const t = {
    position: new r(),
    nPosition: new r(),
    hover: false,
    touching: false,
    onEnter() {},
    onMove() {},
    onClick() {},
    onLeave() {},
    ...options
  };
  (function (domElement, state) {
    if (!b.has(domElement)) {
      b.set(domElement, state);
      if (!R) {
        document.body.addEventListener('pointermove', M);
        document.body.addEventListener('pointerleave', L);
        document.body.addEventListener('click', C);

        document.body.addEventListener('touchstart', TouchStart, { passive: false });
        document.body.addEventListener('touchmove', TouchMove, { passive: false });
        document.body.addEventListener('touchend', TouchEnd, { passive: false });
        document.body.addEventListener('touchcancel', TouchEnd, { passive: false });

        R = true;
      }
    }
  })(options.domElement, t);
  t.dispose = () => {
    const domElement = options.domElement;
    b.delete(domElement);
    if (b.size === 0) {
      document.body.removeEventListener('pointermove', M);
      document.body.removeEventListener('pointerleave', L);
      document.body.removeEventListener('click', C);

      document.body.removeEventListener('touchstart', TouchStart);
      document.body.removeEventListener('touchmove', TouchMove);
      document.body.removeEventListener('touchend', TouchEnd);
      document.body.removeEventListener('touchcancel', TouchEnd);

      R = false;
    }
  };
  return t;
}

function M(e: PointerEvent) {
  A.x = e.clientX;
  A.y = e.clientY;
  processInteraction();
}

function processInteraction() {
  for (const [elem, state] of b) {
    const rect = elem.getBoundingClientRect();
    if (D(rect)) {
      P(state, rect);
      if (!state.hover) {
        state.hover = true;
        state.onEnter(state);
      }
      state.onMove(state);
    } else if (state.hover && !state.touching) {
      state.hover = false;
      state.onLeave(state);
    }
  }
}

function C(e: MouseEvent) {
  A.x = e.clientX;
  A.y = e.clientY;
  for (const [elem, state] of b) {
    const rect = elem.getBoundingClientRect();
    P(state, rect);
    if (D(rect)) state.onClick(state);
  }
}

function L() {
  for (const state of b.values()) {
    if (state.hover) {
      state.hover = false;
      state.onLeave(state);
    }
  }
}

function TouchStart(e: TouchEvent) {
  if (e.touches.length > 0) {
    e.preventDefault();
    A.x = e.touches[0].clientX;
    A.y = e.touches[0].clientY;

    for (const [elem, state] of b) {
      const rect = elem.getBoundingClientRect();
      if (D(rect)) {
        state.touching = true;
        P(state, rect);
        if (!state.hover) {
          state.hover = true;
          state.onEnter(state);
        }
        state.onMove(state);
      }
    }
  }
}

function TouchMove(e: TouchEvent) {
  if (e.touches.length > 0) {
    e.preventDefault();
    A.x = e.touches[0].clientX;
    A.y = e.touches[0].clientY;

    for (const [elem, state] of b) {
      const rect = elem.getBoundingClientRect();
      P(state, rect);

      if (D(rect)) {
        if (!state.hover) {
          state.hover = true;
          state.touching = true;
          state.onEnter(state);
        }
        state.onMove(state);
      } else if (state.hover && state.touching) {
        state.onMove(state);
      }
    }
  }
}

function TouchEnd() {
  for (const state of b.values()) {
    if (state.touching) {
      state.touching = false;
      if (state.hover) {
        state.hover = false;
        state.onLeave(state);
      }
    }
  }
}

function P(state: any, rect: DOMRect) {
  const { position: i, nPosition: s } = state;
  i.x = A.x - rect.left;
  i.y = A.y - rect.top;
  s.x = (i.x / rect.width) * 2 - 1;
  s.y = (-i.y / rect.height) * 2 + 1;
}

function D(rect: DOMRect) {
  const { x: t, y: i } = A;
  const { left: s, top: n, width: o, height: r } = rect;
  return t >= s && t <= s + o && i >= n && i <= n + r;
}

const { randFloat: k, randFloatSpread: E } = o;
const F = new a();
const I = new a();
const O = new a();
const V = new a();
const B = new a();
const N = new a();
const _ = new a();
const j = new a();
const H = new a();
const T = new a();

class W {
  config: any;
  positionData: Float32Array;
  velocityData: Float32Array;
  sizeData: Float32Array;
  center: a;
  constructor(config: any) {
    this.config = config;
    this.positionData = new Float32Array(3 * config.count).fill(0);
    this.velocityData = new Float32Array(3 * config.count).fill(0);
    this.sizeData = new Float32Array(config.count).fill(1);
    this.center = new a();
    this.#R();
    this.setSizes();
  }
  #R() {
    const { config: e, positionData: t } = this;
    this.center.toArray(t, 0);
    for (let i = 1; i < e.count; i++) {
      const s = 3 * i;
      t[s] = E(2 * e.maxX);
      t[s + 1] = E(2 * e.maxY);
      t[s + 2] = E(2 * e.maxZ);
    }
  }
  setSizes() {
    const { config: e, sizeData: t } = this;
    t[0] = e.size0;
    for (let i = 1; i < e.count; i++) {
      t[i] = k(e.minSize, e.maxSize);
    }
  }
  update(e: any) {
    const { config: t, center: i, positionData: s, sizeData: n, velocityData: o } = this;
    let r = 0;
    if (t.controlSphere0) {
      r = 1;
      F.fromArray(s, 0);
      F.lerp(i, 0.1).toArray(s, 0);
      V.set(0, 0, 0).toArray(o, 0);
    }
    for (let idx = r; idx < t.count; idx++) {
      const base = 3 * idx;
      I.fromArray(s, base);
      B.fromArray(o, base);
      B.y -= e.delta * t.gravity * n[idx];
      B.multiplyScalar(t.friction);
      B.clampLength(0, t.maxVelocity);
      I.add(B);
      I.toArray(s, base);
      B.toArray(o, base);
    }
    for (let idx = r; idx < t.count; idx++) {
      const base = 3 * idx;
      I.fromArray(s, base);
      B.fromArray(o, base);
      const radius = n[idx];
      for (let jdx = idx + 1; jdx < t.count; jdx++) {
        const otherBase = 3 * jdx;
        O.fromArray(s, otherBase);
        N.fromArray(o, otherBase);
        const otherRadius = n[jdx];
        _.copy(O).sub(I);
        const dist = _.length();
        const sumRadius = radius + otherRadius;
        if (dist < sumRadius) {
          const overlap = sumRadius - dist;
          j.copy(_)
            .normalize()
            .multiplyScalar(0.5 * overlap);
          H.copy(j).multiplyScalar(Math.max(B.length(), 1));
          T.copy(j).multiplyScalar(Math.max(N.length(), 1));
          I.sub(j);
          B.sub(H);
          I.toArray(s, base);
          B.toArray(o, base);
          O.add(j);
          N.add(T);
          O.toArray(s, otherBase);
          N.toArray(o, otherBase);
        }
      }
      if (t.controlSphere0) {
        _.copy(F).sub(I);
        const dist = _.length();
        const sumRadius0 = radius + n[0];
        if (dist < sumRadius0) {
          const diff = sumRadius0 - dist;
          j.copy(_.normalize()).multiplyScalar(diff);
          H.copy(j).multiplyScalar(Math.max(B.length(), 2));
          I.sub(j);
          B.sub(H);
        }
      }
      if (Math.abs(I.x) + radius > t.maxX) {
        I.x = Math.sign(I.x) * (t.maxX - radius);
        B.x = -B.x * t.wallBounce;
      }
      if (t.gravity === 0) {
        if (Math.abs(I.y) + radius > t.maxY) {
          I.y = Math.sign(I.y) * (t.maxY - radius);
          B.y = -B.y * t.wallBounce;
        }
      } else if (I.y - radius < -t.maxY) {
        I.y = -t.maxY + radius;
        B.y = -B.y * t.wallBounce;
      }
      const maxBoundary = Math.max(t.maxZ, t.maxSize);
      if (Math.abs(I.z) + radius > maxBoundary) {
        I.z = Math.sign(I.z) * (t.maxZ - radius);
        B.z = -B.z * t.wallBounce;
      }
      I.toArray(s, base);
      B.toArray(o, base);
    }
  }
}

class Y extends c {
  uniforms: any;
  onBeforeCompile2: any;
  constructor(options: any) {
    super(options);
    this.uniforms = {
      thicknessDistortion: { value: 0.1 },
      thicknessAmbient: { value: 0 },
      thicknessAttenuation: { value: 0.1 },
      thicknessPower: { value: 2 },
      thicknessScale: { value: 10 }
    };
    this.defines = this.defines || {};
    this.defines.USE_UV = '';
    this.onBeforeCompile = (shader: any) => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.fragmentShader =
        '\n        uniform float thicknessPower;\n        uniform float thicknessScale;\n        uniform float thicknessDistortion;\n        uniform float thicknessAmbient;\n        uniform float thicknessAttenuation;\n      ' +
        shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        '\n        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {\n          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));\n          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;\n          #ifdef USE_COLOR\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;\n          #else\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;\n          #endif\n          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;\n        }\n\n        void main() {\n      '
      );
      const t = h.lights_fragment_begin.replaceAll(
        'RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );',
        '\n          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);\n        '
      );
      shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_begin>', t);
      if (this.onBeforeCompile2) this.onBeforeCompile2(shader);
    };
  }
}

const XOpts = {
  count: 200,
  colors: [0, 0, 0],
  ambientColor: 16777215,
  ambientIntensity: 1,
  lightIntensity: 200,
  materialParams: {
    metalness: 0.5,
    roughness: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.15
  },
  minSize: 0.5,
  maxSize: 1,
  size0: 1,
  gravity: 0.5,
  friction: 0.9975,
  wallBounce: 0.95,
  maxVelocity: 0.15,
  maxX: 5,
  maxY: 5,
  maxZ: 2,
  controlSphere0: false,
  followCursor: true
};

const U = new m();

class Z extends d {
  physics: W;
  config: any;
  ambientLight!: f;
  light!: u;
  constructor(renderer: any, config: any = {}) {
    const merged = { ...XOpts, ...config };
    const roomEnv = new z();
    const envTexture = new p(renderer).fromScene(roomEnv).texture;
    const geom = new g();
    const mat = new Y({ envMap: envTexture, ...merged.materialParams });
    mat.envMapRotation.x = -Math.PI / 2;
    super(geom, mat, merged.count);
    this.config = merged;
    this.physics = new W(merged);
    this.#S();
    this.setColors(merged.colors);
  }
  #S() {
    this.ambientLight = new f(this.config.ambientColor, this.config.ambientIntensity);
    this.add(this.ambientLight);
    this.light = new u(this.config.colors[0], this.config.lightIntensity);
    this.add(this.light);
  }
  setColors(colorsArr: any) {
    if (Array.isArray(colorsArr) && colorsArr.length > 1) {
      const helper = (function (e) {
        let t: any[], i: any[];
        function setColors(eList: any[]) {
          t = eList;
          i = [];
          t.forEach(col => {
            i.push(new l(col));
          });
        }
        setColors(colorsArr);
        return {
          setColors,
          getColorAt: function (ratio: number, out = new l()) {
            const scaled = Math.max(0, Math.min(1, ratio)) * (t.length - 1);
            const idx = Math.floor(scaled);
            const start = i[idx];
            if (idx >= t.length - 1) return start.clone();
            const alpha = scaled - idx;
            const end = i[idx + 1];
            out.r = start.r + alpha * (end.r - start.r);
            out.g = start.g + alpha * (end.g - start.g);
            out.b = start.b + alpha * (end.b - start.b);
            return out;
          }
        };
      })(colorsArr);
      for (let idx = 0; idx < this.count; idx++) {
        this.setColorAt(idx, helper.getColorAt(idx / this.count));
        if (idx === 0) {
          this.light.color.copy(helper.getColorAt(idx / this.count));
        }
      }
      if (this.instanceColor) {
        this.instanceColor.needsUpdate = true;
      }
    }
  }
  update(e: any) {
    this.physics.update(e);
    for (let idx = 0; idx < this.count; idx++) {
      U.position.fromArray(this.physics.positionData, 3 * idx);
      if (idx === 0 && this.config.followCursor === false) {
        U.scale.setScalar(0);
      } else {
        U.scale.setScalar(this.physics.sizeData[idx]);
      }
      U.updateMatrix();
      this.setMatrixAt(idx, U.matrix);
      if (idx === 0) this.light.position.copy(U.position);
    }
    this.instanceMatrix.needsUpdate = true;
  }
}

function createBallpit(canvas: HTMLCanvasElement, options: any = {}) {
  const threeApp = new x({
    canvas: canvas,
    size: 'parent',
    rendererOptions: { antialias: true, alpha: true }
  });
  let spheresInst: Z;
  threeApp.renderer.toneMapping = v;
  threeApp.camera.position.set(0, 0, 20);
  threeApp.camera.lookAt(0, 0, 0);
  threeApp.cameraMaxAspect = 1.5;
  threeApp.resize();
  initialize(options);
  const rayc = new y();
  const planeObj = new w(new a(0, 0, 1), 0);
  const intersectPoint = new a();
  let paused = false;

  canvas.style.touchAction = 'none';
  canvas.style.userSelect = 'none';
  (canvas.style as any).webkitUserSelect = 'none';

  const interactionState = S({
    domElement: canvas,
    onMove() {
      rayc.setFromCamera(interactionState.nPosition, threeApp.camera);
      threeApp.camera.getWorldDirection(planeObj.normal);
      rayc.ray.intersectPlane(planeObj, intersectPoint);
      spheresInst.physics.center.copy(intersectPoint);
      spheresInst.config.controlSphere0 = true;
    },
    onLeave() {
      spheresInst.config.controlSphere0 = false;
    }
  });

  function initialize(config: any) {
    if (spheresInst) {
      threeApp.clear();
      threeApp.scene.remove(spheresInst);
    }
    spheresInst = new Z(threeApp.renderer, config);
    threeApp.scene.add(spheresInst);
  }

  threeApp.onBeforeRender = (e: any) => {
    if (!paused) spheresInst.update(e);
  };
  threeApp.onAfterResize = (e: any) => {
    spheresInst.config.maxX = e.wWidth / 2;
    spheresInst.config.maxY = e.wHeight / 2;
  };

  return {
    three: threeApp,
    get spheres() {
      return spheresInst;
    },
    setCount(num: number) {
      initialize({ ...spheresInst.config, count: num });
    },
    togglePause() {
      paused = !paused;
    },
    dispose() {
      interactionState.dispose();
      threeApp.dispose();
    }
  };
}

interface BallpitProps {
  className?: string;
  followCursor?: boolean;
  count?: number;
  gravity?: number;
  friction?: number;
  wallBounce?: number;
  colors?: string[] | number[];
  [key: string]: any;
}

const Ballpit = ({ className = '', followCursor = true, ...props }: BallpitProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spheresInstanceRef = useRef<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const tempCanvas = document.createElement('canvas');
      const gl = tempCanvas.getContext('webgl') || tempCanvas.getContext('experimental-webgl');
      if (!gl) {
        console.warn('WebGL is not supported in this browser/device. Ballpit animation is disabled.');
        return;
      }
      spheresInstanceRef.current = createBallpit(canvas, { followCursor, ...props });
    } catch (err) {
      console.warn('Failed to initialize WebGL Ballpit:', err);
    }

    return () => {
      if (spheresInstanceRef.current) {
        try {
          spheresInstanceRef.current.dispose();
        } catch (e) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas className={className} ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default Ballpit;
