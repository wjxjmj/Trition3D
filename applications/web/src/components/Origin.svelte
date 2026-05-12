<script lang="ts">
  import {T, useThrelte, extend} from "@threlte/core"
  import * as THREE from "three"
  import {Line2} from "three/addons/lines/Line2.js"
  import {LineMaterial} from "three/addons/lines/LineMaterial.js"
  import {LineGeometry} from "three/addons/lines/LineGeometry.js"

  extend({Line2})

  const {size, dpr} = useThrelte()
  const planeSize = 15

  // Axes span grid area, offset 0.01 in Z to avoid z-fighting with grid lines
  const gridSize = 400
  const zOff = 0.01
  const pointsX = [-gridSize, 0, zOff, gridSize, 0, zOff]
  const pointsY = [0, -gridSize, zOff, 0, gridSize, zOff]

  const xGeom = new LineGeometry(); xGeom.setPositions(pointsX)
  const yGeom = new LineGeometry(); yGeom.setPositions(pointsY)

  const xMat = new LineMaterial({
    color: 0xff3b30, linewidth: 2.5, worldUnits: false, depthTest: true,
    resolution: [1, 1],
  })
  const yMat = new LineMaterial({
    color: 0x007aff, linewidth: 2.5, worldUnits: false, depthTest: true,
    resolution: [1, 1],
  })
  const xAxis = new Line2(xGeom, xMat)
  const yAxis = new Line2(yGeom, yMat)

  // Update resolution reactively
  $effect(() => {
    xMat.resolution.set($size.width * $dpr, $size.height * $dpr)
    yMat.resolution.set($size.width * $dpr, $size.height * $dpr)
    xMat.linewidth = 2.5 * $dpr
    yMat.linewidth = 2.5 * $dpr
  })
</script>

<T.Group>
  <T is={xAxis} />
  <T is={yAxis} />

  <!-- Origin planes -->
  <T.Mesh position={[planeSize / 2, planeSize / 2, 0]}>
    <T.PlaneGeometry args={[planeSize, planeSize]} />
    <T.MeshBasicMaterial color="#cccccc" transparent opacity={0.15} side={2} depthWrite={false} />
  </T.Mesh>
  <T.Mesh rotation.x={-Math.PI / 2} position={[planeSize / 2, 0, planeSize / 2]}>
    <T.PlaneGeometry args={[planeSize, planeSize]} />
    <T.MeshBasicMaterial color="#ff3b30" transparent opacity={0.1} side={2} depthWrite={false} />
  </T.Mesh>
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
