import {store} from "./stores.svelte"
import {isTauriMode, sendMessageAsync, getWorkbenchAsync, getRealizationJsonAsync, getWasmProject} from "./cadmiumBridge"
import {Vector2, Vector3, type Vector2Like} from "three"
import {resetToolState} from "./stores.svelte"
import type {
  Entity,
  ExtrusionHistoryStep,
  HistoryStep,
  MessageHistory,
  PlaneHistoryStep,
  PointHistoryStep,
  SketchHistoryStep,
  WithTarget,
  WorkBench,
} from "./types"
import type {Realization as WasmRealization, Message} from "cadmium"
import {
  isDeleteArcs,
  isDeleteCircles,
  isDeleteLines,
  isNewCircleBetweenPoints,
  isNewExtrusion,
  isNewLineOnSketch,
  isNewPointOnSketch2,
  isNewRectangleBetweenPoints,
  isNewSketchOnPlane,
  isRenameProject,
  isRenameStep,
  isRenameWorkbench,
  isSetSketchPlane,
  isUpdateExtrusion,
} from "./typeGuards"

// prettier-ignore
const log = (function () { const context = "[projectUtils.ts]"; const color = "aqua"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`) })()

export const CIRCLE_TOLERANCE = 0.05

export function isPoint(feature: HistoryStep): feature is PointHistoryStep {
  return feature.data.type === "Point"
}
export function isPlane(feature: HistoryStep): feature is PlaneHistoryStep {
  return feature.data.type === "Plane"
}
export function isExtrusion(feature: HistoryStep): feature is ExtrusionHistoryStep {
  return feature.data.type === "Extrusion"
}
export function isSketch(feature: HistoryStep): feature is SketchHistoryStep {
  return feature.data.type === "Sketch"
}

export function arraysEqual(a: any[], b: any[]) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

function sendWasmMessage(message: Message): any {
  if (isTauriMode()) {
    // Tauri async path: fire message, sync state when complete
    // Note: full native mode requires async-await throughout call chain
    sendMessageAsync(message).then((r: any) => {
      log("[sendWasmMessage][Tauri] reply:", r)
      store.messageHistory = [...store.messageHistory, {message, result: r}]
      store.workbenchIsStale = true
    })
    // Return placeholder — callers that parse result will need async adaptation
    return { success: '{"id":"0"}', id: "0" }
  }
  let wp = store.wasmProject
  log("[sendWasmMessage] sending message:", message)
  let result = wp.send_message(message)
  log("[sendWasmMessage] reply:", result)
  store.messageHistory = [...store.messageHistory, {message, result}]
  return result
}

export function updateExtrusion(extrusionId: string, sketchId: string, length: number, faceIds: string[]) {
  const message: Message = {
    UpdateExtrusion: {
      workbench_id: store.workbenchIndex,
      sketch_id: sketchId,
      face_ids: faceIds.map(id => +id),
      length,
      offset: 0.0,
      extrusion_name: "Extra",
      direction: "Normal",
      extrusion_id: extrusionId,
    },
  }
  const isValid = checkWasmMessage(message)
  const hasFaceIds = notEmpty(message.UpdateExtrusion.face_ids)
  if (isValid) {
    sendWasmMessage(message)
    store.workbenchIsStale = true
    if (hasFaceIds) {
      log("[updateExtrusion]", "[checkWasmMessage]", "is valid,", "sending message...", message)
    } else log("[updateExtrusion]", "[checkWasmMessage]", "is valid,", "but face_ids is empty,", "NOT sending message:", message)
  } else log("[updateExtrusion]", "[checkWasmMessage]", "is bogus,", "abort message send!", message)
}

export function setSketchPlane(sketchId: string, planeId: string) {
  const message: Message = {
    SetSketchPlane: {
      workbench_id: store.workbenchIndex,
      sketch_id: sketchId,
      plane_id: planeId,
    },
  }
  checkWasmMessage(message)
  sendWasmMessage(message)
  store.workbenchIsStale = true
}

export function newSketchOnPlane() {
  const message: Message = {
    NewSketchOnPlane: {
      workbench_id: store.workbenchIndex,
      plane_id: "",
      sketch_name: "",
    },
  }
  checkWasmMessage(message)
  sendWasmMessage(message)
  store.workbenchIsStale = true
}

export function newExtrusion() {
  const bench: WorkBench = store.workbench

  let sketchId = null
  for (let step of bench.history) {
    if (step.data.type === "Sketch") {
      sketchId = step.unique_id
    }
  }
  if (sketchId === null) {
    log("No sketch found in history")
    return
  }

  const message: Message = {
    NewExtrusion: {
      workbench_id: store.workbenchIndex,
      sketch_id: sketchId,
      face_ids: [],
      length: 25,
      offset: 0.0,
      extrusion_name: "",
      direction: "Normal",
    },
  }

  checkWasmMessage(message)
  sendWasmMessage(message)
  store.workbenchIsStale = true
}

export function deleteEntities(sketchIdx: string, selection: Entity[]) {
  const workbenchIdx = store.workbenchIndex

  const lines = selection.filter(e => e.type === "line")
  const arcs = selection.filter(e => e.type === "arc")
  const circles = selection.filter(e => e.type === "circle")

  const lineIds = reduceToInts(
    lines.map(e => e.id),
    (id: any) => console.error(`[deleteEntities] line id is not an int: ${id}`),
  )
  const arcIds = reduceToInts(
    arcs.map(e => e.id),
    (id: any) => console.error(`[deleteEntities] arc id is not an int: ${id}`),
  )
  const circleIds = reduceToInts(
    circles.map(e => e.id),
    (id: any) => console.error(`[deleteEntities] circle id is not an int: ${id}`),
  )

  if (notEmpty(lineIds)) deleteLines(workbenchIdx, sketchIdx, lineIds)
  if (notEmpty(arcIds)) deleteArcs(workbenchIdx, sketchIdx, arcIds)
  if (notEmpty(circleIds)) deleteCircles(workbenchIdx, sketchIdx, circleIds)

  store.workbenchIsStale = true
}

function deleteLines(workbenchIdx: number, sketchIdx: string, lineIds: number[]) {
  const message: Message = {
    DeleteLines: {
      workbench_id: workbenchIdx,
      sketch_id: sketchIdx,
      line_ids: lineIds,
    },
  }
  checkWasmMessage(message)
  sendWasmMessage(message)
}

function deleteArcs(workbenchIdx: number, sketchIdx: string, arcIds: number[]) {
  const message: Message = {
    DeleteArcs: {
      workbench_id: workbenchIdx,
      sketch_id: sketchIdx,
      arc_ids: arcIds,
    },
  }
  checkWasmMessage(message)
  sendWasmMessage(message)
}

function deleteCircles(workbenchIdx: number, sketchIdx: string, circleIds: number[]) {
  const message: Message = {
    DeleteCircles: {
      workbench_id: workbenchIdx,
      sketch_id: sketchIdx,
      circle_ids: circleIds,
    },
  }
  checkWasmMessage(message)
  sendWasmMessage(message)
}

export function addRectangleBetweenPoints(sketchIdx: string, point1: number, point2: number) {
  log("[addRectangleBetweenPoints] sketchIdx, point1, point2", sketchIdx, point1, point2)
  const message: Message = {
    NewRectangleBetweenPoints: {
      workbench_id: store.workbenchIndex,
      sketch_id: sketchIdx,
      start_id: point1,
      end_id: point2,
    },
  }
  checkWasmMessage(message)
  sendWasmMessage(message)
  store.workbenchIsStale = true
}

export function addCircleBetweenPoints(sketchIdx: string, point1: string, point2: string) {
  log("[addCircleBetweenPoints]", "sketchIdx:", sketchIdx, "point1:", point1, "point2", point2)

  const p1Valid = isStringInt(point1, id => console.error("[projectUtils.ts] [addCircleBetweenPoints]", "id is not an int:", id))
  const p2Valid = isStringInt(point2, id => console.error("[projectUtils.ts] [addCircleBetweenPoints]", "id is not an int:", id))

  if (!p1Valid || !p2Valid) return

  const message: Message = {
    NewCircleBetweenPoints: {
      workbench_id: store.workbenchIndex,
      sketch_id: sketchIdx,
      center_id: parseInt(point1, 10),
      edge_id: parseInt(point2, 10),
    },
  }
  checkWasmMessage(message)
  sendWasmMessage(message)
  store.workbenchIsStale = true
}

export function addLineToSketch(sketchIdx: string, point1: number, point2: number) {
  const message: Message = {
    NewLineOnSketch: {
      workbench_id: store.workbenchIndex,
      sketch_id: sketchIdx,
      start_point_id: point1,
      end_point_id: point2,
    },
  }
  checkWasmMessage(message)
  sendWasmMessage(message)
  store.workbenchIsStale = true
}

export function addPointToSketch(sketchIdx: string, point: Vector2Like, hidden: boolean) {
  log("[addPointToSketch] sketchIdx, point, hidden", sketchIdx, point, hidden)
  const message: Message = {
    NewPointOnSketch2: {
      workbench_id: store.workbenchIndex,
      sketch_id: sketchIdx,
      x: point.x,
      y: point.y,
      hidden: hidden,
    },
  }
  checkWasmMessage(message)
  const reply = sendWasmMessage(message)

  if (!reply.success) console.error("ERROR [projectUtils.ts addPointToSketch sendWasmMessage]", "message:", message, "reply:", reply)

  store.workbenchIsStale = true
  return JSON.parse(reply.success).id
}

export function renameStep(stepIdx: number, newName: string): void {
  log("[renameStep] stepIdx, newName", stepIdx, newName)
  const message: Message = {
    RenameStep: {
      workbench_id: store.workbenchIndex,
      step_id: stepIdx,
      new_name: newName,
    },
  }
  checkWasmMessage(message)
  sendWasmMessage(message)
}

export function renameWorkbench(newName: string): void {
  log("[renameWorkbench] newName", newName)
  const message: Message = {
    RenameWorkbench: {
      workbench_id: store.workbenchIndex,
      new_name: newName,
    },
  }
  checkWasmMessage(message)
  sendWasmMessage(message)
}

export function renameProject(newName: string): void {
  log("[renameProject] newName", newName)
  const message: Message = {
    RenameProject: {
      new_name: newName,
    },
  }
  checkWasmMessage(message)
  sendWasmMessage(message)
}

export function getObjectString(solidId: string): string {
  const wasmReal = store.wasmRealization
  const objString = wasmReal.solid_to_obj(solidId, 0.1)
  return objString
}

export function readFile(e: WithTarget<Event, HTMLInputElement>): void {
  const target = e.target as HTMLInputElement
  const file = target.files![0]
  const reader = new FileReader()
  reader.onload = function (e) {
    // log("[readFile] file contents", e.target?.result)
  }
  reader.readAsText(file)
}

export function arcToPoints(center: Vector2, start: Vector2, end: Vector2, clockwise: boolean = false): Vector2[] {
  const tolerance = CIRCLE_TOLERANCE
  const radius = start.distanceTo(center)
  const k = tolerance / radius
  let n = Math.ceil(Math.PI / Math.sqrt(2 * k))
  const segmentAngle = (2 * Math.PI) / n
  const segmentLength = radius * segmentAngle
  if (clockwise) n = -n

  const startAngle = Math.atan2(start.y - center.y, start.x - center.x)

  const lineVertices = []
  lineVertices.push(start.clone())
  for (let i = 1; i <= Math.abs(n); i++) {
    const theta = ((2 * Math.PI) / n) * i + startAngle
    const xComponent = radius * Math.cos(theta)
    const yComponent = radius * Math.sin(theta)
    const point = new Vector2(xComponent, yComponent).add(center)
    lineVertices.push(point)

    const distanceToEnd = point.distanceTo(end)
    if (distanceToEnd <= segmentLength) {
      lineVertices.push(end.clone())
      break
    }
  }
  return lineVertices
}

export function circleToPoints(centerPoint: Vector2Like, radius: number): Vector2[] {
  const tolerance = CIRCLE_TOLERANCE
  const k = tolerance / radius
  const n = Math.ceil(Math.PI / Math.sqrt(2 * k))

  const lineVertices = []
  for (let i = 0; i <= n; i++) {
    const theta = ((2 * Math.PI) / n) * i
    const xComponent = radius * Math.cos(theta)
    const yComponent = radius * Math.sin(theta)
    const point = new Vector2(xComponent, yComponent).add(centerPoint)
    lineVertices.push(point)
  }
  return lineVertices
}

export function promoteTo3(points: Vector2[]): Vector3[] {
  const points3 = []
  for (const point of points) {
    points3.push(new Vector3(point.x, point.y, 0))
  }
  return points3
}

export function flatten(points: Vector3[]): number[] {
  const pointsFlat = []
  for (const point of points) {
    pointsFlat.push(point.x, point.y, point.z)
  }
  return pointsFlat
}

function isStringInt(s: string, errorCallback: {(id: any): void; (arg0: string): void}): boolean {
  if (typeof s !== "string") console.error("[proectUtils.ts] [isStringInt]", s, "is not a string:", typeof s)
  const isInt = !Number.isNaN(parseInt(s, 10))
  if (!isInt) errorCallback(s)
  return isInt
}

function reduceToInts(data: string[], errorCallback: (id: any) => void): number[] {
  function reducer(acc: number[], id: string): number[] {
    return isStringInt(id, errorCallback) ? [...acc, parseInt(id, 10)] : acc
  }
  return data.reduce(reducer, [])
}

function notEmpty(array: unknown[]): boolean {
  return array && Array.isArray(array) && array.length > 0
}

function checkWasmMessage(message: Message, abort = true, logError = true): boolean {
  const key = Object.keys(message)[0]
  const command = message[key as keyof Message]
  if (!command) {
    console.error("[projectUtils.ts] [checkWasmMessage]", "messageType not found:", key, message)
    return false
  }
  log("[checkWasmMessage]", "checking...", key, message)

  switch (key) {
    case "UpdateExtrusion":
      if (!isUpdateExtrusion(command)) { logOrAbort(); return false }
      return true
    case "SetSketchPlane":
      if (!isSetSketchPlane(command)) { logOrAbort(); return false }
      return true
    case "NewSketchOnPlane":
      if (!isNewSketchOnPlane(command)) { logOrAbort(); return false }
      return true
    case "NewExtrusion":
      if (!isNewExtrusion(command)) { logOrAbort(); return false }
      return true
    case "DeleteLines":
      if (!isDeleteLines(command)) { logOrAbort(); return false }
      return true
    case "DeleteArcs":
      if (!isDeleteArcs(command)) { logOrAbort(); return false }
      return true
    case "DeleteCircles":
      if (!isDeleteCircles(command)) { logOrAbort(); return false }
      return true
    case "NewRectangleBetweenPoints":
      if (!isNewRectangleBetweenPoints(command)) { logOrAbort(); return false }
      return true
    case "NewCircleBetweenPoints":
      if (!isNewCircleBetweenPoints(command)) { logOrAbort(); return false }
      return true
    case "NewLineOnSketch":
      if (!isNewLineOnSketch(command)) { logOrAbort(); return false }
      return true
    case "NewPointOnSketch2":
      if (!isNewPointOnSketch2(command)) { logOrAbort(); return false }
      return true
    case "RenameStep":
      if (!isRenameStep(command)) { logOrAbort(); return false }
      return true
    case "RenameWorkbench":
      if (!isRenameWorkbench(command)) { logOrAbort(); return false }
      return true
    case "RenameProject":
      if (!isRenameProject(command)) { logOrAbort(); return false }
      return true
    default:
      console.error("[projectUtils.ts] [checkWasmMessage]", "messageType typeGuard not implemented:", key)
      return false
  }

  function logOrAbort() {
    const error = `[${key}] message failed typecheck:`
    if (logError) console.error("[projectUtils.ts]", error, message)
    return false
  }
}
