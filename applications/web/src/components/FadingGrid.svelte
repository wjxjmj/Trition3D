<script lang="ts">
  import {T, useThrelte, useTask} from "@threlte/core"
  import {GridHelper} from "three"

  const {camera} = useThrelte()

  let zoom = $state(5)
  useTask(() => { zoom = camera.current.zoom })

  // Adaptive: minor = 10^(-power+1), major = minor * 10
  // e.g. zoom=5 → minor=10, major=100
  const steps = $derived.by(() => {
    const unitPower = Math.floor(Math.log10(zoom))
    const minor = Math.pow(10, -unitPower + 1)
    const major = minor * 10
    return {major, minor}
  })

  function makeGrid(cellSize: number, color: string, opacity: number): GridHelper {
    const size = 800
    const divs = Math.max(1, Math.round(size / cellSize))
    const grid = new GridHelper(size, divs, color, color)
    grid.rotation.x = -Math.PI / 2
    grid.children.forEach((c: any) => {
      c.material.transparent = true
      c.material.opacity = opacity
      c.material.depthTest = false
      c.material.depthWrite = false
    })
    return grid
  }
</script>

{#key steps.minor}
  <!-- Minor lines: fine, very subtle (every unit) -->
  <T is={makeGrid(steps.minor, "#333333", 0.1)} />
  <!-- Major lines: bolder, every 10 units -->
  <T is={makeGrid(steps.major, "#000000", 0.3)} />
{/key}
