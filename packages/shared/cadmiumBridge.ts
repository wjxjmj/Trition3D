/**
 * Bridge that abstracts CADmium backend — WASM (web) or Tauri native (desktop).
 * The bridge stores the full project JSON and passes it to native commands.
 */

import {default as wasmInit, Project as WasmProject, Realization as WasmRealization, Message} from "cadmium"

// prettier-ignore
const log = (function () { const context = "[cadmiumBridge]"; const color = "teal"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`) })()

let isTauri = !!(window as any).__TAURI_INTERNALS__

let projectJson: string | null = null
let wasmProject: WasmProject | null = null
let wasmInitialized = false

// --- Initialization ---

export async function initBridge(): Promise<void> {
  if (isTauri) {
    log("Running in Tauri native mode")
  } else {
    await wasmInit()
    wasmInitialized = true
    log("Running in WASM mode")
  }
}

// --- Project ---

export function projectNew(name: string): string {
  if (isTauri) {
    // Synchronous in Tauri: we queue the async call and return a placeholder
    // The actual project JSON is set asynchronously
    ;(window as any).__TAURI_INTERNALS__?.invoke("project_new", { name }).then((json: string) => {
      projectJson = json
    })
    return ""
  } else {
    wasmProject = new WasmProject(name)
    projectJson = wasmProject.to_json()
    return projectJson
  }
}

export async function projectNewAsync(name: string): Promise<string> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    projectJson = await invoke("project_new", { name })
    return projectJson
  } else {
    wasmProject = new WasmProject(name)
    projectJson = wasmProject.to_json()
    return projectJson
  }
}

export function projectFromJson(json: string): string {
  if (isTauri) {
    ;(window as any).__TAURI_INTERNALS__?.invoke("project_from_json", { json }).then((result: string) => {
      projectJson = result
    })
    return ""
  } else {
    wasmProject = WasmProject.from_json(json)
    projectJson = wasmProject.to_json()
    return projectJson
  }
}

export async function projectFromJsonAsync(json: string): Promise<string> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    projectJson = await invoke("project_from_json", { json })
    return projectJson
  } else {
    wasmProject = WasmProject.from_json(json)
    projectJson = wasmProject.to_json()
    return projectJson
  }
}

export async function projectToJson(): Promise<string> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    return await invoke("project_to_json", { projectJson })
  } else {
    return wasmProject!.to_json()
  }
}

// --- Message handling ---

export async function sendMessage(message: Message): Promise<{ success: boolean; data: string }> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    const result: string = await invoke("project_send_message", {
      projectJson,
      messageJson: JSON.stringify(message),
    })
    const parsed = JSON.parse(result)
    projectJson = JSON.parse(parsed.project)
    return { success: true, data: parsed.result }
  } else {
    const result = wasmProject!.send_message(message)
    projectJson = wasmProject!.to_json()
    return { success: typeof result === "string" || (result as any).success !== undefined, data: typeof result === "string" ? result : JSON.stringify(result) }
  }
}

// --- Workbench & Realization ---

export async function getWorkbench(index: number): Promise<string> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    return await invoke("project_get_workbench", { projectJson, index })
  } else {
    return wasmProject!.get_workbench(index)
  }
}

export async function getRealization(workbenchId: number, maxSteps: number): Promise<string> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    return await invoke("project_get_realization", {
      projectJson,
      workbenchId,
      maxSteps,
    })
  } else {
    const realized = wasmProject!.get_realization(workbenchId, maxSteps)
    return realized.to_json()
  }
}

// --- Export ---

export async function solidToObj(realizationJson: string, solidName: string, tolerance: number): Promise<string> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    return await invoke("solid_to_obj", { realizationJson, solidName, tolerance })
  } else {
    const r = new WasmRealization(/* need to pass the wasm realization */)
    // Fallback to WASM path
    return ""
  }
}

export async function solidToStep(realizationJson: string, solidName: string): Promise<string> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    return await invoke("solid_to_step", { realizationJson, solidName })
  } else {
    return ""
  }
}

// --- Utility ---

export function getProjectJson(): string | null {
  return projectJson
}

export function setProjectJson(json: string): void {
  projectJson = json
}
