<script lang="ts">
  import {store} from "shared/stores.svelte"
  import {LineGeometry} from "three/addons/lines/LineGeometry.js"
  import type {LineMaterial} from "three/examples/jsm/lines/LineMaterial.js"
  import {useTexture} from "@threlte/extras"
  import {BufferGeometry, Float32BufferAttribute, Vector2} from "three"
  import {T} from "@threlte/core"
  import {flatten, promoteTo3} from "shared/projectUtils"
  import type {EntityType} from "shared/types"
  import {base} from "../base"

  let { x, y, z, hidden, id, isPreview = false, collisionLineMaterial }: {
    x: number
    y: number
    z: number
    hidden: boolean
    id: string
    isPreview?: boolean
    collisionLineMaterial: LineMaterial
  } = $props()

  const source = `${base}/actions/point_min.svg`
  const outlineSource = `${base}/actions/point_outline.svg`

  const pointTexture = useTexture(source)
  const outlineTexture = useTexture(outlineSource)

  const type: EntityType = "point3D"

  let hovered = $state(false)
  let selected = $derived(store.currentlySelected.some(e => e.id === id && e.type === type) ? true : false)

  const delta = 0.0001
  const pointsH = flatten(promoteTo3([new Vector2(x - delta, y), new Vector2(x + delta, y)]))
  const pointsV = flatten(promoteTo3([new Vector2(x, y - delta), new Vector2(x, y + delta)]))

  const lineGeometryH = new LineGeometry()
  lineGeometryH.setPositions(pointsH)
  const lineGeometryV = new LineGeometry()
  lineGeometryV.setPositions(pointsV)

  const geom = new BufferGeometry()
  const vertices = new Float32Array([x, y, z])
  geom.setAttribute("position", new Float32BufferAttribute(vertices, 3))

  const validTools = ["select", "line", "circle", "rectangle"]
</script>

{#if !hidden}
  {#await pointTexture then pointImg}
    {#await outlineTexture then outlineImg}
      <T.Group
        onpointerover={() => {
          if (isPreview) return
          if (validTools.includes(store.sketchTool)) {
            hovered = true
            store.currentlyMousedOver = [...store.currentlyMousedOver, {type, id, x, y, z}]
          }
        }}
        onpointerout={() => {
          if (isPreview) return
          if (validTools.includes(store.sketchTool)) {
            hovered = false
            store.currentlyMousedOver = store.currentlyMousedOver.filter(item => !(item.id === id && item.type === type))
          }
        }}
      >
        <T.Line2
          geometry={lineGeometryH}
          material={collisionLineMaterial}
          oncreate={({ref}) => {
            ref?.computeLineDistances()
          }}
        />

        <T.Line2
          geometry={lineGeometryV}
          material={collisionLineMaterial}
          oncreate={({ref}) => {
            ref?.computeLineDistances()
          }}
        />
      </T.Group>
      <T.Points geometry={geom}>
        <T.PointsMaterial size={12} map={pointImg} renderOrder={-10} transparent={true} sizeAttenuation={false} depthTest={false} depthWrite={false} />
      </T.Points>
      {#if hovered || selected}
        <T.Points geometry={geom}>
          <T.PointsMaterial size={18} map={outlineImg} renderOrder={-10} transparent={true} sizeAttenuation={false} depthTest={false} depthWrite={false} />
        </T.Points>
      {/if}
    {/await}
  {/await}
{/if}
