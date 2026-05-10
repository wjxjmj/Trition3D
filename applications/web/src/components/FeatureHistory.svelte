<script lang="ts">
  import {store} from "shared/stores.svelte"
  import PointFeature from "./features/Point.svelte"
  import PlaneFeature from "./features/Plane.svelte"
  import SketchFeature from "./features/Sketch.svelte"
  import ExtrusionFeature from "./features/Extrusion.svelte"
  import {isPoint, isPlane, isExtrusion, isSketch} from "shared/projectUtils"
  import {tr} from "shared/i18n.svelte"
  import type {SetCameraFocus} from "shared/types"
  import {ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronUp} from "lucide-static"

  const log = (function () { const context = "[FeatureHistory.svelte]"; const color="pink"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`)})() // prettier-ignore

  const basePlanes = new Set(["Front", "Top", "Right"])
  let history = $derived(store.workbench.history ?? [])
  let visible = $derived(
    history.filter((s, i) => {
      if (isPoint(s) && i === 0) return false
      if (isPlane(s) && basePlanes.has(s.name)) return false
      return true
    })
  )

  let { setCameraFocus }: { setCameraFocus: SetCameraFocus } = $props()

  // Drag-to-scroll
  let dragging = $state(false)
  let startX = 0
  let startScroll = 0
  let rowEl = $state<HTMLElement | null>(null)

  // Collapse
  let collapsed = $state(false)

  // Nav visible only when content overflows
  let overflow = $state(false)
  let hover = $state(false)
  let fadeTimer: ReturnType<typeof setTimeout>
  function checkOverflow() {
    if (!rowEl) return
    overflow = rowEl.scrollWidth > rowEl.clientWidth + 1
  }

  function onMouseDown(e: MouseEvent) {
    if (!rowEl) return
    dragging = true
    startX = e.clientX
    startScroll = rowEl.scrollLeft
    rowEl.style.cursor = "grabbing"
    e.preventDefault()
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragging || !rowEl) return
    rowEl.scrollLeft = startScroll + (startX - e.clientX)
    checkOverflow()
  }

  function onMouseUp() {
    if (!dragging) return
    dragging = false
    if (rowEl) rowEl.style.cursor = ""
  }

  function scrollTo(pos: "start" | "end" | "pageLeft" | "pageRight") {
    if (!rowEl) return
    const w = rowEl.clientWidth
    if (pos === "start") rowEl.scrollLeft = 0
    else if (pos === "end") rowEl.scrollLeft = rowEl.scrollWidth
    else if (pos === "pageLeft") rowEl.scrollLeft -= w * 0.8
    else if (pos === "pageRight") rowEl.scrollLeft += w * 0.8
    requestAnimationFrame(() => checkOverflow())
  }
</script>

<div
  class="timeline-wrapper"
  onmouseenter={() => { hover = true; clearTimeout(fadeTimer); checkOverflow() }}
  onmouseleave={() => { fadeTimer = setTimeout(() => hover = false, 5000) }}
>
  <!-- Collapse toggle — always visible -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="timeline-toggle" onclick={() => collapsed = !collapsed}>
    <span class="toggle-chevron" class:rotated={!collapsed}>{@html ChevronUp}</span>
    {#if collapsed}
      <span class="toggle-label">{tr().history} ({visible.length})</span>
    {/if}
  </div>

  {#if !collapsed}
    <div class="timeline-label">{tr().history} ({visible.length})</div>

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      bind:this={rowEl}
      class="timeline-row"
      onmousedown={onMouseDown}
    >
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

    <!-- Floating nav — visible when timeline overflows -->
    {#if overflow && hover}
      <div class="timeline-nav">
        <button class="nav-btn" onclick={() => scrollTo("start")} title="Start">
          <span class="nav-icon">{@html ChevronsLeft}</span>
        </button>
        <button class="nav-btn" onclick={() => scrollTo("pageLeft")} title="Page left">
          <span class="nav-icon">{@html ChevronLeft}</span>
        </button>
        <button class="nav-btn" onclick={() => scrollTo("pageRight")} title="Page right">
          <span class="nav-icon">{@html ChevronRight}</span>
        </button>
        <button class="nav-btn" onclick={() => scrollTo("end")} title="End">
          <span class="nav-icon">{@html ChevronsRight}</span>
        </button>
      </div>
    {/if}
  {/if}
</div>

<svelte:window onmousemove={onMouseMove} onmouseup={onMouseUp} />

<style>
  .timeline-toggle {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    padding: 2px;
    color: rgba(0, 0, 0, 0.45);
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.4);
    transition: color 0.12s;
  }
  .timeline-toggle:hover {
    color: rgba(0, 0, 0, 0.75);
  }
  .toggle-chevron {
    width: 14px;
    height: 14px;
    display: block;
    flex-shrink: 0;
    transition: transform 0.15s ease;
  }
  .toggle-chevron :global(svg) {
    width: 14px;
    height: 14px;
  }
  .toggle-chevron.rotated {
    transform: rotate(180deg);
  }
  .toggle-label {
    font-weight: 700;
    font-size: 13px;
  }
  :global(.dark) .timeline-toggle {
    color: rgba(255, 255, 255, 0.45);
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
  }
  :global(.dark) .timeline-toggle:hover {
    color: rgba(255, 255, 255, 0.75);
  }

  .timeline-wrapper {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
  }
  .timeline-label {
    position: absolute;
    left: 8px;
    z-index: 1;
    font-weight: 700;
    font-size: 13px;
    padding: 0 4px;
    color: #000;
    text-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
    pointer-events: none;
  }
  .timeline-row {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 4px 8px;
    padding-left: 80px;
    padding-right: 60px;
    overflow-x: auto;
    cursor: grab;
    user-select: none;
    font-size: 13px;
    line-height: 1.6;
    --text-glow: 0 0 5px rgba(255, 255, 255, 0.4);
    text-shadow: var(--text-glow);
    color: rgba(0, 0, 0, 0.78);
    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 70px, black calc(100% - 40px), transparent 100%);
    mask-image: linear-gradient(to right, transparent 0%, black 70px, black calc(100% - 40px), transparent 100%);
  }
  .timeline-row img {
    pointer-events: none;
  }

  /* Nav bar — floating above the timeline */
  .timeline-nav {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: calc(100% + 2px);
    z-index: 2;
    display: flex;
    gap: 1px;
  }
  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 20px;
    border: none;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(4px);
    cursor: pointer;
    border-radius: 3px;
    color: rgba(0, 0, 0, 0.45);
    transition: color 0.1s, background 0.1s;
  }
  .nav-btn:hover {
    color: rgba(0, 0, 0, 0.85);
    background: rgba(255, 255, 255, 0.75);
  }
  .nav-icon {
    width: 12px;
    height: 12px;
    display: block;
  }
  .nav-icon :global(svg) {
    width: 12px;
    height: 12px;
  }

  :global(.dark) .timeline-label {
    color: rgba(255, 255, 255, 0.88);
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
  }
  :global(.dark) .timeline-row {
    color: rgba(255, 255, 255, 0.78);
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
  }
  :global(.dark) .nav-btn {
    background: rgba(30, 30, 30, 0.5);
    color: rgba(255, 255, 255, 0.4);
  }
  :global(.dark) .nav-btn:hover {
    color: rgba(255, 255, 255, 0.85);
    background: rgba(40, 40, 40, 0.75);
  }

  /* Hidden scrollbar */
  .timeline-row::-webkit-scrollbar {
    height: 0;
  }
</style>
