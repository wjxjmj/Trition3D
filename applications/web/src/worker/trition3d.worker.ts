/**
 * Web Worker for CADmium WASM computation.
 * Loads the WASM module and exposes a message-based API.
 * Main thread sends requests, Worker computes and returns results.
 */
import {default as init, Project as WasmProject, Realization as WasmRealization, type Message} from "trition3d"

let wasmReady = false
let project: WasmProject | null = null

async function ensureWasm() {
  if (!wasmReady) {
    await init()
    wasmReady = true
  }
}

self.onmessage = async (e: MessageEvent) => {
  const { id, cmd, args } = e.data

  try {
    await ensureWasm()

    let result: any
    switch (cmd) {
      case "project_new": {
        project = new WasmProject(args.name)
        result = project.to_json()
        break
      }
      case "project_from_json": {
        project = WasmProject.from_json(args.json)
        result = project.to_json()
        break
      }
      case "project_to_json": {
        result = project!.to_json()
        break
      }
      case "send_message": {
        const msg: Message = args.message
        const msgResult = project!.send_message(msg)
        result = { project: project!.to_json(), result: msgResult }
        break
      }
      case "get_workbench": {
        result = project!.get_workbench(args.index)
        break
      }
      case "get_realization": {
        const real = project!.get_realization(args.workbenchId, args.maxSteps)
        result = real.to_json()
        break
      }
      case "solid_to_obj": {
        const real = project!.get_realization(args.workbenchId, 1000)
        result = real.solid_to_obj(args.solidName, args.tolerance)
        break
      }
      case "solid_to_step": {
        const real = project!.get_realization(args.workbenchId, 1000)
        result = real.solid_to_step(args.solidName)
        break
      }
      default:
        throw new Error(`Unknown command: ${cmd}`)
    }

    self.postMessage({ id, result })
  } catch (err: any) {
    self.postMessage({ id, error: err.message || String(err) })
  }
}
