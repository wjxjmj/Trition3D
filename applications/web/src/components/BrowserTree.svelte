<script lang="ts">
  import {store} from "shared/stores.svelte"
  import {Box, Pencil, Square, ChevronRight, Eye, EyeOff} from "lucide-static"

  const log = (function () { const context = "[BrowserTree.svelte]"; const color="cyan"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`)})() // prettier-ignore

  let bodies = $derived(store.realization.solids ? Object.entries(store.realization.solids) : [])
  let sketches = $derived(store.realization.sketches ? Object.entries(store.realization.sketches) : [])
  let planes = $derived(store.realization.planes ? Object.entries(store.realization.planes) : [])

  let bodiesOpen = $state(true)
  let sketchesOpen = $state(true)
  let planesOpen = $state(true)
  let treeVisible = $state(true)

  function selectBody(name: string) {
    store.currentlySelected = [{id: name, type: "face"}]
    log("selected body:", name)
  }

  function selectSketch(id: string) {
    store.currentlySelected = [{id, type: "line"}]
    log("selected sketch:", id)
  }

  function selectPlane(id: string) {
    store.currentlySelected = [{id, type: "plane"}]
    log("selected plane:", id)
  }

  function toggleBody(name: string) {
    if (store.hiddenSolids.includes(name)) {
      store.hiddenSolids = store.hiddenSolids.filter(s => s !== name)
    } else {
      store.hiddenSolids = [...store.hiddenSolids, name]
    }
  }

  function toggleSketch(id: string) {
    if (store.hiddenSketches.includes(id)) {
      store.hiddenSketches = store.hiddenSketches.filter(s => s !== id)
    } else {
      store.hiddenSketches = [...store.hiddenSketches, id]
    }
  }
</script>

{#if treeVisible}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="browser-tree group"
    oncontextmenu={(e) => e.preventDefault()}
  >
    <!-- Section: Bodies -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="section-header"
      onclick={() => bodiesOpen = !bodiesOpen}
      role="button"
      tabindex="0"
    >
      <span class="chevron" class:rotated={bodiesOpen}>{@html ChevronRight}</span>
      <span class="section-icon text-blue-300">{@html Box}</span>
      <span class="section-label">Bodies</span>
      <span class="section-count">{bodies.length}</span>
    </div>
    {#if bodiesOpen}
      <div class="section-items">
        {#each bodies as [name, _solid]}
          {@const hidden = store.hiddenSolids.includes(name)}
          {@const selected = store.currentlySelected.some(e => e.id === name)}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="tree-item"
            class:selected
            class:hidden-item={hidden}
            onclick={() => selectBody(name)}
            ondblclick={() => toggleBody(name)}
            role="button"
            tabindex="0"
          >
            <span class="item-text">{name}</span>
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <span
              class="item-action opacity-0 group-hover:opacity-100"
              onclick={(e) => { e.stopPropagation(); toggleBody(name) }}
            >
              {#if hidden}
                <span class="icon-block">{@html EyeOff}</span>
              {:else}
                <span class="icon-block">{@html Eye}</span>
              {/if}
            </span>
          </div>
        {/each}
        {#if bodies.length === 0}
          <div class="tree-item text-gray-500 dark:text-gray-500">No solids yet</div>
        {/if}
      </div>
    {/if}

    <!-- Divider -->
    <div class="divider"></div>

    <!-- Section: Sketches -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="section-header"
      onclick={() => sketchesOpen = !sketchesOpen}
      role="button"
      tabindex="0"
    >
      <span class="chevron" class:rotated={sketchesOpen}>{@html ChevronRight}</span>
      <span class="section-icon text-yellow-300">{@html Pencil}</span>
      <span class="section-label">Sketches</span>
      <span class="section-count">{sketches.length}</span>
    </div>
    {#if sketchesOpen}
      <div class="section-items">
        {#each sketches as [id, _sketch]}
          {@const hidden = store.hiddenSketches.includes(id)}
          {@const selected = store.currentlySelected.some(e => e.id === id)}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="tree-item"
            class:selected
            class:hidden-item={hidden}
            onclick={() => selectSketch(id)}
            role="button"
            tabindex="0"
          >
            <span class="item-text">Sketch {id.slice(0, 4)}</span>
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <span
              class="item-action opacity-0 group-hover:opacity-100"
              onclick={(e) => { e.stopPropagation(); toggleSketch(id) }}
            >
              {#if hidden}
                <span class="icon-block">{@html EyeOff}</span>
              {:else}
                <span class="icon-block">{@html Eye}</span>
              {/if}
            </span>
          </div>
        {/each}
        {#if sketches.length === 0}
          <div class="tree-item text-gray-500 dark:text-gray-500">No sketches yet</div>
        {/if}
      </div>
    {/if}

    <!-- Divider -->
    <div class="divider"></div>

    <!-- Section: Planes -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="section-header"
      onclick={() => planesOpen = !planesOpen}
      role="button"
      tabindex="0"
    >
      <span class="chevron" class:rotated={planesOpen}>{@html ChevronRight}</span>
      <span class="section-icon text-green-300">{@html Square}</span>
      <span class="section-label">Planes</span>
      <span class="section-count">{planes.length}</span>
    </div>
    {#if planesOpen}
      <div class="section-items">
        {#each planes as [id, _plane]}
          {@const selected = store.currentlySelected.some(e => e.id === id)}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="tree-item"
            class:selected
            onclick={() => selectPlane(id)}
            role="button"
            tabindex="0"
          >
            <span class="item-text">Plane {id.slice(0, 4)}</span>
          </div>
        {/each}
        {#if planes.length === 0}
          <div class="tree-item text-gray-500 dark:text-gray-500">No planes yet</div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  /*
   * Browser tree — fully transparent, text floating directly on the 3D scene.
   * No panel background, no blur, no border. Just text with shadow for readability.
   */
  .browser-tree {
    position: absolute;
    top: 16px;
    left: 16px;
    max-height: calc(100% - 32px);
    overflow-y: auto;
    z-index: 20;
    padding: 0;
    min-width: 190px;
    max-width: 260px;
    user-select: none;
    font-family: "Manrope", system-ui, sans-serif;
    font-size: 12px;
    line-height: 1.6;

    /* The glow that makes text readable against any 3D background */
    --text-glow: 0 0 6px rgba(0, 0, 0, 0.55), 0 0 2px rgba(0, 0, 0, 0.7);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 4px;
    cursor: pointer;
    font-weight: 600;
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.48);
    text-shadow: var(--text-glow);
    transition: color 0.12s ease;
  }
  .section-header:hover {
    color: rgba(255, 255, 255, 0.72);
  }

  .chevron {
    width: 12px;
    height: 12px;
    display: block;
    flex-shrink: 0;
    transition: transform 0.12s ease;
    opacity: 0.45;
  }
  .chevron.rotated {
    transform: rotate(90deg);
  }

  .section-icon {
    width: 12px;
    height: 12px;
    display: block;
    flex-shrink: 0;
  }

  .section-label {
    flex: 1;
  }

  .section-count {
    font-variant-numeric: tabular-nums;
    opacity: 0.35;
    font-size: 10px;
  }

  .section-items {
    padding-left: 12px;
  }

  .tree-item {
    display: flex;
    align-items: center;
    padding: 1px 4px;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.78);
    text-shadow: var(--text-glow);
    transition: color 0.10s ease;
    white-space: nowrap;
  }
  .tree-item:hover {
    color: rgba(255, 255, 255, 0.97);
  }
  .tree-item.selected {
    color: rgb(130, 180, 255);
    text-shadow: 0 0 8px rgba(66, 133, 244, 0.5), var(--text-glow);
  }
  .tree-item.hidden-item {
    color: rgba(255, 255, 255, 0.28);
    text-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  }

  .item-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-action {
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  .icon-block {
    width: 13px;
    height: 13px;
    display: block;
    opacity: 0.45;
    transition: opacity 0.10s ease;
  }
  .icon-block:hover {
    opacity: 0.85;
  }

  .divider {
    height: 0;
    margin: 2px 4px;
    /* no visible divider — spacing only */
  }

  /* Scrollbar — phantom-thin, barely there */
  .browser-tree::-webkit-scrollbar {
    width: 3px;
  }
  .browser-tree::-webkit-scrollbar-track {
    background: transparent;
  }
  .browser-tree::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
  }
  .browser-tree::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.12);
  }
</style>
