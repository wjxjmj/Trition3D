<script lang="ts">
  // Fusion 360 layout: full-viewport 3D canvas with floating overlays.
  // BrowserTree floats top-left, history timeline floats at the bottom.
  import {store} from "shared/stores.svelte"
  import FeatureHistory from "./FeatureHistory.svelte"
  import BrowserTree from "./BrowserTree.svelte"
  import {Canvas} from "@threlte/core"
  import Scene from "./Scene.svelte"
  import type {SetCameraFocus} from "shared/types"

  const minTimelineH = 48
  const maxTimelineH = 350
  let timelineHeight = $state(130)
  let resizing = $state(false)
  let initialTimelineH = timelineHeight
  let initialMouseY = 0
  let innerWidth = $state(0)
  let innerHeight = $state(0)
  let viewportHeight = $derived(Math.max(100, innerHeight - 45 * 2))

  let setCameraFocus: SetCameraFocus
  let sceneRef: any = $state()

  function doSetCameraFocus(goTo: any, lookAt: any, up: any) {
    sceneRef?.setCameraFocus?.(goTo, lookAt, up)
  }

  function onMouseDown(event: MouseEvent) {
    initialMouseY = event.pageY
    initialTimelineH = timelineHeight
    resizing = true
    event.preventDefault()
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

  <!-- Floating timeline at the bottom of the viewport -->
  <div
    class="timeline-overlay"
    style="height:{timelineHeight}px"
    onmousedown={(e) => e.stopPropagation()}
  >
    <!-- Resize handle on top edge of timeline -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="timeline-handle"
      onmousedown={onMouseDown}
    ></div>
    <FeatureHistory setCameraFocus={doSetCameraFocus} />
  </div>
</div>

<svelte:window onmousemove={onMouseMove} onmouseup={onMouseUp} bind:innerWidth bind:innerHeight />

<style>
  .timeline-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 20;
    overflow: hidden;
  }
  .timeline-handle {
    height: 4px;
    cursor: row-resize;
    margin-bottom: 0;
  }
  .timeline-handle:hover {
    background: rgba(128, 128, 128, 0.12);
  }
</style>
