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

  const basePlanes = new Set(["Front", "Top", "Right"])
  let history = $derived(store.workbench.history ?? [])
  // Skip the origin point and the three default base planes
  let visible = $derived(
    history.filter((s, i) => {
      if (isPoint(s) && i === 0) return false
      if (isPlane(s) && basePlanes.has(s.name)) return false
      return true
    })
  )

  let { setCameraFocus }: { setCameraFocus: SetCameraFocus } = $props()
</script>

<div
  class="timeline-row"
  onwheel={(e) => {
    e.currentTarget.scrollLeft += e.deltaY
    e.preventDefault()
  }}
>
  <div class="timeline-label">{tr().history} ({visible.length})</div>

  {#each visible as feature (feature.data.type + ":" + feature.unique_id)}
    {@const featureIdx = history.indexOf(feature)}
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

<style>
  .timeline-row {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 4px 8px;
    overflow-x: auto;
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
    user-select: none;
    font-size: 13px;
    line-height: 1.6;
    --text-glow: 0 0 5px rgba(255, 255, 255, 0.4);
    text-shadow: var(--text-glow);
    color: rgba(0, 0, 0, 0.78);
  }
  .timeline-label {
    font-weight: 700;
    font-size: 13px;
    padding: 0 4px;
    flex-shrink: 0;
    color: #000;
    text-shadow: var(--text-glow);
  }
  :global(.dark) .timeline-label {
    color: rgba(255, 255, 255, 0.88);
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
  }
  :global(.dark) .timeline-row {
    color: rgba(255, 255, 255, 0.78);
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
  }

  .timeline-row::-webkit-scrollbar {
    height: 3px;
  }
  .timeline-row::-webkit-scrollbar-track {
    background: transparent;
  }
  .timeline-row::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 2px;
    transition: background 0.15s ease;
  }
  .timeline-row:hover::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.08);
  }
  .timeline-row::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.18);
  }
  .timeline-row:hover {
    scrollbar-color: rgba(0, 0, 0, 0.08) transparent;
  }
</style>
