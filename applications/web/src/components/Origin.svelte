<script lang="ts">
  import {T} from "@threlte/core"
  import * as THREE from "three"

  const axisLen = 40
  const radius = 0.06
  const planeSize = 18

  // Thin edge for plane borders
  const edgeGeom = new THREE.EdgesGeometry(new THREE.PlaneGeometry(planeSize, planeSize))
</script>

<T.Group>
  <!-- Axes — thin cylinders (look solid from any angle) -->
  <!-- X axis (red) -->
  <T.Mesh position={[axisLen / 2, 0, 0]} rotation.z={-Math.PI / 2}>
    <T.CylinderGeometry args={[radius, radius, axisLen, 8]} />
    <T.MeshStandardMaterial color="#ff3b30" roughness={0.3} metalness={0.1} />
  </T.Mesh>
  <!-- Y axis (green) -->
  <T.Mesh position={[0, axisLen / 2, 0]}>
    <T.CylinderGeometry args={[radius, radius, axisLen, 8]} />
    <T.MeshStandardMaterial color="#4cd964" roughness={0.3} metalness={0.1} />
  </T.Mesh>
  <!-- Z axis (blue) -->
  <T.Mesh position={[0, 0, axisLen / 2]} rotation.x={Math.PI / 2}>
    <T.CylinderGeometry args={[radius, radius, axisLen, 8]} />
    <T.MeshStandardMaterial color="#007aff" roughness={0.3} metalness={0.1} />
  </T.Mesh>

  <!-- Origin planes — ultra-subtle -->
  <!-- XY plane -->
  <T.Mesh rotation.x={Math.PI / 2} position={[planeSize / 2, planeSize / 2, 0]}>
    <T.PlaneGeometry args={[planeSize, planeSize]} />
    <T.MeshBasicMaterial color="#ff3b30" transparent opacity={0.04} side={2} depthWrite={false} />
  </T.Mesh>
  <T.LineSegments
    rotation.x={Math.PI / 2} position={[planeSize / 2, planeSize / 2, 0]}
    geometry={edgeGeom}
    material={new THREE.LineBasicMaterial({color: "#ff3b30", transparent: true, opacity: 0.18})}
  />
  <!-- XZ plane -->
  <T.Mesh position={[planeSize / 2, 0, planeSize / 2]}>
    <T.PlaneGeometry args={[planeSize, planeSize]} />
    <T.MeshBasicMaterial color="#4cd964" transparent opacity={0.04} side={2} depthWrite={false} />
  </T.Mesh>
  <T.LineSegments
    position={[planeSize / 2, 0, planeSize / 2]}
    geometry={edgeGeom}
    material={new THREE.LineBasicMaterial({color: "#4cd964", transparent: true, opacity: 0.18})}
  />
  <!-- YZ plane -->
  <T.Mesh rotation.y={Math.PI / 2} position={[0, planeSize / 2, planeSize / 2]}>
    <T.PlaneGeometry args={[planeSize, planeSize]} />
    <T.MeshBasicMaterial color="#007aff" transparent opacity={0.04} side={2} depthWrite={false} />
  </T.Mesh>
  <T.LineSegments
    rotation.y={Math.PI / 2} position={[0, planeSize / 2, planeSize / 2]}
    geometry={edgeGeom}
    material={new THREE.LineBasicMaterial({color: "#007aff", transparent: true, opacity: 0.18})}
  />

  <!-- Center sphere — small, subtle -->
  <T.Mesh>
    <T.SphereGeometry args={[0.3, 16, 16]} />
    <T.MeshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
  </T.Mesh>

  <!-- Axis tip dots -->
  <T.Mesh position={[axisLen, 0, 0]}>
    <T.SphereGeometry args={[0.25, 8, 8]} />
    <T.MeshStandardMaterial color="#ff3b30" roughness={0.3} />
  </T.Mesh>
  <T.Mesh position={[0, axisLen, 0]}>
    <T.SphereGeometry args={[0.25, 8, 8]} />
    <T.MeshStandardMaterial color="#4cd964" roughness={0.3} />
  </T.Mesh>
  <T.Mesh position={[0, 0, axisLen]}>
    <T.SphereGeometry args={[0.25, 8, 8]} />
    <T.MeshStandardMaterial color="#007aff" roughness={0.3} />
  </T.Mesh>
</T.Group>
