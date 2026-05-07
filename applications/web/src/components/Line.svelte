<script lang="ts">
  import {store} from "shared/stores.svelte"
  import {LineGeometry} from "three/addons/lines/LineGeometry.js"
  import type {LineMaterial} from "three/examples/jsm/lines/LineMaterial.js"
  import {Vector2} from "three"
  import {T} from "@threlte/core"
  import {flatten, promoteTo3} from "shared/projectUtils"
  import {isEntity} from "shared/typeGuards"

  const log = (function () { const context = "[Line.svelte]"; const color="gray"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`)})() // prettier-ignore

  let { id, start, end, dashedLineMaterial, dashedHoveredMaterial, solidLineMaterial, solidHoveredMaterial, solidSelectedMaterial, collisionLineMaterial }: {
    id: string
    start: PointById
    end: PointById
    dashedLineMaterial: LineMaterial
    dashedHoveredMaterial: LineMaterial
    solidLineMaterial: LineMaterial
    solidHoveredMaterial: LineMaterial
    solidSelectedMaterial: LineMaterial
    collisionLineMaterial: LineMaterial
  } = $props()

  const type: EntityType = "line"

  let hovered = $state(false)
  let selected = $derived(store.currentlySelected.some(e => checkIsEntity(e) && e.id === id && e.type === type) ? true : false)

  function checkIsEntity(e: unknown) {
    // log("[checkIsEntity]", isEntity(e), e)
    return isEntity(e)
  }

  // $: selected, log("[selected] an entity has been selected:", selected, "Line.id:", id)
  // prettier-ignore
  // $: store.currentlySelected, ()=> {if (selected && !store.currentlySelected.every((e) => isEntity(e))) log("ERROR [store.currentlySelected] are not all isEntity", store.currentlySelected)}

  const points = flatten(
		promoteTo3([new Vector2(start.twoD.x, start.twoD.y), new Vector2(end.twoD.x, end.twoD.y)])
	)

  const lineGeometry = new LineGeometry()
  lineGeometry.setPositions(points)
</script>

<T.Group>
  <T.Line2
    geometry={lineGeometry}
    material={hovered ? dashedHoveredMaterial : dashedLineMaterial}
    oncreate={({ref}) => {
      ref?.computeLineDistances()
    }}
  />
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
        store.currentlyMousedOver = [...store.currentlyMousedOver, {type, id: id}]
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
