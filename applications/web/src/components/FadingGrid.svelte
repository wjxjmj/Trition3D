<script lang="ts">
  import {T, useThrelte, useTask} from "@threlte/core"
  import {GridHelper} from "three"

  const {camera} = useThrelte()

  let z = $state(5)
  useTask(() => { z = camera.current.zoom })

  const steps = $derived.by(() => {
    const unitPower = Math.floor(Math.log10(z))
    const minor = Math.pow(10, -unitPower + 1)
    const major = minor * 10
    return {major, minor}
  })

  // Fine grid: barely-there background lattice
  function fineGrid(cellSize: number) {
    const s = 800
    const g = new GridHelper(s, Math.round(s / cellSize), "#bbbbbb", "#bbbbbb")
    g.rotation.x = -Math.PI / 2
    g.children.forEach((c: any) => {
      c.material.transparent = true; c.material.opacity = 0.06
      c.material.depthTest = false; c.material.depthWrite = false
    })
    return g
  }

  // Coarse grid: darker, every 10 cells — dominates visually
  function coarseGrid(cellSize: number) {
    const s = 800
    const g = new GridHelper(s, Math.round(s / cellSize), "#444444", "#444444")
    g.rotation.x = -Math.PI / 2
    g.children.forEach((c: any) => {
      c.material.transparent = true; c.material.opacity = 0.3
      c.material.depthTest = false; c.material.depthWrite = false
    })
    return g
  }
</script>

{#key steps.minor}
  <T is={fineGrid(steps.minor)} />
  <T is={coarseGrid(steps.major)} />
{/key}
