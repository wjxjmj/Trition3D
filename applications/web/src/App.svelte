<script lang="ts">
  import {store} from "shared/stores.svelte"
  import {default as init, Project as WasmProject} from "cadmium"
  import {isTauriMode, init as bridgeInit, projectNewAsync, projectToJsonAsync, getWorkbenchAsync, getRealizationJsonAsync} from "shared/cadmiumBridge"
  import AppBar from "./components/AppBar.svelte"
  import BottomBar from "./components/BottomBar.svelte"
  import MainDisplay from "./components/MainDisplay.svelte"
  import ToolBar from "./components/ToolBar.svelte"

  const log = (function () { const context = "[App.svelte]"; const color="gray"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`)})() // prettier-ignore

  const userName = "mattferraro.dev"
  let newFileContent: string | null = $state(null)

  $effect(() => {
    const startProject = async () => {
      await bridgeInit()
      log('Bridge ready, tauri mode:', isTauriMode())

      if (isTauriMode()) {
        // Tauri native: project lives in Rust memory
        await projectNewAsync("First Project")
        store.project = JSON.parse(await projectToJsonAsync())
        store.workbenchIndex = 0
        store.workbench = JSON.parse(await getWorkbenchAsync(0))
        const realJson = await getRealizationJsonAsync(0, 1000)
        store.realization = JSON.parse(realJson)
      } else {
        // WASM mode: traditional path
        await init()
        store.wasmProject = new WasmProject("First Project")
        store.project = JSON.parse(store.wasmProject.to_json())
        store.workbenchIndex = 0
        store.workbench = JSON.parse(store.wasmProject.get_workbench(0))
        store.wasmRealization = store.wasmProject.get_realization(0, store.featureIndex + 1)
        store.realization = JSON.parse(store.wasmRealization.to_json())
      }
      log('Project synced:', store.project.name)
    }
    startProject().catch(err => {
      console.error("[App.svelte] Init failed:", err)
    })
  })

  $effect(() => {
    if (newFileContent) {
      log("[newFileContent] received new file")
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
      if (isTauriMode()) {
        import("shared/cadmiumBridge").then(({projectFromJsonAsync}) => {
          projectFromJsonAsync(jsonToLoad).then(() => {
            store.projectIsStale = true
          })
        })
      } else {
        store.wasmProject = WasmProject.from_json(jsonToLoad)
        store.projectIsStale = true
      }
      newFileContent = null
    }
  })

  $effect(() => {
    if (store.projectIsStale) {
      if (isTauriMode()) {
        projectToJsonAsync().then(json => {
          store.project = JSON.parse(json)
          store.workbenchIndex = 0
          store.workbenchIsStale = true
          store.projectIsStale = false
        })
      } else {
        store.project = JSON.parse(store.wasmProject.to_json())
        store.workbenchIndex = 0
        store.workbenchIsStale = true
        store.projectIsStale = false
      }
    }
  })

  $effect(() => {
    if (store.workbenchIsStale) {
      if (isTauriMode()) {
        getWorkbenchAsync(store.workbenchIndex).then(json => {
          store.workbench = JSON.parse(json)
          store.workbenchIsStale = false
          store.realizationIsStale = true
        })
      } else {
        store.workbench = JSON.parse(store.wasmProject.get_workbench(store.workbenchIndex))
        store.workbenchIsStale = false
        store.realizationIsStale = true
      }
    }
  })

  $effect(() => {
    if (store.realizationIsStale) {
      if (isTauriMode()) {
        getRealizationJsonAsync(store.workbenchIndex, 1000).then(json => {
          store.realization = JSON.parse(json)
          store.realizationIsStale = false
        })
      } else {
        store.wasmRealization = store.wasmProject.get_realization(store.workbenchIndex, 1000)
        store.realization = JSON.parse(store.wasmRealization.to_json())
        store.realizationIsStale = false
      }
    }
  })

  $effect(() => {
    if (isTauriMode()) {
      store.featureIndex
      store.workbenchIsStale = true
    } else {
      store.featureIndex
      store.wasmProject["get_workbench"] && (store.workbenchIsStale = true)
    }
  })
</script>

<div class="w-[100vw] h-[100vh] block" style="overflow: hidden;">
  <AppBar {userName} project={store.project} onnewFileContent={(v) => newFileContent = v} />
  <ToolBar />
  <div class="flex">
    <MainDisplay />
  </div>
  <BottomBar />
</div>
