/* TWINLΞSS – 3D "twin rings" hero background
   Two sets of glowing concentric rings, drifting silver particles and the Ξ symbol.
   The hero photo stays visible until the scene is ready, and remains the fallback
   when WebGL or the CDN is not available. */

const THREE_URL = "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";

const hero = document.querySelector(".hero");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.matchMedia("(max-width: 700px), (pointer: coarse)").matches;

const COLORS = { night: 0x140a2a, violet: 0x2b1458, lilac: 0xb794ff, silver: 0xcdd0dc };

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) {
    return false;
  }
}

function whenIdle(fn) {
  const run = () => ("requestIdleCallback" in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 200));
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
}

if (hero && hasWebGL()) {
  whenIdle(() => start().catch(() => { /* keep the photo fallback */ }));
}

/* Soft round dot / glow textures drawn on a canvas (no extra downloads) */
function radialTexture(THREE, size, stops) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* Our Ξ symbol, loaded from the logo file and tinted with a soft lilac glow */
function symbolTexture(THREE) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const size = 512, pad = 96;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d");
      // tinted symbol on its own layer
      const s = document.createElement("canvas");
      s.width = s.height = size;
      const sx = s.getContext("2d");
      sx.drawImage(img, pad, pad, size - pad * 2, size - pad * 2);
      sx.globalCompositeOperation = "source-in";
      sx.fillStyle = "#EFE8FF";
      sx.fillRect(0, 0, size, size);
      // glow + crisp symbol
      ctx.shadowColor = "rgba(183,148,255,0.95)";
      ctx.shadowBlur = 42;
      ctx.drawImage(s, 0, 0);
      ctx.shadowBlur = 14;
      ctx.drawImage(s, 0, 0);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      resolve(t);
    };
    img.onerror = reject;
    img.src = "images/twinless_symbol_white.svg";
  });
}

async function start() {
  const THREE = await import(THREE_URL);

  /* ---------- renderer & camera ---------- */
  const wrap = document.createElement("div");
  wrap.className = "hero__scene";
  wrap.setAttribute("aria-hidden", "true");
  // inline essentials so the canvas can never push the layout, even with a stale stylesheet
  wrap.style.cssText = "position:absolute;inset:0;z-index:-2;overflow:hidden;pointer-events:none;";

  const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.setClearColor(COLORS.night, 1);
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%;";
  wrap.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(COLORS.night, 0.055);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 60);
  camera.position.set(0, 0, 10);

  const world = new THREE.Group();
  scene.add(world);

  /* ---------- twin rings ---------- */
  const RINGS = isMobile ? 9 : 12;
  const SEGMENTS = isMobile ? 120 : 200;
  const lilac = new THREE.Color(COLORS.lilac);
  const silver = new THREE.Color(COLORS.silver);

  function ringSet(phase) {
    const group = new THREE.Group();
    for (let i = 0; i < RINGS; i++) {
      const r = 0.38 + i * 0.34;
      const pos = new Float32Array(SEGMENTS * 3);
      const col = new Float32Array(SEGMENTS * 3);
      const tint = lilac.clone().lerp(silver, i / (RINGS - 1)); // inner lilac → outer silver
      for (let k = 0; k < SEGMENTS; k++) {
        const a = (k / SEGMENTS) * Math.PI * 2;
        pos[k * 3] = Math.cos(a) * r;
        pos[k * 3 + 1] = Math.sin(a) * r;
        // a soft "glint" travels around each ring as it rotates
        const glint = 0.28 + 0.72 * Math.pow(0.5 + 0.5 * Math.cos(a + phase + i * 0.7), 3);
        col[k * 3] = tint.r * glint;
        col[k * 3 + 1] = tint.g * glint;
        col[k * 3 + 2] = tint.b * glint;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const mat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.95 - (i / RINGS) * 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const line = new THREE.LineLoop(geo, mat);
      line.userData.i = i;
      group.add(line);
    }
    return group;
  }

  const left = ringSet(0);
  const right = ringSet(Math.PI);
  left.position.set(-1.5, 0, 0);
  right.position.set(1.5, 0, 0);
  left.rotation.set(-0.92, 0.28, 0);
  right.rotation.set(-0.92, -0.28, 0);
  world.add(left, right);

  /* ---------- glow + Ξ symbol in the center ---------- */
  const glowTex = radialTexture(THREE, 256, [
    [0, "rgba(232,226,255,0.55)"],
    [0.25, "rgba(183,148,255,0.35)"],
    [0.6, "rgba(43,20,88,0.18)"],
    [1, "rgba(20,10,42,0)"],
  ]);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55 }));
  glow.scale.set(5.5, 5.5, 1);
  world.add(glow);

  let symbol = null;
  try {
    const symTex = await symbolTexture(THREE);
    symbol = new THREE.Sprite(new THREE.SpriteMaterial({ map: symTex, transparent: true, depthWrite: false }));
    symbol.scale.set(1.05, 1.05, 1);
    symbol.position.z = 0.3;
    world.add(symbol);
  } catch (e) { /* scene still works without the symbol */ }

  /* ---------- drifting silver particles ---------- */
  const COUNT = isMobile ? 160 : 520;
  const pPos = new Float32Array(COUNT * 3);
  const pSpeed = new Float32Array(COUNT);
  for (let n = 0; n < COUNT; n++) {
    pPos[n * 3] = (Math.random() - 0.5) * 16;
    pPos[n * 3 + 1] = (Math.random() - 0.5) * 10;
    pPos[n * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
    pSpeed[n] = 0.04 + Math.random() * 0.12;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const dotTex = radialTexture(THREE, 64, [[0, "rgba(255,255,255,1)"], [0.35, "rgba(230,232,242,0.8)"], [1, "rgba(230,232,242,0)"]]);
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    map: dotTex,
    color: COLORS.silver,
    size: isMobile ? 0.07 : 0.055,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  scene.add(particles);

  /* ---------- layout: keep the Ξ above the logo, scale for phones ---------- */
  function layout() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const portrait = w / h < 0.9;
    world.scale.setScalar(portrait ? 0.72 : 1);
    world.position.y = portrait ? 1.35 : 1.0;
  }
  layout();

  /* ---------- interaction: mouse on desktop, touch / tilt on mobile ---------- */
  const target = { x: 0, y: 0 }, current = { x: 0, y: 0 };
  if (!reduceMotion) {
    window.addEventListener("pointermove", (e) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
    window.addEventListener("deviceorientation", (e) => {
      if (e.gamma == null || e.beta == null) return;
      target.x = Math.max(-1, Math.min(1, e.gamma / 30));
      target.y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    }, { passive: true });
  }

  /* ---------- animation ---------- */
  const clock = new THREE.Clock();
  let t = 0;

  function update(dt) {
    t += dt;
    current.x += (target.x - current.x) * Math.min(1, dt * 1.6);
    current.y += (target.y - current.y) * Math.min(1, dt * 1.6);

    world.rotation.y = Math.sin(t * 0.08) * 0.12 + current.x * 0.22;
    world.rotation.x = Math.sin(t * 0.06) * 0.05 + current.y * 0.12;

    // the two ring sets turn slowly in opposite directions and breathe outward
    left.rotation.z = t * 0.06;
    right.rotation.z = -t * 0.05;
    left.position.x = -1.5 + Math.sin(t * 0.17) * 0.14;
    right.position.x = 1.5 - Math.sin(t * 0.17) * 0.14;
    for (const set of [left, right]) {
      for (const ring of set.children) {
        ring.scale.setScalar(1 + 0.022 * Math.sin(t * 0.7 - ring.userData.i * 0.55));
      }
    }

    glow.material.opacity = 0.45 + 0.12 * Math.sin(t * 0.5);
    if (symbol) symbol.material.opacity = 0.85 + 0.15 * Math.sin(t * 0.5);

    // particles drift upward and wrap around
    const p = pGeo.attributes.position.array;
    for (let n = 0; n < COUNT; n++) {
      p[n * 3 + 1] += pSpeed[n] * dt;
      if (p[n * 3 + 1] > 5) p[n * 3 + 1] = -5;
    }
    pGeo.attributes.position.needsUpdate = true;
    particles.rotation.y = t * 0.012 + current.x * 0.08;
  }

  function frame() {
    update(Math.min(clock.getDelta(), 0.05));
    renderer.render(scene, camera);
  }

  // first frame, then fade the scene in over the photo
  update(0);
  renderer.render(scene, camera);
  hero.prepend(wrap);
  setTimeout(() => hero.classList.add("hero--3d"), 30);

  if (reduceMotion) {
    // static scene only: redraw on resize, no animation
    new ResizeObserver(() => { layout(); renderer.render(scene, camera); }).observe(hero);
  } else {
    new ResizeObserver(layout).observe(hero);
    let heroVisible = true;
    const setRunning = () => {
      const run = heroVisible && !document.hidden;
      if (run) clock.getDelta(); // skip the paused time
      renderer.setAnimationLoop(run ? frame : null);
    };
    new IntersectionObserver((entries) => { heroVisible = entries[0].isIntersecting; setRunning(); }).observe(hero);
    document.addEventListener("visibilitychange", setRunning);
    setRunning();
  }

  // if the GPU drops the context, fall back to the photo
  renderer.domElement.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    renderer.setAnimationLoop(null);
    hero.classList.remove("hero--3d");
  });
}
