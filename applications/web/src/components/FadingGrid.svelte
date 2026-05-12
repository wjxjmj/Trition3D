<script lang="ts">
  import {T} from "@threlte/core"
  import {GridHelper} from "three"

  // Static dual-layer grid in XY plane (Z-up).
  // GridHelper draws in XZ plane (Three.js default, Y-up).
  // Camera uses Z-up (up=[0,0,1]), so XZ=vertical. XY=horizontal ground.
  // Rotate -PI/2 around X to lay grid flat in XY (the CAD ground plane).
  const size = 400

  // Coarse grid: 100-unit cells
  const coarse = new GridHelper(size, 4, "#888888", "#888888")
  coarse.rotation.x = -Math.PI / 2
  // Fine grid: 10-unit cells
  const fine = new GridHelper(size, 40, "#bbbbbb", "#cccccc")
  fine.rotation.x = -Math.PI / 2

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
