<script lang="ts">
  import {T} from "@threlte/core"
  import {GridHelper} from "three"

  // Static dual-layer grid in XY plane (Z-up).
  // GridHelper draws in XZ plane by default (Three.js Y-up convention).
  // With Z-up camera, XY is ground — no rotation needed.
  const size = 400

  // Coarse grid: 100-unit cells
  const coarse = new GridHelper(size, 4, "#888888", "#888888")
  // Fine grid: 10-unit cells
  const fine = new GridHelper(size, 40, "#bbbbbb", "#cccccc")

  // Set line opacity via the child Line materials
  coarse.children.forEach((c: any) => {
    c.material.transparent = true; c.material.opacity = 0.35; c.material.depthTest = false
  })
  fine.children.forEach((c: any) => {
    c.material.transparent = true; c.material.opacity = 0.18; c.material.depthTest = false
  })
</script>

<T is={coarse} />
<T is={fine} />
