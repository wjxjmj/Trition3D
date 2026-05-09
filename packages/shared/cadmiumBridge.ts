/**
 * Bridge that abstracts CADmium backend — WASM (web) or Tauri native (desktop).
 * In WASM mode: uses the `cadmium` WASM package directly (synchronous).
 * In Tauri mode: uses `invoke()` to call Rust commands (async).
 *
 * Stores the project state as a JSON string bridged between JS and Rust.
 */

import {default as wasmInit, Project as WasmProject, Realization as WasmRealization, type Message} from "cadmium"

let isTauri = !!(window as any).__TAURI_INTERNALS__

let projectJson: string | null = null
let wasmProject: WasmProject | null = null
let wasmRealization: WasmRealization | null = null
let wasmInitialized = false

export function isTauriMode(): boolean {
  return isTauri
}

export async function init(): Promise<void> {
  if (isTauri) {
    // Tauri mode: no WASM init needed, Rust commands handle everything
    return
  }
  await wasmInit()
  wasmInitialized = true
}

// --- Project ---

export function projectNew(name: string): void {
  if (isTauri) {
    // Tauri: queue async creation (caller should use async version)
    return
  }
  wasmProject = new WasmProject(name)
  projectJson = wasmProject.to_json()
}

export async function projectNewAsync(name: string): Promise<void> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    projectJson = await invoke<string>("project_new", { name })
    return
  }
  wasmProject = new WasmProject(name)
  projectJson = wasmProject.to_json()
}

export function projectFromJson(json: string): void {
  if (isTauri) {
    return // use async version
  }
  wasmProject = WasmProject.from_json(json)
  projectJson = wasmProject.to_json()
}

export async function projectFromJsonAsync(json: string): Promise<void> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    projectJson = await invoke<string>("project_from_json", { json })
    return
  }
  wasmProject = WasmProject.from_json(json)
  projectJson = wasmProject.to_json()
}

export function projectToJson(): string {
  if (isTauri) {
    return projectJson || ""
  }
  return wasmProject?.to_json() || ""
}

// --- Message handling ---

export function sendMessage(message: Message): any {
  if (isTauri) {
    // Messages go through async path
    return { success: false }
  }
  return wasmProject!.send_message(message)
}

export async function sendMessageAsync(message: Message): Promise<any> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    const result = await invoke<string>("project_send_message", {
      projectJson,
      messageJson: JSON.stringify(message),
    })
    const parsed = JSON.parse(result)
    projectJson = JSON.parse(parsed.project)
    return parsed.result
  }
  const result = wasmProject!.send_message(message)
  projectJson = wasmProject!.to_json()
  return result
}

// --- Workbench & Realization ---

export function getWorkbench(index: number): string {
  if (isTauri) return ""
  return wasmProject!.get_workbench(index)
}

export async function getWorkbenchAsync(index: number): Promise<string> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    return await invoke<string>("project_get_workbench", { projectJson, index })
  }
  return wasmProject!.get_workbench(index)
}

export function getRealization(workbenchId: number, maxSteps: number): WasmRealization | null {
  if (isTauri) return null
  wasmRealization = wasmProject!.get_realization(workbenchId, maxSteps)
  return wasmRealization
}

export function getRealizationJson(): string {
  if (isTauri) return ""
  return wasmRealization?.to_json() || ""
}

export async function getRealizationJsonAsync(workbenchId: number, maxSteps: number): Promise<string> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    return await invoke<string>("project_get_realization", {
      projectJson,
      workbenchId,
      maxSteps,
    })
  }
  wasmRealization = wasmProject!.get_realization(workbenchId, maxSteps)
  return wasmRealization.to_json()
}

// --- Export ---

export function solidToObj(realizationJson: string, solidName: string, tolerance: number): string {
  if (isTauri || !wasmRealization) return ""
  return wasmRealization.solid_to_obj(solidName, tolerance)
}

export async function solidToObjAsync(realizationJson: string, solidName: string, tolerance: number): Promise<string> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    return await invoke<string>("solid_to_obj", { realizationJson, solidName, tolerance })
  }
  return wasmRealization?.solid_to_obj(solidName, tolerance) || ""
}

export function solidToStep(realizationJson: string, solidName: string): string {
  if (isTauri || !wasmRealization) return ""
  return wasmRealization.solid_to_step(solidName)
}

export async function solidToStepAsync(realizationJson: string, solidName: string): Promise<string> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    return await invoke<string>("solid_to_step", { realizationJson, solidName })
  }
  return wasmRealization?.solid_to_step(solidName) || ""
}

// --- Utility ---

export function getProjectJson(): string | null {
  return projectJson
}

export function setProjectJson(json: string): void {
  projectJson = json
}

export function getWasmProject(): WasmProject | null {
  return wasmProject
}

export function hasWasmProject(): boolean {
  return wasmProject !== null
}
