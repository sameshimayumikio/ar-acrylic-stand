import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

const config = {
  imageTargetSrc: '',
  videoSrc: '',
  targetIndexA: 0,
  targetIndexB: 1,
  planeAspect: 1.5,
  planeScale: 1,
  brightness: 1,
  alphaThreshold: 0.5,
  warmupTolerance: 1,
  missTolerance: 20,
  filterMinCF: 0.00001,
  filterBeta: 0.001,
  ...(window.AR_CONFIG || {}),
};

if (!config.imageTargetSrc || !config.videoSrc) {
  throw new Error('AR_CONFIG に imageTargetSrc と videoSrc を指定してください。');
}

const startOverlay = document.getElementById('start-overlay');
const startButton = document.getElementById('start-button');

startButton.addEventListener('click', async () => {
  try {
    startOverlay.classList.add('hidden');
    await startAR();
  } catch (err) {
    console.error(err);
    alert('起動に失敗しました: ' + err.message);
  }
});

async function startAR() {
  const mindarThree = new MindARThree({
    container: document.querySelector('#ar-container'),
    imageTargetSrc: config.imageTargetSrc,
    maxTrack: 2,
    warmupTolerance: config.warmupTolerance,
    missTolerance: config.missTolerance,
    filterMinCF: config.filterMinCF,
    filterBeta: config.filterBeta,
  });

  const { renderer, scene, camera } = mindarThree;
  renderer.setClearAlpha(0);

  const anchorA = mindarThree.addAnchor(config.targetIndexA);
  const anchorB = mindarThree.addAnchor(config.targetIndexB);

  const tapArea = document.getElementById('video-tap-area');
  const playIcon = document.getElementById('play-icon');

  const video = document.createElement('video');
  video.src = config.videoSrc;
  video.playsInline = true;
  video.crossOrigin = 'anonymous';
  video.setAttribute('webkit-playsinline', '');

  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.colorSpace = THREE.SRGBColorSpace;
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: videoTexture },
      alphaThreshold: { value: config.alphaThreshold },
      brightness: { value: config.brightness },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float alphaThreshold;
      uniform float brightness;
      varying vec2 vUv;

      void main() {
        vec2 colorUv = vec2(vUv.x * 0.5, vUv.y);
        vec2 alphaUv = vec2(vUv.x * 0.5 + 0.5, vUv.y);

        vec3 color = texture2D(map, colorUv).rgb;
        color *= brightness;

        float alpha = texture2D(map, alphaUv).r;
        if (alpha < alphaThreshold) discard;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    transparent: true,
  });

  const geometry = new THREE.PlaneGeometry(1, config.planeAspect);
  const plane = new THREE.Mesh(geometry, material);

  const pairRoot = new THREE.Group();
  pairRoot.visible = false;
  pairRoot.add(plane);
  scene.add(pairRoot);

  let foundA = false;
  let foundB = false;
  let pairActive = false;

  const activatePair = () => {
    if (pairActive || !foundA || !foundB) return;
    pairActive = true;
    pairRoot.visible = true;

    video.currentTime = 0;
    video.play()
      .then(() => {
        video.pause();
      })
      .catch((err) => console.warn('preview frame failed:', err));

    tapArea.classList.add('active');
    playIcon.classList.add('visible');
  };

  const deactivatePair = () => {
    if (!pairActive) return;
    pairActive = false;
    video.pause();
    pairRoot.visible = false;
    tapArea.classList.remove('active');
    playIcon.classList.remove('visible');
  };

  const updatePairState = () => {
    if (foundA && foundB) activatePair();
    else deactivatePair();
  };

  anchorA.onTargetFound = () => {
    foundA = true;
    updatePairState();
  };

  anchorA.onTargetLost = () => {
    foundA = false;
    updatePairState();
  };

  anchorB.onTargetFound = () => {
    foundB = true;
    updatePairState();
  };

  anchorB.onTargetLost = () => {
    foundB = false;
    updatePairState();
  };

  tapArea.addEventListener('click', () => {
    if (!pairActive) return;
    if (video.paused) {
      video.play().catch((err) => console.warn('video play failed:', err));
      playIcon.classList.remove('visible');
    }
  });

  video.addEventListener('ended', () => {
    video.currentTime = 0;
    video.pause();
    if (pairActive) playIcon.classList.add('visible');
  });

  const posA = new THREE.Vector3();
  const posB = new THREE.Vector3();
  const scaleA = new THREE.Vector3();
  const scaleB = new THREE.Vector3();
  const quatA = new THREE.Quaternion();
  const quatB = new THREE.Quaternion();

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    if (pairActive) {
      scene.updateMatrixWorld(true);

      anchorA.group.getWorldPosition(posA);
      anchorB.group.getWorldPosition(posB);
      anchorA.group.getWorldScale(scaleA);
      anchorB.group.getWorldScale(scaleB);
      anchorA.group.getWorldQuaternion(quatA);
      anchorB.group.getWorldQuaternion(quatB);

      pairRoot.position.copy(posA).lerp(posB, 0.5);
      pairRoot.quaternion.copy(quatA).slerp(quatB, 0.5);

      const avgScale = (scaleA.x + scaleB.x) * 0.5 * config.planeScale;
      pairRoot.scale.set(avgScale, avgScale, avgScale);
    }

    renderer.render(scene, camera);
  });
}
