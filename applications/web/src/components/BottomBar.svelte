<script>
  import {store} from "shared/stores.svelte"

  // prettier-ignore
  const log = (function () { const context = "[BottomBar.svelte]"; const color="gray"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`)})()
  let new_workbench_name = $state("")

  let workbenches = $derived(store.project.workbenches ?? [])
</script>

<div class="bg-gray-100 dark:bg-gray-800 h-[45px] flex">
  {#each workbenches as wb, i (wb.name)}
    {#if wb.renaming}
      <input
        class="bg-gray-300 text-gray-700 py-2 px-4"
        type="text"
        bind:value={new_workbench_name}
        onblur={() => {
          log("Renaming store.workbench index aborted")
          wb.renaming = false
        }}
        onkeydown={e => {
          if (e.key === "Enter") {
            log("Renaming store.workbench index:", i)
            renameWorkbench(new_workbench_name)
            wb.name = new_workbench_name
            store.workbenchIsStale = true
            wb.renaming = false
          }
        }}
      />
    {:else}
      <button
        class="{store.workbenchIndex === i
          ? 'bg-gray-300 dark:bg-gray-600'
          : 'bg-gray-200 dark:bg-gray-800'} hover:bg-sky-300 text-gray-700 dark:text-gray-300 dark:hover:text-gray-700 py-2 px-4"
        type="button"
        ondblclick={() => {
          if (store.workbenchIndex !== i) {
            return
          }

          log("Renaming store.workbench index:", i)
          wb.renaming = true
          new_workbench_name = wb.name
        }}
        onclick={() => {
          log("Setting new store.workbench index:", i)
          store.workbenchIndex = i
          store.workbenchIsStale = true
        }}>{wb.name}</button
      >
    {/if}
  {/each}
</div>
