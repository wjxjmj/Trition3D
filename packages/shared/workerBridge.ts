/**
 * Worker-based WASM bridge — offloads CADmium computation to a Web Worker.
 * The main thread sends commands, the Worker processes them asynchronously.
 * Uses a simple request/response pattern with auto-incrementing message IDs.
 */

import type {Message} from "trition3d"

type PendingPromise = {
  resolve: (value: any) => void
  reject: (reason: any) => void
}

let worker: Worker | null = null
let msgId = 0
const pending = new Map<number, PendingPromise>()

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(
      new URL("../applications/web/src/worker/trition3d.worker.ts", import.meta.url),
      { type: "module" }
    )
    worker.onmessage = (e: MessageEvent) => {
      const { id, result, error } = e.data
      const p = pending.get(id)
      if (p) {
        pending.delete(id)
        if (error) p.reject(new Error(error))
        else p.resolve(result)
      }
    }
  }
  return worker
}

function sendCommand<T = any>(cmd: string, args: Record<string, any> = {}): Promise<T> {
  const w = getWorker()
  const id = ++msgId
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    w.postMessage({ id, cmd, args })
  })
}

// --- Public API ---

export function projectNew(name: string): Promise<string> {
  return sendCommand<string>("project_new", { name })
}

export function projectFromJson(json: string): Promise<string> {
  return sendCommand<string>("project_from_json", { json })
}

export function projectToJson(): Promise<string> {
  return sendCommand<string>("project_to_json")
}

export function sendMessage(message: Message): Promise<{ project: string; result: any }> {
  return sendCommand("send_message", { message })
}

export function getWorkbench(index: number): Promise<string> {
  return sendCommand<string>("get_workbench", { index })
}

export function getRealization(workbenchId: number, maxSteps: number): Promise<string> {
  return sendCommand<string>("get_realization", { workbenchId, maxSteps })
}

export function solidToObj(solidName: string, tolerance: number, workbenchId: number): Promise<string> {
  return sendCommand<string>("solid_to_obj", { solidName, tolerance, workbenchId })
}

export function solidToStep(solidName: string, workbenchId: number): Promise<string> {
  return sendCommand<string>("solid_to_step", { solidName, workbenchId })
}

export function terminateWorker() {
  worker?.terminate()
  worker = null
}
