// REMOVED: import * as THREE ...
// We rely on the global THREE object loaded in index.html to support file:// protocol and avoid CORS module errors.

// ... Configuration ...
const CONFIG = {
    particleCount: 20000,
    particleSize: 2.0,
    // ... existing config ...
    textParticleSize: 1.5,
    camFov: 55,
    camDist: 350,
    colors: {
        primary: 0x00f3ff,
        secondary: 0xaabbcc,
        bg: 0x050711
    },
    assets: {
        face: 'assets/digital_twin_hero.jpg'
    }
};

let scene, camera, renderer;
let faceGroup, textGroup, particleSystem;
let clock, animationId;
const mouse = { x: 0, y: 0 };

// SHADERS
const vertexShader = `
    uniform float uTime;
    uniform float uMorph;
    uniform float uSize;

    uniform float uMouseX; 

    attribute vec3 aStart;
    attribute vec3 aTarget;
    attribute float aBright;

    varying float vDepth;
    varying float vBright;

    void main() {
        vec3 pos = mix(aStart, aTarget, uMorph);
        float chaos = 1.0 - uMorph;
        
        // Drift (Dust Mode)
        pos.x += sin(uTime * 0.5 + aStart.y * 0.01) * 20.0 * chaos;
        pos.y += cos(uTime * 0.3 + aStart.x * 0.01) * 20.0 * chaos;

        // Breath (Face Mode)
        float breath = sin(uTime * 1.5) * 2.0 * uMorph;
        pos.z += breath;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        vDepth = -mvPosition.z;
        vBright = aBright;

        gl_PointSize = uSize * (600.0 / vDepth) * (0.6 + aBright * 0.8);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const fragmentShader = `
    uniform vec3 uColor;
    uniform float uAlpha;
    varying float vDepth;
    varying float vBright;

    void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        if(length(uv) > 0.5) discard;
        float glow = 1.0 - smoothstep(0.0, 0.5, length(uv));
        float fog = smoothstep(500.0, 200.0, vDepth);
        vec3 finalColor = uColor * (0.5 + vBright * 1.5);
        gl_FragColor = vec4(finalColor, glow * uAlpha * fog);
    }
`;

window.initHero = function (containerId, loadingId) {
    const container = document.getElementById(containerId);

    // SCENE
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(CONFIG.colors.bg, 0.002);

    // CAMERA
    camera = new THREE.PerspectiveCamera(CONFIG.camFov, window.innerWidth / window.innerHeight, 1, 4000);
    camera.position.set(0, 0, 800);

    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // GROUPS
    faceGroup = new THREE.Group();
    textGroup = new THREE.Group();
    scene.add(faceGroup);
    scene.add(textGroup);

    // EVENTS
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    // START LOADING
    loadAssets(loadingId);
}

function loadAssets(loadingId) {
    const img = new Image();
    img.src = CONFIG.assets.face;
    img.crossOrigin = "Anonymous";

    img.onload = () => processImage(img, loadingId);
    img.onerror = () => {
        console.warn("Hero: Image rejected. Using fallback.");
        createFallbackSphere();
        finishInit(loadingId);
    };
}

function processImage(img, loadingId) {
    try {
        const c = document.createElement('canvas');
        const ctx = c.getContext('2d');
        const w = 350;
        const h = w * (img.height / img.width);
        c.width = w; c.height = h;

        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;

        const start = [], target = [], bright = [];
        const step = 2;

        for (let y = 0; y < h; y += step) {
            for (let x = 0; x < w; x += step) {
                const i = (y * w + x) * 4;
                if (data[i + 3] > 50 && (data[i] + data[i + 1] + data[i + 2]) > 30) {
                    const br = (data[i] + data[i + 1] + data[i + 2]) / 765;
                    target.push((x - w / 2), -(y - h / 2), br * 45);
                    start.push((Math.random() - 0.5) * 1200, (Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 800 + 300);
                    bright.push(br);
                }
            }
        }

        createSystem(start, target, bright, faceGroup, CONFIG.particleSize, CONFIG.colors.primary);
        finishInit(loadingId);

    } catch (e) {
        console.warn("Hero: Canvas data blocked (CORS). Using fallback.");
        createFallbackSphere();
        finishInit(loadingId);
    }
}

function createFallbackSphere() {
    const start = [], target = [], bright = [];
    for (let i = 0; i < 12000; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = 150 + Math.random() * 10;

        target.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
        start.push((Math.random() - 0.5) * 1200, (Math.random() - 0.5) * 1000, 300);
        bright.push(0.5 + Math.random() * 0.5);
    }
    createSystem(start, target, bright, faceGroup, CONFIG.particleSize, CONFIG.colors.primary);
}

function createSystem(start, target, bright, group, size, color) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('aStart', new THREE.Float32BufferAttribute(start, 3));
    geo.setAttribute('aTarget', new THREE.Float32BufferAttribute(target, 3));
    geo.setAttribute('aBright', new THREE.Float32BufferAttribute(bright, 1));

    const mat = new THREE.ShaderMaterial({
        vertexShader, fragmentShader,
        transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
            uTime: { value: 0 },
            uMorph: { value: 0 },
            uSize: { value: size * (window.devicePixelRatio > 1 ? 3.0 : 1.5) },
            uColor: { value: new THREE.Color(color) },
            uAlpha: { value: 0.9 },
            uMouseX: { value: 0 }
        }
    });
    group.add(new THREE.Points(geo, mat));
}

function finishInit(loadingId) {
    initText();
    startAnimationLoop();
    runSequencer(loadingId);
}

function initText() {
    // Generate text particles (Simplified for brevity, same logic as before)
    // We can assume this function works as verified in prototype
    // For this modular file, we'll implement it efficiently

    // ... Text Gen Logic ...
    // Since direct canvas text is complex to minify, we'll replicate the proven function
    const gen = (txt, yOff, sz, col) => {
        const c = document.createElement('canvas');
        const cx = c.getContext('2d');
        c.width = 1024; c.height = 256;
        cx.font = `bold ${sz}px "Outfit", sans-serif`;
        cx.fillStyle = 'white';
        cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillText(txt, c.width / 2, c.height / 2);
        const d = cx.getImageData(0, 0, c.width, c.height).data;
        // ... extraction ...
        const s = [], t = [], b = [];
        for (let y = 0; y < c.height; y += 4) {
            for (let x = 0; x < c.width; x += 4) {
                const i = (y * c.width + x) * 4;
                if (d[i + 3] > 128) {
                    t.push((x - c.width / 2) * 0.5, -(y - c.height / 2) * 0.5 + yOff, 60);
                    s.push((Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800, 300);
                    b.push(1);
                }
            }
        }
        createSystem(s, t, b, textGroup, CONFIG.textParticleSize, col);
    };

    gen("@AvinashAnalytics_bot", -140, 70, CONFIG.colors.primary);
    // gen("AvinashAnalytics.github.io", -180, 45, CONFIG.colors.secondary); // Optional second line
}

function onMouseMove(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function startAnimationLoop() {
    clock = new THREE.Clock();
    const animate = () => {
        const time = clock.getElapsedTime();

        // UNIFORMS
        [faceGroup, textGroup].forEach(g => {
            g.children.forEach(c => c.material.uniforms.uTime.value = time);
        });

        // MOTION
        const trY = mouse.x * 0.4;
        const trX = mouse.y * 0.2;
        faceGroup.rotation.y += (trY - faceGroup.rotation.y) * 0.05 + Math.sin(time * 0.5) * 0.002;
        faceGroup.rotation.x += (trX - faceGroup.rotation.x) * 0.05;
        textGroup.rotation.copy(faceGroup.rotation);

        camera.position.x += (mouse.x * 30 - camera.position.x) * 0.05;
        camera.position.y += (mouse.y * 30 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
    };
    animate();
}

function runSequencer(loadingId) {
    // UI FADE
    const loader = document.getElementById(loadingId);
    if (loader) loader.style.opacity = 0;

    // GSAP
    if (typeof gsap !== 'undefined') {
        const tl = gsap.timeline();
        tl.to(camera.position, { z: CONFIG.camDist, duration: 4, ease: "power2.inOut" }, 0);

        faceGroup.children.forEach(c => {
            tl.to(c.material.uniforms.uMorph, { value: 1, duration: 3.5, ease: "power2.inOut" }, 0.5);
        });

        // Delay text slightly
        setTimeout(() => {
            textGroup.children.forEach(c => {
                gsap.to(c.material.uniforms.uMorph, { value: 1, duration: 2.5, ease: "power2.out" });
            });
        }, 1500);
    }
}
