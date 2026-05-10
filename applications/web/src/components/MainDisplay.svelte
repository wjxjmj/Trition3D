<script lang="ts">
  // Fusion 360 layout: 3D viewport on top, horizontal timeline at the bottom.
  // Browser tree floats inside the viewport. Left panel removed entirely.
  import {store} from "shared/stores.svelte"
  import FeatureHistory from "./FeatureHistory.svelte"
  import BrowserTree from "./BrowserTree.svelte"
  import {Canvas} from "@threlte/core"
  import Scene from "./Scene.svelte"
  import type {SetCameraFocus} from "shared/types"

  const minTimelineH = 60
  const maxTimelineH = 400
  let timelineHeight = $state(160) // px
  let resizing = $state(false)
  let initialTimelineH = timelineHeight
  let initialMouseY = 0
  let innerWidth = $state(0)
  let innerHeight = $state(0)
  let viewportHeight = $derived(Math.max(100, innerHeight - timelineHeight - 12 - 45 * 3))

  let setCameraFocus: SetCameraFocus
  let sceneRef: any = $state()

  function doSetCameraFocus(goTo: any, lookAt: any, up: any) {
    sceneRef?.setCameraFocus?.(goTo, lookAt, up)
  }

  function onMouseDown(event: MouseEvent) {
    initialMouseY = event.pageY
    initialTimelineH = timelineHeight
    resizing = true
  }

  function onMouseUp(_event: MouseEvent) {
    resizing = false
  }

  function onMouseMove(event: MouseEvent) {
    if (!resizing) return
    const delta = initialMouseY - event.pageY
    timelineHeight = initialTimelineH + delta
    if (timelineHeight < minTimelineH) timelineHeight = minTimelineH
    if (timelineHeight > maxTimelineH) timelineHeight = maxTimelineH
    event.preventDefault()
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="bg-white dark:bg-gray-700 relative {store.sketchTool === 'line' || store.sketchTool === 'circle' || store.sketchTool === 'rectangle' ? 'cursor-crosshair' : ''}"
  style="width:100%; height:{viewportHeight}px"
  onmousedown={e => {
    if (store.selectingFor.length > 0) e.preventDefault()
  }}
>
  <Canvas>
    <Scene bind:this={sceneRef} />
  </Canvas>
  <BrowserTree />
  <div class="dark:text-gray-300 absolute bottom-1 right-1">{GIT_BRANCH} {GIT_HASH}</div>
</div>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="h-[12px] cursor-row-resize border-t-2 border-t-gray-300 dark:border-t-gray-600 dark:bg-gray-800" onmousedown={onMouseDown}></div>

<div style="height:{timelineHeight}px" class="dark:bg-gray-800 overflow-hidden">
  <FeatureHistory setCameraFocus={doSetCameraFocus} />
</div>

<svelte:window onmousemove={onMouseMove} onmouseup={onMouseUp} bind:innerWidth bind:innerHeight />
