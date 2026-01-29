/**
 * V5 Jour 5 GPU — Shader GLSL pour le halo des sphères (portfolio 3D).
 * Fragment + vertex minimal pour un glow côté GPU (BackSide, couleur + pulsation optionnelle).
 */

import * as THREE from 'three';

export const sphereGlowVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const sphereGlowFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vec3 viewDir = normalize(vViewPosition);
    float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
    rim = pow(rim, 2.0);
    float pulse = 0.85 + 0.15 * sin(uTime * 1.5);
    gl_FragColor = vec4(uColor, uOpacity * rim * pulse);
  }
`;

export function createSphereGlowMaterial(
  color: string,
  opacity: number = 0.25,
  time: number = 0
): THREE.ShaderMaterial {
  const c = new THREE.Color(color);
  return new THREE.ShaderMaterial({
    vertexShader: sphereGlowVertex,
    fragmentShader: sphereGlowFragment,
    uniforms: {
      uColor: { value: new THREE.Vector3(c.r, c.g, c.b) },
      uOpacity: { value: opacity },
      uTime: { value: time },
    },
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
  });
}
