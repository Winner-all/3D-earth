// src/boundary.js
// 国家边界线加载与渲染模块
// 低耦合设计，便于后续扩展
import * as THREE from 'three';
import { EARTH_RADIUS, BOUNDARY_PATHS } from './config.js';

/**
 * 经纬度转球面坐标
 * @param {number} lon 经度
 * @param {number} lat 纬度
 * @param {number} radius 球半径
 * @returns {THREE.Vector3}
 */
function lonLatToVector3(lon, lat, radius = EARTH_RADIUS + 0.001) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * 加载并渲染国家边界线
 * @param {THREE.Scene} scene three.js 场景
 * @param {string} [geojsonUrl] 可选，geojson 路径，默认用 config
 * @returns {Promise<THREE.Group>} 返回边界线 group
 */
export async function addCountryBoundaries(scene, geojsonUrl = BOUNDARY_PATHS.country) {
  // 加载 geojson
  const res = await fetch(geojsonUrl);
  const geojson = await res.json();
  const group = new THREE.Group();
  geojson.features.forEach(feature => {
    const coords = feature.geometry.coordinates;
    if (feature.geometry.type === 'Polygon') {
      coords.forEach(ring => {
        const line = createBoundaryLine(ring);
        group.add(line);
      });
    } else if (feature.geometry.type === 'MultiPolygon') {
      coords.forEach(polygon => {
        polygon.forEach(ring => {
          const line = createBoundaryLine(ring);
          group.add(line);
        });
      });
    }
  });
  scene.add(group);
  return group;
}

/**
 * 加载并渲染省级边界线
 * @param {THREE.Scene} scene three.js 场景
 * @param {string} [geojsonUrl] 可选，geojson 路径，默认用 config
 * @returns {Promise<THREE.Group>} 返回边界线 group
 */
export async function addProvinceBoundaries(scene, geojsonUrl = BOUNDARY_PATHS.province) {
  const res = await fetch(geojsonUrl);
  const geojson = await res.json();
  const group = new THREE.Group();
  geojson.features.forEach(feature => {
    const coords = feature.geometry.coordinates;
    if (feature.geometry.type === 'Polygon') {
      coords.forEach(ring => {
        const line = createBoundaryLine(ring, 0xffa500); // 橙色
        group.add(line);
      });
    } else if (feature.geometry.type === 'MultiPolygon') {
      coords.forEach(polygon => {
        polygon.forEach(ring => {
          const line = createBoundaryLine(ring, 0xffa500);
          group.add(line);
        });
      });
    }
  });
  scene.add(group);
  return group;
}

/**
 * 加载并渲染市级边界线
 * @param {THREE.Scene} scene three.js 场景
 * @param {string} [geojsonUrl] 可选，geojson 路径，默认用 config
 * @returns {Promise<THREE.Group>} 返回边界线 group
 */
export async function addCityBoundaries(scene, geojsonUrl = BOUNDARY_PATHS.city) {
  const res = await fetch(geojsonUrl);
  const geojson = await res.json();
  const group = new THREE.Group();
  geojson.features.forEach(feature => {
    const coords = feature.geometry.coordinates;
    if (feature.geometry.type === 'Polygon') {
      coords.forEach(ring => {
        const line = createBoundaryLine(ring, 0xff0000); // 红色
        group.add(line);
      });
    } else if (feature.geometry.type === 'MultiPolygon') {
      coords.forEach(polygon => {
        polygon.forEach(ring => {
          const line = createBoundaryLine(ring, 0xff0000);
          group.add(line);
        });
      });
    }
  });
  scene.add(group);
  return group;
}

/**
 * 创建边界线
 * @param {Array} ring 经纬度数组 [[lon, lat], ...]
 * @param {number} [color] 可选，边界线颜色，默认白色
 * @returns {THREE.Line}
 */
function createBoundaryLine(ring, color = 0xffffff) {
  const points = ring.map(([lon, lat]) => lonLatToVector3(lon, lat));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, linewidth: 3 }); // 线宽调大为3
  return new THREE.Line(geometry, material);
}