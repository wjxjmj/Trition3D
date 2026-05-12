<script lang="ts">
  import {T, useThrelte, extend} from "@threlte/core"
  import * as THREE from "three"
  import {Line2} from "three/addons/lines/Line2.js"
  import {LineMaterial} from "three/addons/lines/LineMaterial.js"
  import {LineGeometry} from "three/addons/lines/LineGeometry.js"

  extend({Line2})

  const {size, dpr} = useThrelte()
  const planeSize = 15

  // Screen-space axes via Line2 — fixed pixel width regardless of zoom
  const axisLen = 10000
  const axisW = 2.5

  function makeAxis(color: number, ...positions: number[]) {
    const g = new LineGeometry()
    g.setPositions(positions)
    const m = new LineMaterial({
      color,
      linewidth: axisW * dpr,
      transparent: true,
      opacity: 0.85,
      depthTest: true,
      depthWrite: true,
      resolution: [size.width * dpr, size.height * dpr],
      worldUnits: false,
    })
    return new Line2(g, m)
  }

  // X axis (red) — along X, from -axisLen to +axisLen
  const xAxis = makeAxis(0xff3b30, -axisLen, 0, 0, axisLen, 0, 0)
  // Y axis (blue) — along Y
  const yAxis = makeAxis(0x007aff, 0, -axisLen, 0, 0, axisLen, 0)

  // Plane border geometry
  const edgeGeom = new THREE.EdgesGeometry(new THREE.PlaneGeometry(planeSize, planeSize))
</script>

<T.Group>
  <!-- Screen-space axes -->
  <T is={xAxis} />
  <T is={yAxis} />

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
