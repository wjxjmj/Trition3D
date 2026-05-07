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
      <EyeSlash weight="light" size="18px" />
    {:else}
      <Eye weight="light" size="18px" />
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
              }}><X /></button
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
