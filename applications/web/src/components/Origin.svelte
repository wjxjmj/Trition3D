<script lang="ts">
  import {T} from "@threlte/core"
  import {interactivity} from "@threlte/extras"
  interactivity()

  const size = 20
  const opacity = 0.15
</script>

<T.Group>
  <!-- X axis (red) -->
  <T.Mesh position={[size / 2, 0, 0]}>
    <T.BoxGeometry args={[size, 0.2, 0.2]} />
    <T.MeshBasicMaterial color="#ff3b30" />
  </T.Mesh>
  <!-- Y axis (green) -->
  <T.Mesh position={[0, size / 2, 0]}>
    <T.BoxGeometry args={[0.2, size, 0.2]} />
    <T.MeshBasicMaterial color="#4cd964" />
  </T.Mesh>
  <!-- Z axis (blue) -->
  <T.Mesh position={[0, 0, size / 2]}>
    <T.BoxGeometry args={[0.2, 0.2, size]} />
    <T.MeshBasicMaterial color="#007aff" />
  </T.Mesh>

  <!-- XY plane -->
  <T.Mesh rotation.x={Math.PI / 2} position={[size / 2, size / 2, 0]}>
    <T.PlaneGeometry args={[size, size]} />
    <T.MeshBasicMaterial color="#ff3b30" transparent {opacity} side={2} />
  </T.Mesh>
  <!-- XZ plane -->
  <T.Mesh position={[size / 2, 0, size / 2]}>
    <T.PlaneGeometry args={[size, size]} />
    <T.MeshBasicMaterial color="#4cd964" transparent {opacity} side={2} />
  </T.Mesh>
  <!-- YZ plane -->
  <T.Mesh rotation.y={Math.PI / 2} position={[0, size / 2, size / 2]}>
    <T.PlaneGeometry args={[size, size]} />
    <T.MeshBasicMaterial color="#007aff" transparent {opacity} side={2} />
  </T.Mesh>

  <!-- Origin sphere -->
  <T.Mesh>
    <T.SphereGeometry args={[0.5]} />
    <T.MeshBasicMaterial color="white" />
  </T.Mesh>
</T.Group>
