<script lang="ts">
  import {T} from "@threlte/core"
  import * as THREE from "three"

  const gridSize = 400

  // Vertex shader — passes world position to fragment
  const vert = /* glsl */ `
    varying vec3 vWorldPos;
    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  // Fragment shader — fading grid lines
  const frag = /* glsl */ `
    varying vec3 vWorldPos;
    uniform float uTime;

    // Grid line function
    float gridLine(float coord, float cellSize) {
      float halfCell = cellSize * 0.5;
      float d = abs(mod(coord + halfCell, cellSize) - halfCell);
      return smoothstep(1.5, 0.0, d);
    }

    void main() {
      float fineSize = 10.0;
      float coarseSize = 100.0;

      // Fine grid (both X and Y)
      float fineX = gridLine(vWorldPos.x, fineSize);
      float fineY = gridLine(vWorldPos.y, fineSize);
      float fine = max(fineX, fineY);

      // Coarse grid
      float coarseX = gridLine(vWorldPos.x, coarseSize);
      float coarseY = gridLine(vWorldPos.y, coarseSize);
      float coarse = max(coarseX, coarseY);

      // Distance fade from origin
      float dist = length(vWorldPos.xy);
      float fade = 1.0 - smoothstep(150.0, 380.0, dist);

      // Combine: fine is very subtle, coarse more visible
      float alpha = fine * 0.08 + coarse * 0.18;
      alpha *= fade;

      gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
    }
  `

  const uniforms = {uTime: {value: 0}}
  const material = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  })
  const geometry = new THREE.PlaneGeometry(gridSize, gridSize)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.renderOrder = 999
</script>

<T is={mesh} />
