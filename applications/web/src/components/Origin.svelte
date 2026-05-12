<script lang="ts">
  import {T} from "@threlte/core"
  import * as THREE from "three"

  const planeSize = 15
  const axisLen = 10000

  // Simple Line geometry for axes — always 1px, consistent at any zoom
  const xGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-axisLen, 0, 0), new THREE.Vector3(axisLen, 0, 0),
  ])
  const yGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -axisLen, 0), new THREE.Vector3(0, axisLen, 0),
  ])
  const xMat = new THREE.LineBasicMaterial({color: "#ff3b30"})
  const yMat = new THREE.LineBasicMaterial({color: "#007aff"})
</script>

<T.Group>
  <!-- X axis (red) -->
  <T.Line geometry={xGeom} material={xMat} />
  <!-- Y axis (blue) -->
  <T.Line geometry={yGeom} material={yMat} />

  <!-- Origin planes -->
  <!-- XY plane (ground) -->
  <T.Mesh position={[planeSize / 2, planeSize / 2, 0]}>
    <T.PlaneGeometry args={[planeSize, planeSize]} />
    <T.MeshBasicMaterial color="#cccccc" transparent opacity={0.15} side={2} depthWrite={false} />
  </T.Mesh>

  <!-- XZ plane (vertical) -->
  <T.Mesh rotation.x={-Math.PI / 2} position={[planeSize / 2, 0, planeSize / 2]}>
    <T.PlaneGeometry args={[planeSize, planeSize]} />
    <T.MeshBasicMaterial color="#ff3b30" transparent opacity={0.1} side={2} depthWrite={false} />
  </T.Mesh>

  <!-- YZ plane (vertical) -->
  <T.Mesh rotation.y={Math.PI / 2} position={[0, planeSize / 2, planeSize / 2]}>
    <T.PlaneGeometry args={[planeSize, planeSize]} />
    <T.MeshBasicMaterial color="#4cd964" transparent opacity={0.1} side={2} depthWrite={false} />
  </T.Mesh>

  <!-- Center sphere -->
  <T.Mesh>
    <T.SphereGeometry args={[0.3, 16, 16]} />
    <T.MeshBasicMaterial color="white" />
  </T.Mesh>
</T.Group>
