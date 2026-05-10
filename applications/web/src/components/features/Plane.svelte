<script lang="ts">
  import {store} from "shared/stores.svelte"
  import FloatingPanel from "../FloatingPanel.svelte"
  import {Search} from "lucide-static"
  import {renameStep} from "shared/projectUtils"
  import {tr} from "shared/i18n.svelte"
  import {base} from "../../base"

  const log = (function () { const context = "[PlaneFeature.svelte]"; const color="gray"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`)})() // prettier-ignore

  let { name, index, plane, setCameraFocus }: { name: string; index: number; plane: Plane; setCameraFocus: SetCameraFocus } = $props()

  const source = `${base}/actions/plane_min.svg`
  let open = $derived(store.featureIndex === index)

  const closeAndRefresh = () => {
    store.workbenchIsStale = true
    store.featureIndex = 1000
  }
</script>

<div
  class="flex items-center text-sm hover:bg-sky-200 dark:hover:bg-gray-600 rounded px-1 py-0.5 shrink-0"
  role="button"
  tabindex="0"
  ondblclick={() => {
    store.featureIndex = open ? 1000 : index
  }}
>
  <img class="h-6 w-6 px-0.5" src={source} alt={name} />
  <span class:text-gray-400={store.featureIndex > index}>{name}</span>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="ml-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-500 px-0.5 py-0.5 rounded"
    onmousedown={(e) => {
      e.stopPropagation()
      setCameraFocus?.(plane.tertiary, plane.origin, plane.secondary)
    }}
  >
    <span class="h-[14px] w-[14px] block">{@html Search}</span>
  </div>
</div>

<FloatingPanel show={open} title={tr().plane} onclose={closeAndRefresh}>
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
