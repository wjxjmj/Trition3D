<script lang="ts">
  import {T, useThrelte} from "@threlte/core"
  import {GridHelper} from "three"

  const {camera} = useThrelte()

  // Adaptive grid based on camera zoom (Fusion 360 style).
  // $derived.by explicitly tracks camera.current.zoom.
  const steps = $derived.by(() => {
    const zoom = camera.current.zoom || 1
    const unitPower = Math.floor(Math.log10(zoom))
    const major = Math.pow(10, -unitPower + 2) // default 100 units
    const minor = major / 10
    return {major, minor}
  })

  function makeGrid(cellSize: number, color: string, opacity: number): GridHelper {
    const size = 800 // large enough that edges are normally out of view
    const divs = Math.round(size / cellSize)
    const grid = new GridHelper(size, Math.max(1, divs), color, color)
    grid.rotation.x = -Math.PI / 2 // lay flat in XY (Z-up ground)
    grid.children.forEach((c: any) => {
      c.material.transparent = true
      c.material.opacity = opacity
      c.material.depthTest = false
      c.material.depthWrite = false
    })
    return grid
  }
</script>

{#key steps.major}
  <!-- Major grid lines (coarse, darker) -->
  <T is={makeGrid(steps.major, "#333333", 0.4)} />
  <!-- Minor grid lines (fine, lighter) -->
  <T is={makeGrid(steps.minor, "#999999", 0.15)} />
{/key}
