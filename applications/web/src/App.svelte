<script lang="ts">
  import {store} from "shared/stores.svelte"
  import {default as init, Project as WasmProject} from "cadmium"
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
      // Directly sync project/workbench/realization instead of relying on $effect.root
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
      // Extract persistence data from JSON wrapper
      let jsonToLoad = newFileContent
      try {
        const parsed = JSON.parse(newFileContent)
        store.hiddenSketches = parsed.__cadmium_hiddenSketches || []
        store.hiddenSolids = parsed.__cadmium_hiddenSolids || []
        delete parsed.__cadmium_hiddenSketches
        delete parsed.__cadmium_hiddenSolids
        jsonToLoad = JSON.stringify(parsed)
      } catch {
        store.hiddenSketches = []
        store.hiddenSolids = []
      }
      const newWasmProject = WasmProject.from_json(jsonToLoad)
      store.wasmProject = newWasmProject
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
  <div class="flex">
    <MainDisplay />
  </div>
  <BottomBar />
</div>
