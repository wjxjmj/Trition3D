<script lang="ts">
  import {store} from "shared/stores.svelte"
  import {tr} from "shared/i18n.svelte"
  import {renameStep} from "shared/projectUtils"
  import {Box, Pencil, Square, ChevronRight, Eye, EyeOff} from "lucide-static"

  const log = (function () { const context = "[BrowserTree.svelte]"; const color="cyan"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`)})() // prettier-ignore

  let bodies = $derived(store.realization.solids ? Object.entries(store.realization.solids) : [])
  let sketches = $derived(store.realization.sketches ? Object.entries(store.realization.sketches) : [])
  let planes = $derived(store.realization.planes ? Object.entries(store.realization.planes) : [])

  let bodiesOpen = $state(true)
  let sketchesOpen = $state(true)
  let planesOpen = $state(false)
  let treeVisible = $state(true)
  let showBottomFade = $state(false)
  let treeEl = $state<HTMLElement | null>(null)

  function onTreeScroll() {
    if (!treeEl) return
    showBottomFade = treeEl.scrollTop + treeEl.clientHeight < treeEl.scrollHeight - 8
  }

  // Inline rename state
  let renamingBody = $state<string | null>(null)
  let renamingSketch = $state<string | null>(null)
  let newName = $state("")

  function selectBody(name: string) {
    store.currentlySelected = [{id: name, type: "face"}]
    log("selected body:", name)
  }

  function startBodyRename(fullName: string) {
    renamingBody = fullName
    newName = fullName.replace(/:(\d+)$/, "")
  }

  function startSketchRename(oldName: string) {
    renamingSketch = oldName
    newName = oldName
  }

  function commitRename(oldName: string) {
    if (renamingBody !== oldName && renamingSketch !== oldName) return
    const trimmed = newName.trim()
    if (trimmed && trimmed !== oldName) {
      const idx = store.workbench.history.findIndex(s => s.name === oldName || oldName.startsWith(s.name + ":"))
      if (idx !== -1) {
        log("renaming step", idx, oldName, "→", trimmed)
        renameStep(idx, trimmed)
      } else {
        log("no history step found for", oldName)
      }
    }
    renamingBody = null
    renamingSketch = null
  }

  function cancelRename() {
    renamingBody = null
    renamingSketch = null
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
    class:fade-bottom={showBottomFade}
    bind:this={treeEl}
    onscroll={onTreeScroll}
    oncontextmenu={(e) => e.preventDefault()}
  >
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
      <span class="section-label">{tr().planes}</span>
      <span class="section-count">({planes.length})</span>
    </div>
    {#if planesOpen}
      <div class="section-items">
        {#each planes as [id, plane]}
          {@const selected = store.currentlySelected.some(e => e.id === id)}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="tree-item"
            class:selected
            onclick={() => selectPlane(id)}
            role="button"
            tabindex="0"
          >
            <span class="item-text">{plane.name}</span>
          </div>
        {/each}
        {#if planes.length === 0}
          <div class="tree-item empty-item">{tr().noPlanes}</div>
        {/if}
      </div>
    {/if}

    <!-- Divider -->
    <div class="divider"></div>

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
      <span class="section-label">{tr().bodies}</span>
      <span class="section-count">({bodies.length})</span>
    </div>
    {#if bodiesOpen}
      <div class="section-items">
        {#each bodies as [name, _solid]}
          {@const hidden = store.hiddenSolids.includes(name)}
          {@const selected = store.currentlySelected.some(e => e.id === name)}
          {@const isRenaming = renamingBody === name}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="tree-item"
            class:selected
            class:hidden-item={hidden}
            onclick={() => selectBody(name)}
            ondblclick={() => startBodyRename(name)}
            role="button"
            tabindex="0"
          >
            {#if isRenaming}
              <input
                class="rename-input"
                type="text"
                bind:value={newName}
                onkeydown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); commitRename(name) }
                  if (e.key === "Escape") { e.preventDefault(); cancelRename() }
                }}
                onblur={() => setTimeout(() => commitRename(name), 0)}
                autofocus
              />
            {:else}
              <span class="item-text">{name}</span>
            {/if}
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
          <div class="tree-item empty-item">{tr().noSolids}</div>
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
      <span class="section-label">{tr().sketches}</span>
      <span class="section-count">({sketches.length})</span>
    </div>
    {#if sketchesOpen}
      <div class="section-items">
        {#each sketches as [id, sketch]}
          {@const sketchName = sketch[2]}
          {@const hidden = store.hiddenSketches.includes(id)}
          {@const selected = store.currentlySelected.some(e => e.id === id)}
          {@const isRenaming = renamingSketch === sketchName}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="tree-item"
            class:selected
            class:hidden-item={hidden}
            onclick={() => selectSketch(id)}
            ondblclick={() => startSketchRename(sketchName)}
            role="button"
            tabindex="0"
          >
            {#if isRenaming}
              <input
                class="rename-input"
                type="text"
                bind:value={newName}
                onkeydown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); commitRename(sketchName) }
                  if (e.key === "Escape") { e.preventDefault(); cancelRename() }
                }}
                onblur={() => setTimeout(() => commitRename(sketchName), 0)}
                autofocus
              />
            {:else}
              <span class="item-text">{sketchName}</span>
            {/if}
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
          <div class="tree-item empty-item">{tr().noSketches}</div>
        {/if}
      </div>
    {/if}
  </div>


{/if}

<style>
  /*
   * Browser tree — fully transparent, dark text floating directly on the 3D scene.
   */
  .browser-tree {
    position: absolute;
    top: 16px;
    left: 16px;
    bottom: 48px;
    overflow-y: auto;




    z-index: 20;
    padding: 0;
    min-width: 160px;
    max-width: 220px;
    user-select: none;
    font-family: "Manrope", system-ui, sans-serif;
    font-size: 13px;
    line-height: 1.7;
    padding-right: 6px;

    --text-glow: 0 0 5px rgba(255, 255, 255, 0.45);
  }
  .browser-tree.fade-bottom {
    -webkit-mask-image: linear-gradient(to bottom, black 0%, black calc(100% - 48px), transparent 100%);
    mask-image: linear-gradient(to bottom, black 0%, black calc(100% - 48px), transparent 100%);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 2px 3px;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #000;
    text-shadow: var(--text-glow);
    transition: opacity 0.12s ease;
  }
  .section-header:hover {
    opacity: 0.85;
  }

  .chevron {
    width: 10px;
    height: 10px;
    display: block;
    flex-shrink: 0;
    transition: transform 0.12s ease;
    opacity: 0.35;
  }
  .chevron :global(svg) {
    width: 10px;
    height: 10px;
  }
  .chevron.rotated {
    transform: rotate(90deg);
  }

  .section-icon {
    width: 10px;
    height: 10px;
    display: block;
    flex-shrink: 0;
  }
  .section-icon :global(svg) {
    width: 10px;
    height: 10px;
  }

  .section-label {
  }

  .section-count {
    font-variant-numeric: tabular-nums;
    opacity: 0.35;
    font-size: 10px;
    margin-left: 2px;
  }

  .section-items {
    padding-left: 12px;
  }

  .tree-item {
    display: flex;
    align-items: center;
    padding: 2px 3px;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.78);
    text-shadow: var(--text-glow);
    transition: color 0.10s ease;
    white-space: nowrap;
  }
  .tree-item:hover {
    color: rgba(0, 0, 0, 0.95);
  }
  .tree-item.selected {
    color: rgb(30, 100, 220);
    text-shadow: 0 0 6px rgba(66, 133, 244, 0.35), var(--text-glow);
  }
  .tree-item.hidden-item {
    color: rgba(0, 0, 0, 0.25);
    text-shadow: 0 0 3px rgba(255, 255, 255, 0.3);
  }
  .rename-input {
    font-family: inherit;
    font-size: inherit;
    color: rgba(0, 0, 0, 0.85);
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 2px;
    padding: 0 2px;
    width: 100%;
    outline: none;
    text-shadow: var(--text-glow);
  }
  .rename-input:focus {
    border-color: rgba(66, 133, 244, 0.5);
    background: rgba(255, 255, 255, 0.7);
  }
  .tree-item.empty-item {
    color: rgba(0, 0, 0, 0.32);
    cursor: default;
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
    width: 12px;
    height: 12px;
    display: block;
    opacity: 0.40;
    transition: opacity 0.10s ease;
  }
  .icon-block :global(svg) {
    width: 12px;
    height: 12px;
  }
  .icon-block:hover {
    opacity: 0.80;
  }

  .divider {
    height: 0;
    margin: 2px 2px;
  }

  .browser-tree::-webkit-scrollbar {
    width: 6px;
  }
  .browser-tree::-webkit-scrollbar-track {
    background: transparent;
  }
  .browser-tree::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 2px;
    transition: background 0.15s ease;
  }
  .browser-tree:hover::-webkit-scrollbar-thumb {
    background: rgba(128, 128, 128, 0.35);
  }
  .browser-tree::-webkit-scrollbar-thumb:hover {
    background: rgba(128, 128, 128, 0.5);
  }
</style>
