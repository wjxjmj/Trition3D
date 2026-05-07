<script lang="ts">
  import {store} from "shared/stores.svelte"
  import {slide} from "svelte/transition"
  import {quintOut} from "svelte/easing"
  import {renameStep} from "shared/projectUtils"
  import {base} from "../../base"

  const log = (function () { const context = "[PlaneFeature.svelte]"; const color="gray"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`)})() // prettier-ignore

  let { name, index, plane, setCameraFocus }: { name: string; index: number; plane: Plane; setCameraFocus: SetCameraFocus } = $props()
  // log("[props]", "name:", name, "index:", index, "plane:", plane, "setCameraFocus:", "(goTo: Vector3Like, lookAt: Vector3Like, up: Vector3Like) => void")

  const source = `${base}/actions/plane_min.svg`

  const closeAndRefresh = () => {
    log("closing, refreshing")
    store.workbenchIsStale = true
    store.featureIndex = 1000
  }
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
    onmousedown={() => {
      setCameraFocus(plane.tertiary, plane.origin, plane.secondary)
      // move camera to focus on plane
    }}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="currentColor"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" /></svg>
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

      <div class="flex space-x-1.5">
        <button
          class="flex-grow bg-sky-500 hover:bg-sky-700 text-white font-bold py-1.5 px-1 shadow"
          onclick={() => {
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
