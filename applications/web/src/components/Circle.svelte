<script lang="ts">
  import {store} from "shared/stores.svelte"
  import {LineGeometry} from "three/addons/lines/LineGeometry.js"
  import {LineMaterial} from "three/addons/lines/LineMaterial.js"
  import {T} from "@threlte/core"
  import {flatten, circleToPoints, promoteTo3} from "shared/projectUtils"

  const log = (function () { const context = "[Circle.svelte]"; const color="gray"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`)})() // prettier-ignore

  const type: EntityType = "circle"

  let { id, center, radius, dashedLineMaterial, dashedHoveredMaterial, solidLineMaterial, solidHoveredMaterial, solidSelectedMaterial, collisionLineMaterial }: {
    id: string
    center: CircleTuple["center"]
    radius: number
    dashedLineMaterial: LineMaterial
    dashedHoveredMaterial: LineMaterial
    solidLineMaterial: LineMaterial
    solidHoveredMaterial: LineMaterial
    solidSelectedMaterial: LineMaterial
    collisionLineMaterial: LineMaterial
  } = $props()

  let hovered = $state(false)
  let selected = $derived(store.currentlySelected.some(e => e.id === id && e.type === type) ? true : false)

  // array of x,y,z points
  const points = flatten(promoteTo3(circleToPoints(center.twoD, radius)))

  const lineGeometry = new LineGeometry()
  lineGeometry.setPositions(points)
</script>

<T.Group>
  <T.Line2 geometry={lineGeometry} material={hovered ? dashedHoveredMaterial : dashedLineMaterial} oncreate={({ref}) => ref?.computeLineDistances()} />
  <T.Line2
    geometry={lineGeometry}
    material={hovered ? solidHoveredMaterial : selected ? solidSelectedMaterial : solidLineMaterial}
    oncreate={({ref}) => {
      ref?.computeLineDistances()
    }}
  />
  <T.Line2
    geometry={lineGeometry}
    material={collisionLineMaterial}
    oncreate={({ref}) => {
      ref?.computeLineDistances()
    }}
    onpointerover={() => {
      if (store.sketchTool === "select") {
        hovered = true
        store.currentlyMousedOver = [...store.currentlyMousedOver, {type, id}]
        // log("store.currentlyMousedOver", store.currentlyMousedOver)
      }
    }}
    onpointerout={() => {
      if (store.sketchTool === "select") {
        hovered = false
        store.currentlyMousedOver = store.currentlyMousedOver.filter(item => !(item.id === id && item.type === type))
      }
    }}
  />
</T.Group>
