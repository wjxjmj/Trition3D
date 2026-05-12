<script lang="ts">
  import {T} from "@threlte/core"
  import * as THREE from "three"

  // Dual-layer infinite grid in XY plane (Z-up).
  // Lay flat by rotating -PI/2 around X.

  const size = 400
  const segments = 200 // 400/200 = 2 units per segment

  // Build a shared plane geometry
  const geom = new THREE.PlaneGeometry(size, size, segments, segments)

  // --- Fine grid shader (1-unit cells) ---
  const fineVert = /* glsl */ `
    varying vec2 vUv;
    varying vec3 vPos;
    void main() {
      vec4 wp = modelMatrix * vec4(position, 1.0);
      vPos = wp.xyz;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `
  const fineFrag = /* glsl */ `
    varying vec2 vUv;
    varying vec3 vPos;
    void main() {
      // World-space distance to nearest 1-unit line
      float fx = abs(fract(vPos.x) - 0.5) * 2.0;
      float fy = abs(fract(vPos.y) - 0.5) * 2.0;
      float line = 1.0 - smoothstep(0.02, 0.06, min(fx, fy));
      // Fade with distance
      float dist = length(vPos.xy);
      float fade = 1.0 - smoothstep(120.0, 380.0, dist);
      float alpha = line * 0.12 * fade;
      gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
    }
  `
  const fineMat = new THREE.ShaderMaterial({
    vertexShader: fineVert,
    fragmentShader: fineFrag,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  })

  // --- Coarse grid shader (10-unit cells) ---
  const coarseFrag = /* glsl */ `
    varying vec2 vUv;
    varying vec3 vPos;
    void main() {
      // World-space distance to nearest 10-unit line
      float cx = abs(fract(vPos.x / 10.0) - 0.5) * 2.0;
      float cy = abs(fract(vPos.y / 10.0) - 0.5) * 2.0;
      float line = 1.0 - smoothstep(0.02, 0.10, min(cx, cy));
      float dist = length(vPos.xy);
      float fade = 1.0 - smoothstep(200.0, 390.0, dist);
      float alpha = line * 0.22 * fade;
      gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
    }
  `
  const coarseMat = new THREE.ShaderMaterial({
    vertexShader: fineVert, // same vertex shader
    fragmentShader: coarseFrag,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  })

  // Both planes rotated to lie flat in XY (Z-up)
  const fineMesh = new THREE.Mesh(geom, fineMat)
  fineMesh.rotation.x = -Math.PI / 2
  fineMesh.renderOrder = 998

  const coarseMesh = new THREE.Mesh(geom, coarseMat)
  coarseMesh.rotation.x = -Math.PI / 2
  coarseMesh.renderOrder = 997
</script>

<T is={coarseMesh} />
<T is={fineMesh} />
