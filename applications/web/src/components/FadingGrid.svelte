<script lang="ts">
  import {T, useThrelte, useTask} from "@threlte/core"
  import {GridHelper} from "three"

  const {camera} = useThrelte()

  // Three.js mutates camera.zoom imperatively — Svelte can't track it.
  // useTask polls zoom each frame, stores in $state for $derived to react.
  let zoom = $state(5) // default zoom matches OrthographicCamera

  useTask(() => {
    zoom = camera.current.zoom
  })

  const steps = $derived.by(() => {
    const unitPower = Math.floor(Math.log10(zoom))
    const major = Math.pow(10, -unitPower + 2)
    const minor = major / 10
    return {major, minor}
  })

  function makeGrid(cellSize: number, color: string, opacity: number): GridHelper {
    const size = 800
    const divs = Math.round(size / cellSize)
    const grid = new GridHelper(size, Math.max(1, divs), color, color)
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

{#key steps.major}
  <T is={makeGrid(steps.major, "#333333", 0.4)} />
  <T is={makeGrid(steps.minor, "#999999", 0.15)} />
{/key}
