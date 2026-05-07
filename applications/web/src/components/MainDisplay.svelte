<script lang="ts">
  // The main display includes the feature history, parts manager, and 3D viewport
  // It is all contained in this file, which is imported by the main page
  // It had to be done this way to manage the resizing of the feature history and viewport
  import {store} from "shared/stores.svelte"
  import FeatureHistory from "./FeatureHistory.svelte"
  import {Canvas} from "@threlte/core"
  import Scene from "./Scene.svelte"
  import type {SetCameraFocus} from "shared/types"

  const minWidth = 150
  const maxWidth = 600
  let width = $state(250) // px
  let initialWidth = width
  let initialPosition = {x: 0, y: 0}
  let resizing = $state(false)
  let innerWidth = $state(0)
  let innerHeight = $state(0)
  let viewportWidth = $derived(innerWidth - width - 10)
  let height = $derived(innerHeight > 135 ? innerHeight - 45 * 3 : 300)

  let { setCameraFocus }: { setCameraFocus: SetCameraFocus } = $props()

  function onMouseDown(event: MouseEvent) {
    initialPosition = {x: event.pageX, y: event.pageY}
    initialWidth = width
    resizing = true
  }

  function onMouseUp(_event: MouseEvent) {
    resizing = false
  }

  function onMouseMove(event: MouseEvent) {
    if (!resizing) return

    const delta = event.pageX - initialPosition.x
    width = initialWidth + delta

    if (width < minWidth) width = minWidth
    if (width > maxWidth) width = maxWidth

    event.preventDefault()
  }
</script>

<div style="width:{width}px; height:{height}px" class="dark:bg-gray-700">
  <FeatureHistory {setCameraFocus} />
</div>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="w-[12px] cursor-col-resize border-r-gray-300 dark:bg-gray-700 border-r-2" onmousedown={onMouseDown}></div>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="bg-white dark:bg-gray-700 {store.sketchTool === 'line' || store.sketchTool === 'circle' || store.sketchTool === 'rectangle' ? 'cursor-crosshair' : ''}"
  style="width:{viewportWidth}px; height:{height}px"
  onmousedown={e => {
    if (store.selectingFor.length > 0) {
      // If the user is selecting shapes, then click events on the 3D screen
      // should not steal focus away from form inputs
      e.preventDefault()
    }
  }}
>
  <Canvas>
    <Scene bind:setCameraFocus />
  </Canvas>
  <div class="dark:text-gray-300 absolute bottom-1 right-1">{GIT_BRANCH} {GIT_HASH}</div>
</div>

<svelte:window onmousemove={onMouseMove} onmouseup={onMouseUp} bind:innerWidth bind:innerHeight />
