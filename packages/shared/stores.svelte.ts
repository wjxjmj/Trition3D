import type {Project as WasmProject, Realization as WasmRealization} from "cadmium"
import type {
  WorkBench,
  MessageHistory,
  Project,
  Realization,
  Entity,
  EntityType,
  SnapEntity,
  PointLikeById,
  PreviewGeometry,
} from "./types"
import {
  isArcEntity,
  isCircleEntity,
  isEntity,
  isFaceEntity,
  isLineEntity,
  isMeshFaceEntity,
  isPlaneEntity,
  isPoint3DEntity,
  isPointEntity,
} from "./typeGuards"

// prettier-ignore
const log = (function () { const context = "[stores.svelte.ts]"; const color = "hotpink"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`) })()

// Reusable setter helper for tool components
export function resetToolState(sketchId?: string) {
  store.sketchTool = "select"
  if (sketchId) {
    delete store.previewGeometry[sketchId]
  }
  store.snapPoints = []
}

function emptyWorkBench(): WorkBench {
  return { name: "", history: [], step_counters: { Extrusion: 0, Plane: 0, Point: 0, Sketch: 0 } }
}
function emptyProject(): Project {
  return { name: "", assemblies: [], workbenches: [] }
}
function emptyRealization(): Realization {
  return { planes: {}, points: {}, sketches: {}, solids: {} }
}

// Single reactive state object — enables mutation from non-.svelte.ts files
// @ts-ignore
export const store = $state({
  // @ts-ignore
  wasmProject: {} as WasmProject,
  project: emptyProject() as Project,
  projectIsStale: false,

  workbenchIndex: 0,
  workbench: emptyWorkBench() as WorkBench,
  workbenchIsStale: false,

  featureIndex: 1000,
  extrusionFeatures: [] as Entity[],
  wasmRealization: undefined as WasmRealization | undefined,
  realization: emptyRealization() as Realization,
  realizationIsStale: false,

  hiddenSketches: [] as string[],
  hiddenSolids: [] as string[],
  sketchBeingEdited: "",
  sketchTool: "",

  selectingFor: [] as EntityType[],
  selectionMax: 1000,
  selectionMin: 0,

  currentlyMousedOver: [] as SnapEntity[],
  currentlySelected: [] as Entity[],
  snapPoints: [] as PointLikeById[],
  previewGeometry: {} as Record<string, PreviewGeometry[]>,

  messageHistory: [] as MessageHistory[],
})

// Validation $effect
$effect.root(() => {
  const allValid = store.currentlySelected.every(entity => isEntity(entity))
  if (!allValid) console.error("[stores.svelte.ts] [currentlySelected] has invalid entities", store.currentlySelected)
})
