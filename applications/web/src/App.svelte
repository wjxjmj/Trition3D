<script lang="ts">
  import {store} from "shared/stores.svelte"
  import {default as init, Project as WasmProject} from "trition3d"
  import AppBar from "./components/AppBar.svelte"
  import BottomBar from "./components/BottomBar.svelte"
  import MainDisplay from "./components/MainDisplay.svelte"
  import ToolBar from "./components/ToolBar.svelte"

  const log = (function () { const context = "[App.svelte]"; const color="gray"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`)})() // prettier-ignore

  const userName = "mattferraro.dev"
  let newFileContent: string | null = $state(null)

  $effect(() => {
    init().then(() => {
      log('WASM initialized, creating project')
      store.wasmProject = new WasmProject("First Project")
      store.project = JSON.parse(store.wasmProject.to_json())
      store.workbenchIndex = 0
      store.workbench = JSON.parse(store.wasmProject.get_workbench(0))
      store.wasmRealization = store.wasmProject.get_realization(0, store.featureIndex + 1)
      store.realization = JSON.parse(store.wasmRealization.to_json())
      log('Project synced:', store.project.name)
    }).catch(err => {
      console.error("[App.svelte] WASM init failed:", err)
    })
  })

  $effect(() => {
    if (newFileContent) {
      log("[newFileContent] received new file")
      let jsonToLoad = newFileContent
      try {
        const parsed = JSON.parse(newFileContent)
        store.hiddenSketches = parsed.__trition3d_hiddenSketches || []
        store.hiddenSolids = parsed.__trition3d_hiddenSolids || []
        delete parsed.__trition3d_hiddenSketches
        delete parsed.__trition3d_hiddenSolids
        jsonToLoad = JSON.stringify(parsed)
      } catch {
        store.hiddenSketches = []
        store.hiddenSolids = []
      }
      store.wasmProject = WasmProject.from_json(jsonToLoad)
      store.projectIsStale = true
      newFileContent = null
    }
  })

  $effect(() => {
    if (store.projectIsStale) {
      store.project = JSON.parse(store.wasmProject.to_json())
      store.workbenchIndex = 0
      store.workbenchIsStale = true
      store.projectIsStale = false
    }
  })

  $effect(() => {
    if (store.workbenchIsStale) {
      store.workbench = JSON.parse(store.wasmProject.get_workbench(store.workbenchIndex))
      store.workbenchIsStale = false
      store.realizationIsStale = true
    }
  })

  $effect(() => {
    if (store.realizationIsStale) {
      store.wasmRealization = store.wasmProject.get_realization(store.workbenchIndex, 1000)
      store.realization = JSON.parse(store.wasmRealization.to_json())
      store.realizationIsStale = false
    }
  })

  $effect(() => { store.featureIndex; store.wasmProject["get_workbench"] && (store.workbenchIsStale = true) })
</script>

<div class="w-[100vw] h-[100vh] block" style="overflow: hidden;">
  <AppBar {userName} project={store.project} onnewFileContent={(v) => newFileContent = v} />
  <ToolBar />
  <MainDisplay />
  <BottomBar />
</div>

<style>
  :global(.feature-pill) {
    display: flex;
    align-items: center;
    border-radius: 4px;
    padding: 1px 4px;
    flex-shrink: 0;
    font-size: 13px;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.78);
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.4);
    transition: background 0.08s ease;
  }
  :global(.feature-pill:hover) {
    background: rgba(255, 255, 255, 0.15);
  }
  :global(.dark .feature-pill) {
    color: rgba(255, 255, 255, 0.78);
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
  }
  :global(.dark .feature-pill:hover) {
    background: rgba(255, 255, 255, 0.06);
  }
</style>
