# Trition3D Frontend Architecture

> For multimodal agents: this describes every Svelte component, its role, props, state, and how they connect. Read this before proposing changes.

## Tech Stack

| Layer | Tech | Notes |
|-------|------|-------|
| Framework | Svelte 5 (runes) | `$state`, `$derived`, `$effect`, `$props` — no stores, no `$:` |
| Language | TypeScript | `.svelte` files use `<script lang="ts">` |
| 3D | Threlte 8.5 + Three.js 0.175 | Threlte wraps Three.js in Svelte components (`<T.Mesh>`, `<T.Group>`, etc.) |
| CSS | Tailwind + scoped `<style>` | `dark:` prefix for dark mode |
| Icons | lucide-static | SVG strings injected via `{@html IconName}` (must use `:global(svg)` to override size) |
| Desktop | Tauri 2.0 | Wraps web app in native window |

## Project File Tree

```
applications/web/src/
├── App.svelte                    ← Root: WASM init, staleness sync, page layout
├── base.ts                       ← Base URL for assets
├── components/
│   ├── AppBar.svelte             ← Top bar
│   ├── ToolBar.svelte            ← Tool buttons
│   ├── MainDisplay.svelte        ← Viewport + timeline container
│   ├── Scene.svelte              ← 3D scene (camera, lights, all geometry)
│   ├── BrowserTree.svelte        ← Floating resource tree (left)
│   ├── FeatureHistory.svelte     ← Bottom timeline (horizontal icon row)
│   ├── FloatingPanel.svelte      ← Draggable popup for feature editing
│   ├── SolidItem.svelte          ← Solid context menu
│   ├── Plane.svelte              ← 3D plane (semi-transparent rect + label)
│   ├── Solid.svelte              ← 3D solid (triangle mesh)
│   ├── Sketch.svelte             ← 3D sketch lines
│   ├── Point3D.svelte            ← 3D point marker
│   ├── Point2D.svelte            ← 2D point in sketch
│   ├── Line.svelte               ← 3D line
│   ├── Circle.svelte             ← 3D circle
│   ├── Arc.svelte                ← 3D arc
│   ├── Face.svelte               ← 3D face surface
│   ├── SelectableSurface.svelte  ← Clickable face on solid
│   ├── PassiveSketch.svelte      ← Sketch display (non-editing)
│   ├── controls/
│   │   ├── CadControls/
│   │   │   ├── CadControls.svelte    ← Camera orbit/pan/zoom
│   │   │   ├── CadControls.ts        ← TrackballControls impl
│   │   │   ├── useControlsContext.svelte.ts
│   │   │   └── TrackballControls.svelte.d.ts
│   │   └── CubeGizmo/
│   │       ├── CubeGizmo.svelte      ← ViewCube (top-right)
│   │       └── CubeGizmo.ts          ← Types
│   ├── features/
│   │   ├── Point.svelte          ← Point feature editor (floating panel)
│   │   ├── Plane.svelte          ← Plane feature editor (floating panel)
│   │   ├── Sketch.svelte         ← Sketch feature editor (floating panel)
│   │   └── Extrusion.svelte      ← Extrusion feature editor (floating panel)
│   └── tools/
│       ├── NewLine.svelte         ← Line drawing tool (sketch mode)
│       ├── NewCircle.svelte       ← Circle drawing tool (sketch mode)
│       ├── NewRectangle.svelte    ← Rectangle drawing tool (sketch mode)
│       └── Select.svelte          ← Select tool (sketch mode)

packages/shared/
├── stores.svelte.ts              ← THE global reactive state ($state)
├── i18n.svelte.ts                ← i18n (EN/ZH dictionary + reactive tr() function)
├── projectUtils.ts               ← WASM message dispatch (send_message, renameStep, etc.)
├── types.d.ts                    ← All TypeScript types
└── typeGuards.ts                 ← Type guard functions
```

## Component Details

### App.svelte — Root Component

**Role:** WASM initialization, staleness chain orchestrator, page-level layout.

**State (local):**
- `newFileContent: string | null` — file upload trigger

**Effects (global staleness chain):**
1. On mount: `init()` WASM → create Project → sync workbench → sync realization
2. `projectIsStale` → re-read project JSON → set `workbenchIsStale = true`
3. `workbenchIsStale` → re-read workbench JSON → set `realizationIsStale = true`
4. `realizationIsStale` → re-read realization JSON → re-render scene
5. `featureIndex` change → sets `workbenchIsStale = true`

**Layout template:**
```html
<div class="w-[100vw] h-[100vh] block overflow-hidden">
  <AppBar />       <!-- 45px -->
  <ToolBar />      <!-- 45px -->
  <MainDisplay />  <!-- fills remaining space -->
</div>
```

---

### MainDisplay.svelte — Viewport Container

**Role:** Full-viewport 3D canvas + floating overlays. No side panels.

**State (local):**
- `innerWidth / innerHeight` — window dimensions (bound from `<svelte:window>`)
- `viewportHeight: $derived(innerHeight - 45 * 2)` — AppBar(45) + ToolBar(45)

**Template:**
```html
<div class="relative" style="width:100%; height:{viewportHeight}px">
  <Canvas>                          <!-- Threlte canvas -->
    <Scene bind:this={sceneRef} />
  </Canvas>
  <BrowserTree />                   <!-- position:absolute, top-left -->
  <div class="timeline-overlay">    <!-- position:absolute, bottom:0 -->
    <FeatureHistory />
  </div>
</div>
```

**Key:** Viewport div has `position: relative`. BrowserTree and timeline-overlay use `position: absolute` to float on top of the canvas.

---

### Scene.svelte — 3D Scene

**Role:** Renders ALL 3D geometry by iterating over `store.realization`.

**Camera:**
```svelte
<T.OrthographicCamera makeDefault position={[160.8, -250.8, 200.55]} zoom={5} up={[0, 0, 1]}>
  <CadControls rotateSpeed={1.8} panSpeed={0.5}
    mouseButtons={{LEFT: 2, MIDDLE: 50, RIGHT: 1}} />
</T.OrthographicCamera>
```

**Rendering loops:**
```svelte
{#each points as [id, point]}    → <Point3D {id} x/y/z hidden={point.hidden} />
{#each planes as [id, plane]}    → <Plane {id} name origin primary secondary tertiary />
{#each sketches as [id, sketch]} → <Sketch {id} name plane editing />
{#each solids as [name, solid]}  → {#if !hidden} <Solid {name} indices vertices normals truckSolid />
```

**Interactivity:** `interactivity()` from `@threlte/extras` enables pointer events on Three.js objects.

**Materials:** `LineMaterial` instances created as `$derived` for dashed/solid/hovered/selected line styles.

**Lighting:** Ambient (0.4) + Directional (10,10,10, 0.5) + HDR environment map.

**Reference planes (Front/Top/Right):** Rendered as semi-transparent rectangles via `<Plane>` with `opacity: 0.05`, clickable for selection.

---

### BrowserTree.svelte — Resource Tree

**Role:** Floating transparent resource tree (Fusion 360-style browser).

**Position:** `position: absolute; top: 16px; left: 16px; bottom: 48px;`

**Data sources:**
- Bodies: `Object.entries(store.realization.solids)`
- Sketches: `Object.entries(store.realization.sketches)`
- Planes: `Object.entries(store.realization.planes)`

**Features:**
- Collapsible sections (Bodies/Sketches/Planes) with +/- toggle
- Click to select entity in 3D viewport
- Eye icon to toggle visibility (hiddenSolids/hiddenSketches)
- Double-click body/sketch name to rename (inline input)
- Dynamic bottom fade (disappears when scrolled to end)
- Transparent: no background, text-shadow for readability, dark mode aware

**Style:** Pure text on scene, no panel background. Section headers: bold black uppercase. Items: dark text with light glow shadow. Hidden items: 25% opacity.

---

### FeatureHistory.svelte — Timeline

**Role:** Horizontal scrollable icon row at viewport bottom.

**Position:** Inside `.timeline-overlay` which is `position: absolute; bottom: 0; left: 0; right: 0`.

**Data:** `store.workbench.history` filtered to exclude origin point (index 0) and base planes (Front/Top/Right).

**Features:**
- Icons only (no text labels), tooltip on hover for name
- Drag to scroll (mousedown + mousemove, grab cursor)
- Horizontal mask fade on edges
- Floating nav buttons (|◀◀ ◀ ▶ ▶▶|) on overflow + hover, 1s persist
- Collapsible via +/- toggle (32px fixed height)
- Label "History (N)" always visible, count in gray

**Rendering:**
```svelte
{#each visible as feature}
  {@const featureIdx = history.indexOf(feature)}
  {#if isPoint}    <PointFeature name={name} index={featureIdx} />
  {:else if isPlane}   <PlaneFeature ... />
  {:else if isSketch}  <SketchFeature ... />
  {:else if isExtrusion} <ExtrusionFeature ... />
{/each}
```

---

### Feature Components — Point/Plane/Sketch/Extrusion

**Pattern:** Each has two parts:
1. **Pill** (in timeline): icon-only, click to select, double-click to open editor
2. **FloatingPanel** (overlay): form for editing parameters

**Point.svelte:**
- Pill: point icon
- Panel: Name input, Done/Cancel buttons
- `closeAndRefresh()`: sets `store.workbenchIsStale = true`, resets `featureIndex = 1000`

**Plane.svelte:**
- Pill: plane icon
- Panel: Name input, Done/Cancel
- Props: `name, index, plane, setCameraFocus`

**Sketch.svelte:**
- Pill: sketch icon
- Panel: Name, Surface selector (plane), Done/Cancel
- On open: sets `store.sketchBeingEdited = id`
- On close: clears `sketchBeingEdited`, `sketchTool`, `selectingFor`, `currentlySelected`
- Escape key: exits sketch mode

**Extrusion.svelte:**
- Pill: extrude icon
- Panel: Name, Length, Faces (with face tag removal), Done/Cancel
- On open: sets `store.selectingFor = ["face", "meshFace"]`
- On face selection change: auto-sends `updateExtrusion` to WASM
- On close: hides the source sketch

**FloatingPanel props:**
```ts
{ show: boolean, title: string, onclose: () => void, children: Snippet }
```

**FloatingPanel behavior:**
- `position: fixed`, z-index 100
- Draggable by header bar
- Default position centered horizontally, 100px from top
- Light/dark mode glass styling

---

### The Global Store — stores.svelte.ts

This is THE single source of truth. All components read/write this.

```ts
const store = $state({
  // WASM bridge
  wasmProject: WasmProject | null,
  wasmRealization: WasmRealization | null,

  // Serialized data (JSON from WASM)
  project: Project,            // {name, assemblies, workbenches[]}
  workbench: WorkBench,        // {name, history: Step[], step_counters}
  realization: Realization,    // {planes, points, sketches, solids}

  // Staleness flags
  projectIsStale: boolean,
  workbenchIsStale: boolean,
  realizationIsStale: boolean,

  // UI state
  workbenchIndex: number,      // Which workbench tab (always 0)
  featureIndex: number,        // Which feature is open (1000 = none)
  sketchBeingEdited: string,   // Sketch ID, "" if none
  sketchTool: string,          // "select" | "line" | "circle" | "rectangle" | ""
  hiddenSketches: string[],    // IDs of hidden sketches
  hiddenSolids: string[],      // Names of hidden solids

  // Selection
  currentlySelected: Entity[],     // [{id, type}]
  currentlyMousedOver: SnapEntity[],
  selectingFor: EntityType[],      // Types being selected for
  selectionMax: number,
  selectionMin: number,

  // Sketch
  snapPoints: PointLikeById[],
  previewGeometry: Record<string, PreviewGeometry[]>,

  // Debug
  messageHistory: MessageHistory[],
})
```

### Key Types (types.d.ts)

```ts
type Step = PointStep | PlaneStep | SketchStep | ExtrusionStep

interface PointStep { name, unique_id, data: { type: "Point", point: Point3D } }
interface PlaneStep { name, unique_id, data: { type: "Plane", plane: Plane, width, height } }
interface SketchStep { name, unique_id, data: { type: "Sketch", plane_description: {PlaneId}, width, height, sketch: SketchData } }
interface ExtrusionStep { name, unique_id, data: { type: "Extrusion", extrusion: {sketch_id, length, offset, direction, mode, face_ids} } }

interface Entity { id: string, type: EntityType }
type EntityType = "circle" | "arc" | "face" | "line" | "plane" | "point" | "point3D" | "meshFace"
```

### Sketch Tools (tools/)

**NewLine.svelte, NewCircle.svelte, NewRectangle.svelte, Select.svelte**

These are mounted by `PassiveSketch.svelte` when a sketch is being edited. They listen for mouse events on the 3D canvas and send WASM messages to create geometry.

Pattern: on mousedown, compute 2D coordinate from 3D click via plane projection, then dispatch appropriate WASM message (NewLine, NewCircle, etc.).

### WASM Communication (projectUtils.ts)

All mutations go through `sendWasmMessage(message)`:
```ts
function sendWasmMessage(message: Message) {
  let result = store.wasmProject.send_message(message)
  store.messageHistory = [...store.messageHistory, {message, result}]
  return result
}
```

After sending, the caller sets `store.workbenchIsStale = true` to trigger re-sync.

---

## Current Interaction Model (SolidWorks/Onshape style)

1. **Sketch mode:** User clicks "New Sketch" → selects a plane → enters sketch editing mode (`sketchBeingEdited` set)
2. **Drawing:** Toolbar shows line/circle/rectangle tools. User clicks canvas to place geometry.
3. **Exit sketch:** Done/Cancel in floating panel or Escape key.
4. **Extrude:** Click "New Extrusion" → select faces → set length → Done.
5. **Edit features:** Double-click timeline icon → floating panel opens → edit params.
6. **Camera:** Mouse LEFT=orbit, RIGHT=pan.

## Key Differences vs Fusion 360

| Feature | Current (Onshape-like) | Fusion 360 target |
|---------|----------------------|-------------------|
| Sketch entry | Explicit "New Sketch" → select plane | Click sketch tool, draw on any face |
| Drawing mode | `sketchBeingEdited` toggle state | Always ready to sketch |
| Tool palette | Toolbar + floating feature panels | Marking menu (radial) at cursor |
| Direct manipulation | Via form inputs (length, etc.) | Drag arrows on faces to extrude |
| Timeline | Icon-only, drag to scroll | Icon + name, same interaction |
| Resource tree | Floating left, click to select | Same |
| ViewCube | Top-right, click faces to orient | Same |
| Canvas | Full viewport, overlays floating | Same |
