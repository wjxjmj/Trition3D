<script lang="ts">
  import fileDownload from "js-file-download"
  
  import {store} from "shared/stores.svelte"
  import {Download, Eye, EyeOff} from "lucide-static"
  import {getObjectString} from "shared/projectUtils"
  import {tr} from "shared/i18n.svelte"
  import type {WithTarget} from "shared/types"
  import {base} from "../base"

  const log = (function () { const context = "[SolidItem.svelte]"; const color="gray"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`)})() // prettier-ignore

  let { name }: { name: string } = $props()

  const source = `${base}/actions/part.svg`
  let contextMenuVisible = $state(false)

  // pos is cursor position when right click occur
  let pos = $state({x: 0, y: 0})
  // menu is dimension (height and width) of context menu
  let menu = $state({h: 0, w: 0})
  // browser/window dimension (height and width)
  let browser_size = $state({h: 0, w: 0})

  function getContextMenuDimension(node: HTMLElement) {
    // This function will get context menu dimension
    // when navigation is shown => showMenu = true
    const height = node.offsetHeight
    const width = node.offsetWidth
    menu = {
      h: height,
      w: width,
    }
  }

  export function rightClickContextMenu(e: WithTarget<MouseEvent, HTMLElement>) {
    contextMenuVisible = true
    browser_size = {
      w: window.innerWidth,
      h: window.innerHeight,
    }
    pos = {
      x: e.clientX + 10,
      y: e.clientY,
    }
    // If bottom part of context menu will be displayed
    // after right-click, then change the position of the
    // context menu. This position is controlled by `top` and `left`
    // at inline style.
    // Instead of context menu is displayed from top left of cursor position
    // when right-click occur, it will be displayed from bottom left.
    if (browser_size.h - pos.y < menu.h) pos.y = pos.y - menu.h
    if (browser_size.w - pos.x < menu.w) pos.x = pos.x - menu.w
  }

  function exportSolidOBJ() {
    contextMenuVisible = false
    const asString = getObjectString(name)
    fileDownload(asString, `${name}.obj`)
    contextMenuVisible = false
  }
  const exportSolidSTEP = () => {
    contextMenuVisible = false
    const step_string = store.wasmRealization.solid_to_step(name)
    fileDownload(step_string, `${name}.step`)
  }

  function onWindowClick() {
    contextMenuVisible = false
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="flex items-center text-sm hover:bg-sky-200 dark:hover:bg-gray-600"
  role="button"
  tabindex="0"
  oncontextmenu={(e) => {
    e.preventDefault()
    log("solid", e)
    rightClickContextMenu(e)
  }}
>
  <img class="h-8 w-8 px-1" src={source} alt={name} />
  {name}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="ml-auto mr-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-500 px-1 py-1 rounded"
    onclick={() => {
      if (store.hiddenSolids.includes(name)) {
        store.hiddenSolids = store.hiddenSolids.filter(s => s !== name)
      } else {
        store.hiddenSolids = [...store.hiddenSolids, name]
      }
    }}
  >
    {#if store.hiddenSolids.includes(name)}
      <span class="h-[18px] w-[18px] block">{@html EyeOff}</span>
    {:else}
      <span class="h-[18px] w-[18px] block">{@html Eye}</span>
    {/if}
  </div>
</div>

{#if contextMenuVisible}
  <nav use:getContextMenuDimension style="position: absolute; top:{pos.y}px; left:{pos.x}px">
    <div class="navbar inline-flex border w-[210px] bg-white dark:bg-gray-700 overflow-hidden flex-col rounded-[10px] border-[solid]" id="navbar">
      <ul class="m-1.5">
        <li class="block list-none w-[1fr] my-1">
          <button
            class="text-base text-[#222] w-full h-[30px] text-left bg-white dark:bg-gray-700 dark:text-gray-300 dark:hover:text-gray-300 dark:hover:bg-gray-600 border-0 hover:text-black hover:text-left hover:bg-[#eee] rounded-[5px] flex"
            onclick={exportSolidOBJ}
          >
            <span class="h-6 w-6 block">{@html Download}</span> {tr().downloadOBJ}
          </button>
        </li>

        <li class="block list-none w-[1fr] my-1">
          <button
            class="text-base text-[#222] w-full h-[30px] text-left bg-white dark:bg-gray-700 dark:text-gray-300 dark:hover:text-gray-300 dark:hover:bg-gray-600 border-0 hover:text-black hover:text-left hover:bg-[#eee] rounded-[5px] flex"
            onclick={exportSolidSTEP}
          >
            <span class="h-6 w-6 block">{@html Download}</span>{tr().downloadSTEP}
          </button>
        </li>
      </ul>
    </div>
  </nav>
{/if}

<svelte:window onclick={onWindowClick} />
