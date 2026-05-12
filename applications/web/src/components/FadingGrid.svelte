<script lang="ts">
  import {T} from "@threlte/core"
  import {GridHelper} from "three"

  // Z-up coordinate system: ground plane is XY.
  // GridHelper creates lines in XZ, so we rotate by -PI/2 around X
  // to lay it flat in the XY plane (ground).
  const gridSize = 300
  const gridDivs = 60

  // Fine grid — very subtle
  const fineGrid = new GridHelper(gridSize, gridDivs, "#cccccc", "#dddddd")
  fineGrid.rotation.x = -Math.PI / 2
  fineGrid.renderOrder = 998

  // Coarse accent grid — slightly more visible
  const coarseDivs = 6
  const coarseGrid = new GridHelper(gridSize, coarseDivs, "#aaaaaa", "#aaaaaa")
  coarseGrid.rotation.x = -Math.PI / 2
  coarseGrid.renderOrder = 997
</script>

<T is={fineGrid} />
<T is={coarseGrid} />
