<script lang="ts">
  import {store} from "shared/stores.svelte"
  import FloatingPanel from "../FloatingPanel.svelte"
  import {X} from "lucide-static"
  import {arraysEqual, renameStep, updateExtrusion} from "shared/projectUtils"
  import {tr} from "shared/i18n.svelte"
  import {base} from "../../base"

  const log = (function () { const context = "[ExtrusionFeature.svelte]"; const color="gray"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`)})() // prettier-ignore

  let { name, index, id, data }: { name: string; index: number; id: string; data: ExtrusionData["data"]["extrusion"] } = $props()

  let faceIdsFromInputs = $state(data.face_ids.sort().map(e => e + ""))
  $effect(() => { if (data && data.face_ids) faceIdsFromInputs = data.face_ids.map(e => e + "").sort() })

  let length = $state(data.length)
  let open = $derived(store.featureIndex === index)

  const closeAndRefresh = () => {
    store.featureIndex = 1000
    store.currentlySelected = []
    store.selectingFor = []
    if (!store.hiddenSketches.includes(data.sketch_id)) {
      store.hiddenSketches = [...store.hiddenSketches, data.sketch_id]
    }
    store.workbenchIsStale = true
  }

  let updating = false
  function sendUpdate(specificFaceIds?: string[]) {
    if (updating) return
    if (specificFaceIds !== undefined && specificFaceIds.length === 0) return
    updating = true
    try {
      if (specificFaceIds) {
        updateExtrusion(id, data.sketch_id, length, specificFaceIds)
      } else {
        const faceIdsFromSelection = store.currentlySelected
          .filter(e => e.type === "face")
          .map(e => e.id)
          .sort()
        updateExtrusion(id, data.sketch_id, length, faceIdsFromSelection)
      }
    } finally {
      setTimeout(() => updating = false, 200)
    }
  }

  $effect(() => {
    const selected = store.currentlySelected
    if (store.featureIndex !== index) return
    if (updating) return
    const faceIdsFromSelection = selected.filter(e => e.type === "face").map(e => e.id).sort()
    if (faceIdsFromSelection.length > 0 && !arraysEqual(faceIdsFromInputs, faceIdsFromSelection)) {
      sendUpdate(faceIdsFromSelection)
    }
  })

  const source = `${base}/actions/extrude_min.svg`

  $effect(() => {
    if (store.featureIndex === index) {
      store.selectingFor = ["face", "meshFace"]
      store.currentlySelected = faceIdsFromInputs.map(id => ({type: "face", id}))
    }
  })
</script>

<div
  class="feature-pill"
  role="button"
  tabindex="0"
  ondblclick={() => {
    store.featureIndex = open ? 1000 : index
  }}
>
  <img class="h-6 w-6 px-0.5" src={source} alt={name} />
  <span class:text-gray-400={store.featureIndex > index}>{name}</span>
</div>

<FloatingPanel show={open} title={tr().extrusion} onclose={closeAndRefresh}>
  {#snippet children()}
    <form
      onsubmit={(e) => { e.preventDefault(); closeAndRefresh() }}
      class="flex flex-col space-y-2"
      autocomplete="off"
    >
      <label class="text-xs opacity-70">
        {tr().name}
        <input
          autocomplete="off" data-1p-ignore
          class="shadow appearance-none border w-full py-1.5 px-2 text-sm text-gray-700 leading-tight focus:border focus:border-sky-500 rounded"
          bind:value={name}
        />
      </label>
      <label class="text-xs opacity-70">
        {tr().length}
        <input
          autocomplete="off" data-1p-ignore
          class="shadow appearance-none border w-full py-1.5 px-2 text-sm text-gray-700 leading-tight focus:border focus:border-sky-500 rounded"
          type="number"
          bind:value={length}
          oninput={() => sendUpdate()}
        />
      </label>
      <span class="text-xs opacity-70">{tr().faces}</span>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <div tabindex="0" class="bg-gray-50 rounded flex shadow border focus:ring focus:border-blue-500 min-h-8 flex-wrap">
        <div class="h-8"></div>
        {#each faceIdsFromInputs as faceId}
          <div class="bg-sky-200 pl-2 py-0.5 m-1 rounded text-sm">
            {faceId}<button
              onclick={(e) => {
                e.preventDefault()
                store.currentlySelected = store.currentlySelected.filter(item => !(item.id === faceId && item.type === "face"))
              }}><span class="h-[16px] w-[16px] block">{@html X}</span></button>
          </div>
        {/each}
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
