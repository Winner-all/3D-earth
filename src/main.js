// src/main.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EARTH_RADIUS, TEXTURE_PATH } from './config.js';
import { addCountryBoundaries, addProvinceBoundaries } from './boundary.js';

const scene = new THREE.Scene();

let earth, countryGroup, provinceGroup, cityGroup; // 声明全局变量

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 添加灯光
const light = new THREE.PointLight(0xffffff, 2);
light.position.set(5, 5, 5);
scene.add(light);

// 添加环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// 创建地球球体
const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
const texture = new THREE.TextureLoader().load(TEXTURE_PATH);
const material = new THREE.MeshStandardMaterial({ map: texture });
earth = new THREE.Mesh(geometry, material);
scene.add(earth);

// 加载并渲染国家分割线
addCountryBoundaries(scene).then(group => { countryGroup = group; });
// 加载并渲染省级分割线
addProvinceBoundaries(scene).then(group => { provinceGroup = group; });

// 控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false; // 禁用 OrbitControls 的缩放

// 假放大缩放逻辑
let scale = 1;
let targetScale = 1;

function setEarthScale(factor) {
  scale = factor;
  earth.scale.set(scale, scale, scale);
  if (countryGroup) countryGroup.scale.set(scale, scale, scale);
  if (provinceGroup) provinceGroup.scale.set(scale, scale, scale);
  if (cityGroup) cityGroup.scale.set(scale, scale, scale);

  // 动态限制相机最近距离
  controls.minDistance = EARTH_RADIUS * scale * 1.01;
  controls.maxDistance = EARTH_RADIUS * scale * 20;
}

renderer.domElement.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (e.deltaY < 0) targetScale += 0.1;
  else targetScale -= 0.1;
  targetScale = Math.max(1, Math.min(targetScale, 20));
});

// 窗口自适应
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // 平滑插值 scale
  scale += (targetScale - scale) * 0.3; // 0.3 可调，越大越快
  setEarthScale(scale);

  // 分级显示逻辑
  if (countryGroup) {
    countryGroup.visible = scale < 4.0;
  }
  if (provinceGroup) {
    provinceGroup.visible = scale >= 4.0;
  }

  renderer.render(scene, camera);
}
animate();
