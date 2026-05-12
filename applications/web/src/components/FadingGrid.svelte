<script lang="ts">
  import {T, useThrelte, useTask} from "@threlte/core"
  import {GridHelper} from "three"

  const {camera} = useThrelte()

  // Adaptive grid: switch cell size based on zoom level
  let cellSize: number
  let coarseSize: number

  function updateGrid() {
    const z = camera.current.zoom
    if (z < 2)       { cellSize = 100; coarseSize = 1000 }
    else if (z < 5)  { cellSize = 50;  coarseSize = 500 }
    else if (z < 12) { cellSize = 10;  coarseSize = 100 }
    else             { cellSize = 1;   coarseSize = 10 }
  }

  // Check zoom every frame and rebuild grid when threshold crossed
  let prevLevel = 0
  function gridLevel(z: number) {
    if (z < 2) return 0
    if (z < 5) return 1
    if (z < 12) return 2
    return 3
  }

  updateGrid()
  createGrids()

  let fineGrid: GridHelper
  let coarseGrid: GridHelper

  function createGrids() {
    const size = 400
    const divs = Math.floor(size / cellSize)

    fineGrid?.dispose?.()
    coarseGrid?.dispose?.()

    fineGrid = new GridHelper(size, divs, "#bbbbbb", "#cccccc")
    fineGrid.renderOrder = 998
    // @ts-ignore
    fineGrid.material.transparent = true
    // @ts-ignore
    fineGrid.material.opacity = 0.18
    // @ts-ignore
    fineGrid.material.depthWrite = false
    // @ts-ignore
    fineGrid.material.depthTest = false

    const coarseDivs = Math.floor(size / coarseSize)
    coarseGrid = new GridHelper(size, coarseDivs, "#888888", "#888888")
    coarseGrid.renderOrder = 997
    // @ts-ignore
    coarseGrid.material.transparent = true
    // @ts-ignore
    coarseGrid.material.opacity = 0.35
    // @ts-ignore
    coarseGrid.material.depthWrite = false
    // @ts-ignore
    coarseGrid.material.depthTest = false
  }

  // Rebuild grid when zoom crosses thresholds
  useTask(() => {
    const level = gridLevel(camera.current.zoom)
    if (level !== prevLevel) {
      prevLevel = level
      updateGrid()
      createGrids()
    }
  })
</script>

<T is={coarseGrid} />
<T is={fineGrid} />
