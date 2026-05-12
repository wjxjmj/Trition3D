<script lang="ts">
  import {T} from "@threlte/core"
  import * as THREE from "three"

  // Z-up coordinate system (camera up=[0,0,1])
  const axisLen = 10000 // "infinite" feel
  const radius = 0.1
  const planeSize = 15
</script>

<T.Group>
  <!-- ===== Infinite color axes ===== -->
  <!-- X axis (red) — horizontal, along X -->
  <T.Mesh position={[0, 0, 0]} rotation.z={-Math.PI / 2}>
    <T.CylinderGeometry args={[radius, radius, axisLen, 6]} />
    <T.MeshBasicMaterial color="#ff3b30" />
  </T.Mesh>

  <!-- Y axis (green) — horizontal, along Y -->
  <T.Mesh position={[0, 0, 0]}>
    <T.CylinderGeometry args={[radius, radius, axisLen, 6]} />
    <T.MeshBasicMaterial color="#4cd964" />
  </T.Mesh>

  <!-- Z axis (blue) — vertical (up) -->
  <T.Mesh position={[0, 0, axisLen / 2]}>
    <T.CylinderGeometry args={[radius, radius, axisLen, 6]} />
    <T.MeshBasicMaterial color="#007aff" />
  </T.Mesh>

  <!-- ===== Origin planes — Z-up corrected ===== -->
  <!-- XY plane (ground, red-green plane) — flat at z=0, no rotation -->
  <T.Mesh position={[planeSize / 2, planeSize / 2, 0]}>
    <T.PlaneGeometry args={[planeSize, planeSize]} />
    <T.MeshBasicMaterial color="#cccccc" transparent opacity={0.15} side={2} depthWrite={false} />
  </T.Mesh>

  <!-- XZ plane (vertical, red-blue plane) — rotated to stand up from XY -->
  <T.Mesh rotation.x={-Math.PI / 2} position={[planeSize / 2, 0, planeSize / 2]}>
    <T.PlaneGeometry args={[planeSize, planeSize]} />
    <T.MeshBasicMaterial color="#ff3b30" transparent opacity={0.1} side={2} depthWrite={false} />
  </T.Mesh>

  <!-- YZ plane (vertical, green-blue plane) — rotated to stand up from XY -->
  <T.Mesh rotation.y={Math.PI / 2} position={[0, planeSize / 2, planeSize / 2]}>
    <T.PlaneGeometry args={[planeSize, planeSize]} />
    <T.MeshBasicMaterial color="#4cd964" transparent opacity={0.1} side={2} depthWrite={false} />
  </T.Mesh>

  <!-- ===== Center sphere ===== -->
  <T.Mesh>
    <T.SphereGeometry args={[0.3, 16, 16]} />
    <T.MeshBasicMaterial color="white" />
  </T.Mesh>
</T.Group>
