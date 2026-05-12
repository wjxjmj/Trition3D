<script lang="ts">
  import {T} from "@threlte/core"
  import * as THREE from "three"

  const axisLen = 40
  const thickness = 0.15
  const planeOpacity = 0.06
  const planeSize = 18

  // Thin edge geometry for plane borders
  const edgeGeom = new THREE.EdgesGeometry(new THREE.PlaneGeometry(planeSize, planeSize))
</script>

<T.Group>
  <!-- Axes — thin clean lines, doubled length -->
  <!-- X axis (red) -->
  <T.Mesh position={[axisLen / 2, 0, 0]}>
    <T.BoxGeometry args={[axisLen, thickness, thickness]} />
    <T.MeshBasicMaterial color="#ff3b30" />
  </T.Mesh>
  <!-- Y axis (green) -->
  <T.Mesh position={[0, axisLen / 2, 0]}>
    <T.BoxGeometry args={[thickness, axisLen, thickness]} />
    <T.MeshBasicMaterial color="#4cd964" />
  </T.Mesh>
  <!-- Z axis (blue) -->
  <T.Mesh position={[0, 0, axisLen / 2]}>
    <T.BoxGeometry args={[thickness, thickness, axisLen]} />
    <T.MeshBasicMaterial color="#007aff" />
  </T.Mesh>

  <!-- Origin planes — ultra-thin, subtle, edge-only -->
  <!-- XY plane -->
  <T.Mesh rotation.x={Math.PI / 2} position={[planeSize / 2, planeSize / 2, 0]}>
    <T.PlaneGeometry args={[planeSize, planeSize]} />
    <T.MeshBasicMaterial color="#ff3b30" transparent opacity={planeOpacity} side={2} depthWrite={false} />
  </T.Mesh>
  <T.LineSegments
    rotation.x={Math.PI / 2}
    position={[planeSize / 2, planeSize / 2, 0]}
    geometry={edgeGeom}
    material={new THREE.LineBasicMaterial({color: "#ff3b30", transparent: true, opacity: 0.25, depthTest: true})}
  />

  <!-- XZ plane -->
  <T.Mesh position={[planeSize / 2, 0, planeSize / 2]}>
    <T.PlaneGeometry args={[planeSize, planeSize]} />
    <T.MeshBasicMaterial color="#4cd964" transparent opacity={planeOpacity} side={2} depthWrite={false} />
  </T.Mesh>
  <T.LineSegments
    position={[planeSize / 2, 0, planeSize / 2]}
    geometry={edgeGeom}
    material={new THREE.LineBasicMaterial({color: "#4cd964", transparent: true, opacity: 0.25, depthTest: true})}
  />

  <!-- YZ plane -->
  <T.Mesh rotation.y={Math.PI / 2} position={[0, planeSize / 2, planeSize / 2]}>
    <T.PlaneGeometry args={[planeSize, planeSize]} />
    <T.MeshBasicMaterial color="#007aff" transparent opacity={planeOpacity} side={2} depthWrite={false} />
  </T.Mesh>
  <T.LineSegments
    rotation.y={Math.PI / 2}
    position={[0, planeSize / 2, planeSize / 2]}
    geometry={edgeGeom}
    material={new THREE.LineBasicMaterial({color: "#007aff", transparent: true, opacity: 0.25, depthTest: true})}
  />

  <!-- Origin center — small glowing dot -->
  <T.Mesh>
    <T.SphereGeometry args={[0.35, 16, 16]} />
    <T.MeshBasicMaterial color="#ffffff" transparent opacity={0.8} />
  </T.Mesh>
</T.Group>
