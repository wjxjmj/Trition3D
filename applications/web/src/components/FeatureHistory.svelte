<script lang="ts">
  import {store} from "shared/stores.svelte"
  import PointFeature from "./features/Point.svelte"
  import PlaneFeature from "./features/Plane.svelte"
  import SketchFeature from "./features/Sketch.svelte"
  import ExtrusionFeature from "./features/Extrusion.svelte"
  import {isPoint, isPlane, isExtrusion, isSketch} from "shared/projectUtils"
  import {tr} from "shared/i18n.svelte"
  import type {SetCameraFocus} from "shared/types"

  const log = (function () { const context = "[FeatureHistory.svelte]"; const color="pink"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`)})() // prettier-ignore

  let history = $derived(store.workbench.history ?? [])

  let { setCameraFocus }: { setCameraFocus: SetCameraFocus } = $props()
</script>

<div class="flex items-center h-full gap-1 px-3 py-2 overflow-x-auto select-none dark:text-gray-300">
  <div class="font-bold text-sm px-2 shrink-0 opacity-60">{tr().history} ({history.length})</div>

  {#each history as feature, featureIdx (feature.data.type + ":" + feature.unique_id)}
    <div class="shrink-0">
      {#if isPoint(feature)}
        <PointFeature name={feature.name} index={featureIdx} />
      {:else if isPlane(feature)}
        <PlaneFeature name={feature.name} index={featureIdx} plane={feature.data.plane} {setCameraFocus} />
      {:else if isSketch(feature)}
        <SketchFeature name={feature.name} index={featureIdx} id={feature.unique_id} plane_id={feature.data.plane_description.PlaneId} />
      {:else if isExtrusion(feature)}
        <ExtrusionFeature name={feature.name} index={featureIdx} data={feature.data.extrusion} id={feature.unique_id} />
      {:else}
        <span class="text-xs opacity-40">?</span>
      {/if}
    </div>
  {/each}
</div>
