<script lang="ts">
  import {store} from "shared/stores.svelte"
  import {T, useThrelte} from "@threlte/core"
  import {Environment} from "@threlte/extras"
  import {Vector2, Vector3, type Vector3Like} from "three"
  import {interactivity} from "@threlte/extras"
  import {LineMaterial} from "three/addons/lines/LineMaterial.js"
  import CadControls from "./controls/CadControls/CadControls.svelte"
  import Point3D from "./Point3D.svelte"
  import Plane from "./Plane.svelte"
  import Solid from "./Solid.svelte"
  import Sketch from "./Sketch.svelte"
  import CubeGizmo from "./controls/CubeGizmo/CubeGizmo.svelte"
  import Origin from "./Origin.svelte"
  import FadingGrid from "./FadingGrid.svelte"
  import {base} from "../base"

  const log = (function () { const context = "[Scene.svelte]"; const color="gray"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`)})() // prettier-ignore

  interactivity()

  const {size, dpr, camera, renderer} = useThrelte()

  // Fusion 360 warm light background
  $effect(() => {
    renderer.setClearColor("#f5f5f5", 1)
  })

  let points = $derived(store.realization.points ? Object.entries(store.realization.points) : [])
  let planes = $derived(store.realization.planes ? Object.entries(store.realization.planes) : [])
  let planesById = $derived(planes ? Object.fromEntries(planes) : {})
  let solids = $derived(store.realization.solids ? Object.entries(store.realization.solids) : [])
  let sketches = $derived(store.realization.sketches ? Object.entries(store.realization.sketches) : [])

  // Hide default base planes from 3D view (they show in browser tree on hover)
  const basePlaneNames = new Set(["Front", "Top", "Right"])
  let visiblePlanes = $derived(planes.filter(([_, p]) => !basePlaneNames.has(p.name)))

  export function setCameraFocus(goTo: Vector3Like, lookAt: Vector3Like, up: Vector3Like): void {
    const positionMultiple = 1000
    const vector = new Vector3(goTo.x, goTo.y, goTo.z)
    vector.multiplyScalar(positionMultiple)
    const look = new Vector3(lookAt.x, lookAt.y, lookAt.z)
    const lookup = new Vector3(up.x, up.y, up.z)
    camera.current.position.set(vector.x, vector.y, vector.z)
    camera.current.lookAt(look.x, look.y, look.z)
    camera.current.up = lookup
  }

  let dashedLineMaterial = $derived(new LineMaterial({
    color: "#000000",
    linewidth: 1.0 * $dpr,
    depthTest: false,
    transparent: true,
    dashed: true,
    dashSize: 2,
    gapSize: 2,
    dashScale: 1,
    resolution: new Vector2($size.width * $dpr, $size.height * $dpr),
  }))

  let dashedHoveredMaterial = $derived(new LineMaterial({
    color: "#ffaa00",
    linewidth: 1.0 * $dpr,
    depthTest: false,
    transparent: true,
    dashed: true,
    dashSize: 2,
    gapSize: 2,
    dashScale: 1,
    resolution: new Vector2($size.width * $dpr, $size.height * $dpr),
  }))

  let solidLineMaterial = $derived(new LineMaterial({
    color: "#000000",
    linewidth: 1.5 * $dpr,
    depthTest: true,
    transparent: true,
    dashed: false,
    resolution: new Vector2($size.width * $dpr, $size.height * $dpr),
  }))

  let solidHoveredMaterial = $derived(new LineMaterial({
    color: "#88aa00",
    linewidth: 5.5 * $dpr,
    depthTest: true,
    transparent: true,
    dashed: false,
    resolution: new Vector2($size.width * $dpr, $size.height * $dpr),
  }))

  let solidSelectedMaterial = $derived(new LineMaterial({
    color: "#ffaa00",
    linewidth: 5.5 * $dpr,
    depthTest: true,
    transparent: true,
    dashed: false,
    resolution: new Vector2($size.width * $dpr, $size.height * $dpr),
  }))

  let collisionLineMaterial = $derived(new LineMaterial({
    color: "#FFFFFF",
    linewidth: 12.0 * $dpr,
    depthTest: false,
    depthWrite: false,
    transparent: true,
    opacity: 0,
    dashed: false,
    resolution: new Vector2($size.width * $dpr, $size.height * $dpr),
  }))
</script>

<T.OrthographicCamera makeDefault position={[160.8, -250.8, 200.55]} zoom={5} up={[0, 0, 1]}>
  <CadControls rotateSpeed={1.8} panSpeed={0.5} oncreate={({ref}) => {}} mouseButtons={{LEFT: 2, MIDDLE: 50, RIGHT: 1}} />
</T.OrthographicCamera>

<!-- Fusion 360 lighting: bright ambient + 45-degree key light -->
<T.AmbientLight intensity={1.0} />
<T.DirectionalLight position={[5, 8, 5]} intensity={0.6} />

<Environment path="{base}/envmap/hdr/" files="kloofendal_28d_misty_puresky_1k.hdr" isBackground={false} format="hdr" />

<!-- Infinite fading grid (custom shader) -->
<FadingGrid />

<!-- Contact shadow — subtle ground plane for grounding effect -->
<T.Mesh position={[0, 0, -0.03]} renderOrder={1000}>
  <T.PlaneGeometry args={[400, 400]} />
  <T.MeshBasicMaterial color="#000000" transparent opacity={0.06} depthWrite={false} depthTest={false} />
</T.Mesh>

<Origin />

{#each points as [pointName, point] (`${store.workbench.name}-${pointName}`)}
  <Point3D id={pointName} x={point.x} y={point.y} z={point.z} hidden={point.hidden} {collisionLineMaterial} />
{/each}

<!-- Only show user-created planes (hide Front/Top/Right base planes) -->
{#each visiblePlanes as [planeName, plane] (`${store.workbench.name}-${planeName}`)}
  <Plane
    name={plane.name}
    id={planeName}
    height={plane.height}
    width={plane.width}
    origin={plane.plane.origin}
    primary={plane.plane.primary}
    secondary={plane.plane.secondary}
    tertiary={plane.plane.tertiary}
  />
{/each}

{#each sketches as [sketchId, sketchTuple] (`${store.workbench.name}-${sketchId}`)}
  <Sketch
    uniqueId={sketchId}
    name={sketchTuple[2]}
    {sketchTuple}
    editing={store.sketchBeingEdited === sketchId}
    plane={planesById[sketchTuple[0].plane_id]}
    {solidLineMaterial}
    {solidHoveredMaterial}
    {solidSelectedMaterial}
    {dashedHoveredMaterial}
    {dashedLineMaterial}
    {collisionLineMaterial}
  />
{/each}

{#each solids as [solidName, solid] (`${store.workbench.name}-${solidName}-${solid.crc32}`)}
  {#if !store.hiddenSolids.includes(solidName)}
    <Solid
      name={solidName}
      indices={solid.indices}
      vertices={solid.vertices}
      normals={solid.normals}
      truckSolid={solid.truck_solid}
      {solidLineMaterial}
      {solidHoveredMaterial}
      {solidSelectedMaterial}
      {dashedHoveredMaterial}
      {dashedLineMaterial}
      {collisionLineMaterial}
    />
  {/if}
{/each}

<CubeGizmo verticalPlacement={"top"} size={140} paddingX={20} paddingY={20} {setCameraFocus} />
