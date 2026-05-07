# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment

This project must be developed inside **WSL**. The Windows host provides a proxy at `localhost:10808` — configure package managers and network tools to use it when needed:

```shell
export http_proxy=http://localhost:10808
export https_proxy=http://localhost:10808
```

## Build & Development Commands

```shell
# First-time setup
pnpm install

# Web development (Vite dev server on port 5173)
pnpm dev

# Build everything
pnpm build

# Run all tests (Rust + JS)
pnpm test

# Rust only
cargo test
cargo run --example project_simple_extrusion

# JS unit tests (watch mode, from applications/web)
cd applications/web && pnpm test:unit -w

# JS integration tests (Playwright)
cd applications/web && pnpm test:integration

# Type-check the web app
cd applications/web && pnpm check

# Format & lint
pnpm format
pnpm lint

# Native Tauri builds
pnpm tauri dev
pnpm tauri build
```

Requirements: Node >= 20.13.1, pnpm >= 9.1.0, Rust with wasm-pack installed (`cargo install wasm-pack`).

## Architecture Overview

This is a **pnpm monorepo with turborepo** containing a parametric CAD application. The core CAD kernel is written in Rust, compiled to WASM, and consumed by a Svelte 5 web frontend.

### Packages

- **`packages/cadmium`** — Rust CAD kernel compiled to WASM via `wasm-pack`. Exposes `Project` and `Realization` to JS. Uses the `truck` b-rep library for geometry operations, `tsify` for automated Rust→TypeScript bindings, and `serde` for JSON serialization (.cadmium file format).
- **`packages/shared`** — TypeScript types and Svelte writable stores shared between applications. Stores include `wasmProject`, `project`, `workbench`, `realization`, selection state, and sketch editing state.
- **`applications/web`** — Svelte 5 + Vite web app. Uses Threlte (Svelte wrapper for Three.js) for 3D rendering, Tailwind CSS, and Playwright for e2e tests.
- **`applications/tauri`** — Tauri 2.0 native desktop wrapper around the web app.
- **`packages/config-*`** — Shared ESLint, Prettier, and TypeScript configs.

### Core CAD Kernel (`packages/cadmium/src`)

**Data model:**

- `Project` → contains `Workbench[]` → each Workbench has a linear `history: Vec<Step>`
- `Step` is an enum: `Point`, `Plane`, `Sketch`, or `Extrusion`. Each step has a `name` and `unique_id`.
- `Realization` is the concrete geometric output of evaluating a workbench's step history. It contains maps of `planes`, `points`, `sketches`, and `solids`.

**Command pattern (Message system):**

- The UI communicates with the Rust core by sending `Message` enum variants (defined in `message.rs`).
- Each variant is dispatched via `message.handle(&mut project)` which mutates the project state.
- The JS side calls `wasmProject.send_message(message)` and receives a `MessageResult`.

**Sketch constraint solver:**

- Located in `packages/cadmium/src/sketch/mod.rs` and `constraints.rs`.
- Uses a physics-based iterative solver (spring forces + damping) operating on `Point2` entities which have mass, velocity, and accumulated force.
- Constraints: `SegmentLength`, `SegmentAngle`, `CircleDiameter`, `SegmentsEqual`.
- Points can be `hidden` (used for construction geometry) or `fixed` (anchored in place).

**Geometry pipeline:**

1. User interacts with the Svelte UI which sends `Message` variants to Rust
2. Messages mutate the `Project`/`Workbench` step history
3. `Workbench::realize(max_steps)` evaluates the history, converting 2D sketches to 3D via planes, and building `Solid` structs (wrapping `truck` solids) via extrusions
4. `Solid` provides tessellated mesh data (`vertices`, `normals`, `indices`) for Three.js rendering, and supports export to OBJ and STEP formats

**Extrusion modes:** `New` (create new solid), `Add(Vec<String>)` (fuse with existing solids), `Remove(Vec<String>)` (boolean subtract).

### Web App Structure (`applications/web/src`)

- `App.svelte` — Top-level layout: AppBar, ToolBar, MainDisplay, BottomBar
- `components/` — Svelte components for UI (AppBar, ToolBar, BottomBar, FeatureHistory) and graphics (Scene, Solid, Sketch, Plane, Point2D/3D, Line, Circle, Arc, SelectableSurface, Face)
- `components/controls/` — Camera controls (CadControls with TrackballControls) and CubeGizmo
- `components/features/` — Feature-specific UI (Extrusion, Plane, Point, Sketch forms)
- `components/tools/` — Interactive sketch tools (NewCircle, NewLine, NewRectangle, Select)

State flows through Svelte writable stores (`packages/shared/stores.ts`). The `projectIsStale`/`workbenchIsStale`/`realizationIsStale` pattern triggers recomputation: a store subscription detects staleness, sends messages to recompute, and refreshes derived stores.

### .cadmium File Format

The project serializes to JSON via `serde_json`. The file format is the full `Project` struct serialized — it includes all workbenches, their complete step history, and all sketch data.
