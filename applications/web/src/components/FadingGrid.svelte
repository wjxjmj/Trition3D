<script lang="ts">
  import {T, useThrelte, useTask} from "@threlte/core"
  import {GridHelper, LineSegments, BufferGeometry, Float32BufferAttribute, LineBasicMaterial} from "three"
  import {Line2} from "three/addons/lines/Line2.js"
  import {LineMaterial} from "three/addons/lines/LineMaterial.js"
  import {LineGeometry} from "three/addons/lines/LineGeometry.js"
  import {extend} from "@threlte/core"

  extend({Line2})

  const {camera, size, dpr} = useThrelte()

  let z = $state(5)
  useTask(() => { z = camera.current.zoom })

  const steps = $derived.by(() => {
    const unitPower = Math.floor(Math.log10(z))
    const minor = Math.pow(10, -unitPower + 1)
    const major = minor * 10
    return {major, minor}
  })

  // Fine grid: standard GridHelper (thin 1px lines, low opacity)
  function makeFineGrid(cellSize: number): GridHelper {
    const s = 800
    const divs = Math.max(1, Math.round(s / cellSize))
    const g = new GridHelper(s, divs, "#666666", "#666666")
    g.rotation.x = -Math.PI / 2
    g.children.forEach((c: any) => {
      c.material.transparent = true
      c.material.opacity = 0.08
      c.material.depthTest = false
      c.material.depthWrite = false
    })
    return g
  }

  // Major grid: Line2 with actual thick lines
  function makeCoarseGrid(cellSize: number) {
    const s = 800
    const half = s / 2
    const points: number[] = []

    for (let i = -half; i <= half; i += cellSize) {
      // X-aligned lines
      points.push(-half, i, 0.01, half, i, 0.01)
      // Y-aligned lines
      points.push(i, -half, 0.01, i, half, 0.01)
    }

    const geom = new LineGeometry()
    geom.setPositions(points)

    const mat = new LineMaterial({
      color: 0x000000,
      linewidth: 1.8 * dpr,
      transparent: true,
      opacity: 0.25,
      depthTest: false,
      depthWrite: false,
      resolution: [size.width * dpr, size.height * dpr],
      worldUnits: false,
    })

    const lines = new Line2(geom, mat)
    lines.computeLineDistances()
    return lines
  }
</script>

{#key steps.minor}
  <T is={makeFineGrid(steps.minor)} />
  <T is={makeCoarseGrid(steps.major)} />
{/key}
