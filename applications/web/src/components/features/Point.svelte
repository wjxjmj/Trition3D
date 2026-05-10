<script lang="ts">
  import {store} from "shared/stores.svelte"
  import {slide} from "svelte/transition"
  import {quintOut} from "svelte/easing"
  import {renameStep} from "shared/projectUtils"
  import {tr} from "shared/i18n.svelte"
  import {base} from "../../base"

  const log = (function () { const context = "[PointFeature.svelte]"; const color="gray"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`)})() // prettier-ignore

  let { name, index }: { name: string; index: number } = $props()

  const source = `${base}/actions/point_min_icon.svg`
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
  <img class="h-8 w-8 px-1" src={source} alt={name} />
  {name}
</div>

{#if store.featureIndex === index}
  <div transition:slide={{delay: 0, duration: 400, easing: quintOut, axis: "y"}}>
    <form
      onsubmit={(e) => {
        e.preventDefault()
        closeAndRefresh()
      }}
      class="px-3 py-2 bg-gray-100 dark:bg-gray-600 flex flex-col space-y-2"
      autocomplete="off"
    >
      <label>
        {tr().name}
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
          }}>{tr().done}</button
        >

        <button class="bg-transparent hover:bg-sky-700 text-sky-500 font-semibold hover:text-white py-1.5 px-4 border border-sky-500 hover:border-transparent"
          >{tr().cancel}</button
        >
      </div>
    </form>
  </div>
{/if}
