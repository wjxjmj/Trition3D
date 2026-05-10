<script lang="ts">
  // Draggable floating panel that appears near the cursor.
  // Drag the header bar to reposition, click X to close.
  import {X} from "lucide-static"

  let { show, title = "", onclose, children }: {
    show: boolean
    title?: string
    onclose: () => void
    children: any
  } = $props()

  let posX = $state(300)
  let posY = $state(120)
  let dragging = $state(false)
  let dragStartX = 0
  let dragStartY = 0
  let originX = 0
  let originY = 0

  $effect(() => {
    console.log("[FloatingPanel] show:", show, "title:", title)
    if (show) {
      posX = Math.max(100, (window.innerWidth - 300) / 2)
      posY = 100
    }
  })

  function onDragStart(e: MouseEvent) {
    dragging = true
    dragStartX = e.clientX
    dragStartY = e.clientY
    originX = posX
    originY = posY
    e.preventDefault()
  }

  function onDragMove(e: MouseEvent) {
    if (!dragging) return
    posX = originX + e.clientX - dragStartX
    posY = originY + e.clientY - dragStartY
  }

  function onDragEnd() {
    dragging = false
  }
</script>

{#if show}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="floating-panel"
    style="left:{posX}px; top:{posY}px"
    onmousedown={(e) => e.stopPropagation()}
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="panel-header" onmousedown={onDragStart}>
      <span class="panel-title">{title}</span>
      <button class="panel-close" onclick={onclose}>
        <span class="w-[16px] h-[16px] block">{@html X}</span>
      </button>
    </div>
    <div class="panel-body">
      {#if children}
        {@render children()}
      {/if}
    </div>
  </div>


{/if}

<svelte:window onmousemove={(e) => { if (dragging) onDragMove(e) }} onmouseup={() => { if (dragging) onDragEnd() }} />

<style>
  .floating-panel {
    position: fixed;
    z-index: 100;
    min-width: 260px;
    max-width: 340px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.08);
    user-select: none;
    font-size: 13px;
    color: #222;
  }
  :global(.dark) .floating-panel {
    background: rgba(40, 40, 44, 0.94);
    border-color: rgba(255, 255, 255, 0.1);
    color: #ddd;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .panel-header {
    display: flex;
    align-items: center;
    padding: 6px 10px;
    cursor: grab;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    opacity: 0.6;
  }
  :global(.dark) .panel-header {
    border-bottom-color: rgba(255, 255, 255, 0.06);
  }
  .panel-header:active {
    cursor: grabbing;
  }

  .panel-title {
    flex: 1;
  }

  .panel-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 4px;
    opacity: 0.5;
    color: inherit;
  }
  .panel-close:hover {
    opacity: 0.9;
    background: rgba(0, 0, 0, 0.06);
  }

  .panel-body {
    padding: 10px 12px;
  }
</style>
