<script lang="ts">
  import {store} from "shared/stores.svelte"
  import {slide} from "svelte/transition"
  import {quintOut} from "svelte/easing"
  import {renameStep, setSketchPlane} from "shared/projectUtils"
  import {base} from "../../base"

  const log = (function () { const context = "[SketchFeature.svelte]"; const color="gray"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`)})() // prettier-ignore

  let { name, index, id, plane_id }: { name: string; index: number; id: string; plane_id: string } = $props()

  // $: name, log("[props] name:", name, "index:", index, "id:", id, "plane_id:", plane_id)

  const source = `${base}/actions/sketch_min.svg`

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

  // $: store.featureIndex, log("[store.featureIndex]", typeof store.featureIndex, store.featureIndex)

  const closeAndRefresh = () => {
    log("closing, refreshing")
    store.featureIndex = 1000
    store.sketchBeingEdited = ""
    store.sketchTool = ""
    store.selectingFor = []
    store.selectionMax = 1000
    store.selectionMin = 0
    store.currentlySelected = []
  }

  $effect(() => { if (store.featureIndex === index) store.sketchBeingEdited = id })

  // $: store.sketchBeingEdited,
  // 	log("[store.sketchBeingEdited]", `${store.sketchBeingEdited === "" ? "empty" : ""}`, store.sketchBeingEdited)

  const engageSearchForPlane = () => {
    // log("engage search!")
    store.sketchTool = ""
    store.selectingFor = ["plane", "meshFace"]
    store.selectionMax = 1
    store.selectionMin = 1

    if (surface !== null) {
      store.currentlySelected = [surface]
    }
    selectingForSketchPlane = true
    // log("search is engaged")
  }

  const disengageSearchForPlane = () => {
    // log("Disengage search!")
    store.currentlySelected = []
    store.selectingFor = []
    store.selectionMax = 1000
    store.selectionMin = 0
    selectingForSketchPlane = false
    store.sketchTool = "select"
    store.currentlyMousedOver = []
    // log("search is disengaged")
  }

  $effect(() => {
    const cs = store.currentlySelected
    if (!selectingForSketchPlane) return
    if (!id) return
    if (!cs.length) return
    // log("CS changed when selecting for Sketch Plane:", cs)

    let thingSelected = cs[0]
    if (thingSelected.type === "plane") {
      setSketchPlane(id, thingSelected.id)
    } else if (thingSelected.type === "meshFace") {
      log("HOW DO I HANDLE THIS?")
      log(thingSelected)
      // setSketchPlane(id, cs[0].id)
    }

    disengageSearchForPlane()
  })
</script>

<div
  class="flex items-center text-sm hover:bg-sky-200 dark:hover:bg-gray-600"
  role="button"
  tabindex="0"
  ondblclick={() => {
    if (store.featureIndex === index) {
      closeAndRefresh()
    } else {
      store.featureIndex = index
      store.sketchTool = "select"
    }
  }}
>
  {#if store.featureIndex < index}
    <img class="h-8 w-8 px-1 opacity-50" src={source} alt={name} />
    <span class="italic opacity-50">{name}</span>
  {:else}
    <img class="h-8 w-8 px-1" src={source} alt={name} />
    <span>{name}</span>
  {/if}

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="ml-auto mr-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-500 px-1 py-1 rounded"
    onclick={() => {
      if (store.hiddenSketches.includes(id)) {
        // cool, unhide
        store.hiddenSketches = store.hiddenSketches.filter(sketch => sketch !== id)
      } else {
        // cool, hide
        store.hiddenSketches = [...store.hiddenSketches, id]
      }
    }}
  >
    {#if store.hiddenSketches.includes(id)}
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M53.92,34.62A8,8,0,0,0,42.08,45.38L61.32,66.55C38.7,84.59,25.59,106.83,24,128c4.56,65.46,73.75,112,104,112,24.89,0,48.59-11.23,67.59-28.38l14.49,15.94a8,8,0,0,0,11.84-10.76ZM128,224c-35.15,0-85.57-40.62-88-96,1.43-25.63,15.06-50.19,35.48-70.27L100.1,84.47A40,40,0,0,0,68.37,160.53a8,8,0,1,0,12.52-10,24,24,0,1,1,31.1-31.1l10.47,11.52A40.18,40.18,0,0,0,172,171.42a8,8,0,0,0,13.55,8.5A56,56,0,0,1,128,224Z" /></svg>
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.58,27.65,38.41C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.35c18.83-18.83,27.3-37.62,27.65-38.41A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z" /></svg>
    {/if}
  </div>
</div>

{#if store.featureIndex === index}
  <div transition:slide={{delay: 0, duration: 400, easing: quintOut, axis: "y"}}>
    <form
      onsubmit={(e) => {
        e.preventDefault()
        // editing = false
        closeAndRefresh()
      }}
      class="px-3 py-2 bg-gray-100 dark:bg-gray-600 flex flex-col space-y-2"
      autocomplete="off"
    >
      <label>
        Name
        <input
          autocomplete="off"
          data-1p-ignore
          class="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:border focus:border-sky-500"
          bind:value={name}
        />
      </label>

      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      Surface
      <div
        tabindex="0"
        class="bg-gray-50 rounded flex shadow border focus:ring focus:border-blue-500 min-h-8 flex-wrap"
        onfocusin={engageSearchForPlane}
        onfocusout={disengageSearchForPlane}
      >
        <div class="h-8" />
        {#if surface !== null}
          <div class="bg-sky-200 pl-2 py-0.5 m-1 rounded text-sm">
            {surface.type}:{surface.id}<button
              onclick={(e) => {
                e.preventDefault()
                surface = null
              }}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" /></svg></button
            >
          </div>
        {/if}
      </div>

      <div class="flex space-x-1.5">
        <button
          class="flex-grow bg-sky-500 hover:bg-sky-700 text-white font-bold py-1.5 px-1 shadow"
          onclick={() => {
            // This is a form button so remember that it triggers the form's onsubmit
            renameStep(index, name)
          }}>Done</button
        >

        <button class="bg-transparent hover:bg-sky-700 text-sky-500 font-semibold hover:text-white py-1.5 px-4 border border-sky-500 hover:border-transparent"
          >Cancel</button
        >
      </div>
    </form>
  </div>
{/if}
