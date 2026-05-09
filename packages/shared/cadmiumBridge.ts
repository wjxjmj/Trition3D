/**
 * Bridge that abstracts CADmium backend — WASM (web) or Tauri native (desktop).
 * In WASM mode: uses the `cadmium` WASM package (synchronous).
 * In Tauri mode: uses `invoke()` to call Rust commands — project lives in Rust memory.
 */

import {default as wasmInit, Project as WasmProject, Realization as WasmRealization, type Message} from "cadmium"

let isTauri = !!(window as any).__TAURI_INTERNALS__

let wasmProject: WasmProject | null = null
let wasmRealization: WasmRealization | null = null
let wasmInitialized = false

export function isTauriMode(): boolean {
  return isTauri
}

export async function init(): Promise<void> {
  if (isTauri) return
  await wasmInit()
  wasmInitialized = true
}

// --- Project ---

export function projectNew(name: string): void {
  if (isTauri) return
  wasmProject = new WasmProject(name)
}

export async function projectNewAsync(name: string): Promise<string> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    return await invoke<string>("project_new", { name })
  }
  wasmProject = new WasmProject(name)
  return wasmProject.to_json()
}

export function projectFromJson(json: string): void {
  if (isTauri) return
  wasmProject = WasmProject.from_json(json)
}

export async function projectFromJsonAsync(json: string): Promise<string> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    return await invoke<string>("project_from_json", { json })
  }
  wasmProject = WasmProject.from_json(json)
  return wasmProject.to_json()
}

export function projectToJson(): string {
  return wasmProject?.to_json() || ""
}

export async function projectToJsonAsync(): Promise<string> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    return await invoke<string>("project_to_json")
  }
  return wasmProject?.to_json() || ""
}

// --- Message handling ---

export function sendMessage(message: Message): any {
  return wasmProject!.send_message(message)
}

export async function sendMessageAsync(message: Message): Promise<any> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    const resultJson = await invoke<string>("project_send_message", {
      messageJson: JSON.stringify(message),
    })
    return JSON.parse(resultJson)
  }
  return wasmProject!.send_message(message)
}

// --- Workbench & Realization ---

export function getWorkbench(index: number): string {
  return wasmProject!.get_workbench(index)
}

export async function getWorkbenchAsync(index: number): Promise<string> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    return await invoke<string>("project_get_workbench", { index })
  }
  return wasmProject!.get_workbench(index)
}

export function getRealization(workbenchId: number, maxSteps: number): WasmRealization | null {
  wasmRealization = wasmProject!.get_realization(workbenchId, maxSteps)
  return wasmRealization
}

export function getRealizationJson(): string {
  return wasmRealization?.to_json() || ""
}

export async function getRealizationJsonAsync(workbenchId: number, maxSteps: number): Promise<string> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    return await invoke<string>("project_get_realization", {
      workbenchId,
      maxSteps,
    })
  }
  wasmRealization = wasmProject!.get_realization(workbenchId, maxSteps)
  return wasmRealization.to_json()
}

// --- Export ---

export async function solidToObjAsync(solidName: string, tolerance: number): Promise<string> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    return await invoke<string>("solid_to_obj", { solidName, tolerance })
  }
  return wasmRealization?.solid_to_obj(solidName, tolerance) || ""
}

export async function solidToStepAsync(solidName: string): Promise<string> {
  if (isTauri) {
    const { invoke } = await import("@tauri-apps/api/core")
    return await invoke<string>("solid_to_step", { solidName })
  }
  return wasmRealization?.solid_to_step(solidName) || ""
}

// --- Utility ---

export function getWasmProject(): WasmProject | null {
  return wasmProject
}

export function hasWasmProject(): boolean {
  return wasmProject !== null
}
