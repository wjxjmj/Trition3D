<script lang="ts">
  import {store} from "shared/stores.svelte"
  import FloatingPanel from "../FloatingPanel.svelte"
  import {X} from "lucide-static"
  import {renameStep, setSketchPlane} from "shared/projectUtils"
  import {tr} from "shared/i18n.svelte"
  import {base} from "../../base"

  const log = (function () { const context = "[SketchFeature.svelte]"; const color="gray"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`)})() // prettier-ignore

  let { name, index, id, plane_id }: { name: string; index: number; id: string; plane_id: string } = $props()

  const source = `${base}/actions/sketch_min.svg`
  let open = $derived(store.featureIndex === index)

  let surface: Entity | null = $state(null)
  let selectingForSketchPlane = $state(false)

  $effect(() => {
    if (plane_id !== "") {
      surface = {type: "plane", id: plane_id}
    } else {
      surface = null
      engageSearchForPlane()
    }
  })

  const closeAndRefresh = () => {
    store.featureIndex = 1000
    store.sketchBeingEdited = ""
    store.sketchTool = ""
    store.selectingFor = []
    store.selectionMax = 1000
    store.selectionMin = 0
    store.currentlySelected = []
  }

  $effect(() => { if (store.featureIndex === index) store.sketchBeingEdited = id })

  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && store.featureIndex === index) {
      closeAndRefresh()
    }
  }

  const engageSearchForPlane = () => {
    store.sketchTool = ""
    store.selectingFor = ["plane", "meshFace"]
    store.selectionMax = 1
    store.selectionMin = 1
    if (surface !== null) store.currentlySelected = [surface]
    selectingForSketchPlane = true
  }

  const disengageSearchForPlane = () => {
    store.currentlySelected = []
    store.selectingFor = []
    store.selectionMax = 1000
    store.selectionMin = 0
    selectingForSketchPlane = false
    store.sketchTool = "select"
    store.currentlyMousedOver = []
  }

  $effect(() => {
    const cs = store.currentlySelected
    if (!selectingForSketchPlane) return
    if (!id) return
    if (!cs.length) return
    let thingSelected = cs[0]
    if (thingSelected.type === "plane") {
      setSketchPlane(id, thingSelected.id)
    }
    disengageSearchForPlane()
  })
</script>

<div
  class="feature-pill"
  role="button"
  tabindex="0"
  ondblclick={() => {
    // Always open the panel when sketch tool is active (don't toggle)
    store.featureIndex = index
    store.sketchTool = "select"
  }}
>
  <img class="h-6 w-6" src={source} alt={name} title={name} />
</div>

<FloatingPanel show={open} title={tr().sketch} onclose={closeAndRefresh}>
  {#snippet children()}
    <form
      onsubmit={(e) => { e.preventDefault(); closeAndRefresh() }}
      class="flex flex-col space-y-2"
      autocomplete="off"
    >
      <label class="text-xs opacity-70">
        {tr().name}
        <input
          autocomplete="off"
          data-1p-ignore
          class="shadow appearance-none border w-full py-1.5 px-2 text-sm text-gray-700 leading-tight focus:border focus:border-sky-500 rounded"
          bind:value={name}
        />
      </label>
      <label class="text-xs opacity-70">
        {tr().surface}
      </label>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <div tabindex="0" class="bg-gray-50 rounded flex shadow border focus:ring focus:border-blue-500 min-h-8 flex-wrap"
        onfocusin={engageSearchForPlane} onfocusout={disengageSearchForPlane}>
        <div class="h-8"></div>
        {#if surface !== null}
          <div class="bg-sky-200 pl-2 py-0.5 m-1 rounded text-sm">
            {surface.type}:{surface.id}<button
              onclick={(e) => { e.preventDefault(); surface = null }}
            ><span class="h-[16px] w-[16px] block">{@html X}</span></button>
          </div>
        {/if}
      </div>
      <div class="flex space-x-1.5">
        <button
          class="flex-grow bg-sky-500 hover:bg-sky-700 text-white font-bold py-1.5 px-1 shadow rounded text-sm"
          onclick={() => renameStep(index, name)}
        >{tr().done}</button>
        <button class="bg-transparent hover:bg-sky-700 text-sky-500 font-semibold hover:text-white py-1.5 px-4 border border-sky-500 hover:border-transparent rounded text-sm"
        >{tr().cancel}</button>
      </div>
    </form>
  {/snippet}
</FloatingPanel>

{#if open}
  <svelte:window onkeydown={onKeydown} />
{/if}
