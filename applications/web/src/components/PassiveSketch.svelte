<script lang="ts">
  import {store} from "shared/stores.svelte"
  import {Matrix4, Euler, MeshStandardMaterial, Vector2, Vector3, type Vector3Like} from "three"
  import {T, useThrelte} from "@threlte/core"
  import {Text, Suspense} from "@threlte/extras"
  import {LineGeometry} from "three/addons/lines/LineGeometry.js"
  import NewLineTool from "./tools/NewLine.svelte"
  import NewCircleTool from "./tools/NewCircle.svelte"
  import NewRectangleTool from "./tools/NewRectangle.svelte"
  import SelectTool from "./tools/Select.svelte"
  import type {ArcTuple, CircleTuple, FaceTuple, IDictionary, LineTuple, PlaneData, PreviewGeometry, SketchPoint, PointById, SketchRealized} from "shared/types"
  import debounce from "just-debounce-it"

  const log = (function () { const context = "[PassiveSketch.svelte]"; const color="gray"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`)})() // prettier-ignore

  let { name, sketch, plane, uniqueId, editing = false, dashedLineMaterial, dashedHoveredMaterial, solidLineMaterial, solidHoveredMaterial, solidSelectedMaterial, collisionLineMaterial }: {
    name: string
    sketch: SketchRealized
    plane: PlaneData["data"]["plane"]
    uniqueId: string
    editing?: boolean
    dashedLineMaterial: LineMaterial
    dashedHoveredMaterial: LineMaterial
    solidLineMaterial: LineMaterial
    solidHoveredMaterial: LineMaterial
    solidSelectedMaterial: LineMaterial
    collisionLineMaterial: LineMaterial
  } = $props()

  // log("[props]", "name:", name, "sketch:", sketch, "plane:", plane, "uniqueId:", uniqueId, "editing:", editing )

  const {size, dpr} = useThrelte()

  let newLineTool: NewLineTool, newCircleTool: NewCircleTool, newRectangleTool: NewRectangleTool, selectTool: SelectTool

  let pointTuples: PointById[] = $derived.by(() => {
    const result: PointById[] = []
    for (const id of Object.keys(sketch.points)) {
      const point3D = sketch.points[id]
      const point2D = sketch.points_2d[id]
      result.push({id, twoD: point2D, threeD: point3D})
    }
    return result
  })

  let pointsById: IDictionary<SketchPoint> = $derived.by(() => {
    const result: IDictionary<SketchPoint> = {}
    for (const id of Object.keys(sketch.points)) {
      const point3D = sketch.points[id]
      const point2D = sketch.points_2d[id]
      result[id] = {twoD: point2D, threeD: point3D}
    }
    return result
  })

  let lineTuples: LineTuple[] = $derived.by(() => {
    const result: LineTuple[] = []
    for (const id of Object.keys(sketch.line_segments)) {
      const line = sketch.line_segments[id]
      const start = pointsById[line.start]
      const end = pointsById[line.end]
      result.push({id, start, end})
    }
    return result
  })

  let circleTuples: CircleTuple[] = $derived.by(() => {
    const result: CircleTuple[] = []
    for (const id of Object.keys(sketch.circles)) {
      const circle = sketch.circles[id]
      const center = pointsById[circle.center]
      const radius = circle.radius
      result.push({id, center, radius})
    }
    return result
  })

  let arcTuples: ArcTuple[] = $derived.by(() => {
    const result: ArcTuple[] = []
    for (const id of Object.keys(sketch.arcs)) {
      const arc = sketch.arcs[id]
      const center = pointsById[arc.center]
      const start = pointsById[arc.start]
      const end = pointsById[arc.end]
      result.push({id, center, start, end})
    }
    return result
  })

  let faceTuples: FaceTuple[] = $derived.by(() => {
    const result: FaceTuple[] = []
    for (const id of Object.keys(sketch.faces)) {
      const face = sketch.faces[id]
      result.push({id, face})
    }
    return result
  })

  // $: pointTuples, log("[pointTuples]", pointTuples)
  // $: lineTuples, log("[lineTuples]", lineTuples)
  // $: circleTuples, log("[circleTuples]", circleTuples)
  // $: arcTuples, log("[arcTuples]", arcTuples)
  // $: faceTuples, log("[faceTuples]", faceTuples)
  // $: pointsById, log("[pointsById]", pointsById)

  // Build some Three.js vectors from the props
  const origin_point = new Vector3(plane.origin.x, plane.origin.y, plane.origin.z)
  const primary = new Vector3(plane.primary.x, plane.primary.y, plane.primary.z)
  const secondary = new Vector3(plane.secondary.x, plane.secondary.y, plane.secondary.z)
  const tertiary = new Vector3(plane.tertiary.x, plane.tertiary.y, plane.tertiary.z)

  // Use those to make the rotation matrix and euler angles
  const rotationMatrix = new Matrix4()
  rotationMatrix.makeBasis(primary, secondary, tertiary)
  const eulerAngles = new Euler(0, 0, 0, "XYZ")
  eulerAngles.setFromRotationMatrix(rotationMatrix, "XYZ")

  // Lastly, make the Plane Material
  const planeMaterial = new MeshStandardMaterial({
    color: "#525292",
    metalness: 0.0,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
    depthTest: false,
    wireframe: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
  })

  const width = 200.0
  const height = 150.0

  // this is x, y, z for each of five points, making a closed square
  const points = [-width / 2, -height / 2, 0, width / 2, -height / 2, 0, width / 2, height / 2, 0, -width / 2, height / 2, 0, -width / 2, -height / 2, 0]

  let boundaryMaterial = $derived(new LineMaterial({
    color: "#42a7eb",
    linewidth: 1.0 * $dpr,
    depthTest: true,
    transparent: true,
    dashed: false,
    resolution: new Vector2($size.width * $dpr, $size.height * $dpr),
  }))

  const lineGeometry = new LineGeometry()
  lineGeometry.setPositions(points)

  let hidden = $derived(store.hiddenSketches.includes(uniqueId) && !editing)
  // $: store.hiddenSketches, log("[store.hiddenSketches]", store.hiddenSketches)

  $effect(() => {
    if (editing) store.sketchTool = "select"
  })

  function projectToPlane(point3D: Vector3): Vector2 {
    const xComponent = point3D.clone().sub(plane.origin).dot(primary)
    const yComponent = point3D.clone().sub(plane.origin).dot(secondary)
    return new Vector2(xComponent, yComponent)
  }

  function isGeomType(geom: PreviewGeometry, type: string) {
    // log("[isGeomType]", type, geom)
    return geom.type === type
  }
</script>

{#if !hidden}
  <T.Group
    rotation.x={eulerAngles.x}
    rotation.y={eulerAngles.y}
    rotation.z={eulerAngles.z}
    position.x={origin_point.x}
    position.y={origin_point.y}
    position.z={origin_point.z}
  >
    <T.Mesh
      material={planeMaterial}
      onclick={e => {
        if (editing) {
          if (store.sketchTool === "line") {
            newLineTool.click(e, {twoD: projectToPlane(e.point), threeD: e.point})
          } else if (store.sketchTool === "circle") {
            newCircleTool.click(e, {twoD: projectToPlane(e.point), threeD: e.point})
          } else if (store.sketchTool === "rectangle") {
            newRectangleTool.click(e, {twoD: projectToPlane(e.point), threeD: e.point})
          } else if (store.sketchTool === "select") {
            selectTool.click(e, projectToPlane(e.point))
          }
        }
      }}
      onpointermove={debounce(e => {
        if (editing) {
          if (store.sketchTool === "line") {
            newLineTool.mouseMove(e, projectToPlane(e.point))
          } else if (store.sketchTool === "circle") {
            newCircleTool.mouseMove(e, projectToPlane(e.point))
          } else if (store.sketchTool === "rectangle") {
            newRectangleTool.mouseMove(e, projectToPlane(e.point))
          }
        }
      }, 10)}
    >
      <T.PlaneGeometry args={[width * 100, height * 100]} />
    </T.Mesh>

    <SelectTool bind:this={selectTool} sketchIndex={uniqueId} active={store.sketchTool === "select"} />
    <NewLineTool bind:this={newLineTool} {pointsById} sketchIndex={uniqueId} active={store.sketchTool === "line"} {projectToPlane} />
    <NewCircleTool bind:this={newCircleTool} {pointsById} sketchIndex={uniqueId} active={store.sketchTool === "circle"} {projectToPlane} />
    <NewRectangleTool bind:this={newRectangleTool} {pointsById} sketchIndex={uniqueId} active={store.sketchTool === "rectangle"} {projectToPlane} />

    <T.Line2
      geometry={lineGeometry}
      material={boundaryMaterial}
      oncreate={({ref}) => {
        ref?.computeLineDistances()
      }}
    />

    <T.Group position.x={(-width / 2) * 0.99} position.y={(height / 2) * 0.99}>
      <Suspense>
        <Text text={name} color="#42a7eb" fontSize={5} anchorX="0%" anchorY="0%" />
      </Suspense>
    </T.Group>

    {#each circleTuples as circle (circle.id)}
      <Circle
        center={circle.center}
        radius={circle.radius}
        id={circle.id}
        {solidLineMaterial}
        {solidHoveredMaterial}
        {solidSelectedMaterial}
        {dashedHoveredMaterial}
        {dashedLineMaterial}
        {collisionLineMaterial}
      />
    {/each}

    {#each arcTuples as arc (arc.id)}
      <Arc
        center={arc.center}
        start={arc.start}
        end={arc.end}
        id={arc.id}
        {solidLineMaterial}
        {solidHoveredMaterial}
        {solidSelectedMaterial}
        {dashedHoveredMaterial}
        {dashedLineMaterial}
        {collisionLineMaterial}
      />
    {/each}

    {#each lineTuples as line (line.id)}
      <Line
        start={line.start}
        end={line.end}
        id={line.id}
        {solidLineMaterial}
        {solidHoveredMaterial}
        {solidSelectedMaterial}
        {dashedHoveredMaterial}
        {dashedLineMaterial}
        {collisionLineMaterial}
      />
    {/each}

    {#each store.previewGeometry as geom (geom.uuid)}
      {#if isGeomType(geom, "line")}
        <Line
          start={geom.start}
          end={geom.end}
          id={geom.uuid}
          {solidLineMaterial}
          {solidHoveredMaterial}
          {solidSelectedMaterial}
          {dashedHoveredMaterial}
          {dashedLineMaterial}
          {collisionLineMaterial}
        />
      {:else if isGeomType(geom, "circle")}
        <Circle
          center={geom.center}
          radius={geom.radius}
          id={geom.uuid}
          {solidLineMaterial}
          {solidHoveredMaterial}
          {solidSelectedMaterial}
          {dashedHoveredMaterial}
          {dashedLineMaterial}
          {collisionLineMaterial}
        />
      {:else if isGeomType(geom, "point")}
        <Point2D x={geom.x} y={geom.y} hidden={false} id={geom.uuid} isPreview {collisionLineMaterial} />
      {/if}
    {/each}

    {#each pointTuples as { id, twoD, threeD } (id)}
      <Point2D x={twoD.x} y={twoD.y} hidden={threeD.hidden} {id} {collisionLineMaterial} />
    {/each}

    {#each faceTuples as face (`${faceTuples.length}-${face.id}`)}
      <Face face={face.face} id={face.id} {pointsById} />
    {/each}
  </T.Group>
{/if}
