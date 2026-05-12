<script lang="ts">
  import {T, useThrelte} from "@threlte/core"
  import {GridHelper} from "three"

  const {camera} = useThrelte()

  // Adaptive grid: cell size scales with camera zoom (Fusion 360 style).
  const logZoom = $derived(Math.log10(camera.current.zoom || 1))
  const exponent = $derived(Math.floor(logZoom))
  const majorStep = $derived(Math.pow(10, -exponent + 1))
  const minorStep = $derived(majorStep / 10)

  function makeGrid(cellSize: number, color: string, opacity: number): GridHelper {
    const size = 400
    const divs = Math.round(size / cellSize)
    const grid = new GridHelper(size, Math.max(1, divs), color, color)
    grid.rotation.x = -Math.PI / 2 // lay flat in XY for Z-up
    grid.children.forEach((c: any) => {
      c.material.transparent = true
      c.material.opacity = opacity
      c.material.depthTest = false
      c.material.depthWrite = false
    })
    return grid
  }
</script>

{#key majorStep}
  <T is={makeGrid(majorStep, "#333333", 0.35)} />
  <T is={makeGrid(minorStep, "#999999", 0.15)} />
{/key}
