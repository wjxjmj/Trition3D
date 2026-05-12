<script lang="ts">
  // Fusion 360 layout: full-viewport 3D canvas with floating overlays.
  // BrowserTree floats top-left, history timeline floats at the bottom.
  import {store} from "shared/stores.svelte"
  import FeatureHistory from "./FeatureHistory.svelte"
  import BrowserTree from "./BrowserTree.svelte"
  import {Canvas} from "@threlte/core"
  import Scene from "./Scene.svelte"
  import type {SetCameraFocus} from "shared/types"

  let innerWidth = $state(0)
  let innerHeight = $state(0)
  let viewportHeight = $derived(Math.max(100, innerHeight - 45 * 2))

  let setCameraFocus: SetCameraFocus
  let sceneRef: any = $state()

  function doSetCameraFocus(goTo: any, lookAt: any, up: any) {
    sceneRef?.setCameraFocus?.(goTo, lookAt, up)
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="bg-[#dadada] dark:bg-gray-800 relative {store.sketchTool === 'line' || store.sketchTool === 'circle' || store.sketchTool === 'rectangle' ? 'cursor-crosshair' : ''}"
  style="width:100%; height:{viewportHeight}px"
  onmousedown={e => {
    if (store.selectingFor.length > 0) e.preventDefault()
  }}
>
  <Canvas>
    <Scene bind:this={sceneRef} />
  </Canvas>
  <BrowserTree />

  <!-- Timeline — fixed height, flush to bottom, no resize -->
  <div class="timeline-overlay">
    <FeatureHistory setCameraFocus={doSetCameraFocus} />
  </div>
</div>

<svelte:window bind:innerWidth bind:innerHeight />

<style>
  .timeline-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 20;
  }
</style>
