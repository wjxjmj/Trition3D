<script lang="ts">
  import {T, useThrelte, useTask} from "@threlte/core"
  import {GridHelper} from "three"

  const {camera} = useThrelte()

  let z = $state(5)
  useTask(() => { z = camera.current.zoom })

  const steps = $derived.by(() => {
    const unitPower = Math.floor(Math.log10(z))
    const minor = Math.pow(10, -unitPower + 1)
    const major = minor * 5
    return {major, minor}
  })

  // Fine grid: barely visible
  function fineGrid(cellSize: number) {
    const s = 800
    const g = new GridHelper(s, Math.round(s / cellSize), "#cccccc", "#cccccc")
    g.rotation.x = -Math.PI / 2
    g.children.forEach((c: any) => {
      c.material.transparent = true; c.material.opacity = 0.04
      c.material.depthTest = false; c.material.depthWrite = false
    })
    return g
  }

  // Coarse grid: bold, every 10 cells
  function coarseGrid(cellSize: number) {
    const s = 800
    const g = new GridHelper(s, Math.round(s / cellSize), "#111111", "#111111")
    g.rotation.x = -Math.PI / 2
    g.children.forEach((c: any) => {
      c.material.transparent = true; c.material.opacity = 0.45
      c.material.depthTest = false; c.material.depthWrite = false
    })
    return g
  }
</script>

{#key steps.minor}
  <T is={fineGrid(steps.minor)} />
  <T is={coarseGrid(steps.major)} />
{/key}
