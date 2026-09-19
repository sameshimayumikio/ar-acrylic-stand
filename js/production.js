import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

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
    imageTargetSrc: '../assets/01/05-target-test.mind',
    warmupTolerance: 1,
    missTolerance: 60,
    filterMinCF: 0.00001,
    filterBeta: 0.001,
  });

  const { renderer, scene, camera } = mindarThree;
  renderer.setClearAlpha(0);
  const anchor = mindarThree.addAnchor(0);
const tapArea = document.getElementById('video-tap-area');
  const playIcon = document.getElementById('play-icon');

  const video = document.createElement('video');
  video.src = '../assets/videos/dance.mp4';
  video.playsInline = true;
  video.crossOrigin = 'anonymous';
  video.setAttribute('webkit-playsinline', '');

  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.colorSpace = THREE.SRGBColorSpace;
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;

  // 左半分=RGB映像 / 右半分=アルファマスク のサイドバイサイドMP4を合成するシェーダー
  const material = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: videoTexture },
      alphaThreshold: { value: 0.5 },
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
      varying vec2 vUv;
      void main() {
        vec2 colorUv = vec2(vUv.x * 0.5, vUv.y);
        vec2 alphaUv = vec2(vUv.x * 0.5 + 0.5, vUv.y);
        vec3 color = texture2D(map, colorUv).rgb;
        float alpha = texture2D(map, alphaUv).r;
        if (alpha < alphaThreshold) discard;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    transparent: true,
  });

  // 元動画のアスペクト比に合わせて plane のサイズを調整
  const geometry = new THREE.PlaneGeometry(1, 1.5);
  const plane = new THREE.Mesh(geometry, material);
  anchor.group.add(plane);

anchor.onTargetFound = () => {
    // 静止画（先頭フレーム）を表示するため、一瞬再生して即停止する
    video.currentTime = 0;
    video.play()
      .then(() => {
        video.pause();
      })
      .catch((err) => console.warn('preview frame failed:', err));
    tapArea.classList.add('active');
    playIcon.classList.add('visible');
  };
  anchor.onTargetLost = () => {
    video.pause();
    tapArea.classList.remove('active');
    playIcon.classList.remove('visible');
  };
  tapArea.addEventListener('click', () => {
    if (video.paused) {
      video.play().catch((err) => console.warn('video play failed:', err));
      playIcon.classList.remove('visible');
    }
  });
  video.addEventListener('ended', () => {
    video.currentTime = 0;
    video.pause();
    playIcon.classList.add('visible');
  });

  await mindarThree.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
}
