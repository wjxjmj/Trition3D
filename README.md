# CADmium

A parametric CAD program that runs in the browser. Build 3D models with sketches and extrusions, export to OBJ/STEP.

**Status:** Upgraded to modern toolchain. Active development fork.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| 3D Kernel | [truck](https://github.com/ricosjp/truck) (Rust b-rep engine) |
| Core Logic | Rust → WASM (`packages/cadmium`) |
| Frontend | Svelte 5.55 (runes mode) + Vite 7 + Tailwind CSS |
| 3D Rendering | Threlte 8.5 + Three.js 0.175 |
| Package Manager | pnpm 10 with turborepo |
| Format | .cadmium (JSON-based, serialized from Rust structs) |

## Quick Start

```shell
# Prerequisites: Node >= 24, pnpm >= 10, Rust with wasm-pack
pnpm install
pnpm dev        # http://127.0.0.1:5173
```

### WASM Build (WSL required on Windows)

```shell
# In WSL, with proxy configured:
cd packages/cadmium
wasm-pack build --target web --no-pack --release
```

The release build (`--release`) is **critical** for performance — dev mode WASM is ~3x larger and significantly slower.

## Features

- **Sketches**: 2D drawing on planes (line, circle, rectangle)
- **Extrusions**: Convert sketches to 3D solids
- **Navigation**: Orbit/pan/zoom + Gizmo cube for quick view switching
- **Export**: OBJ (mesh), STEP (brep, experimental), .cadmium (project)
- **File management**: Save/load projects, persistence of visibility state
- **Dark mode**: Toggle in toolbar

## Development

```shell
pnpm dev          # Start dev server
pnpm build        # Production build
cargo test        # Rust tests (in packages/cadmium)
```

### Environment
- **WSL recommended** for WASM compilation (MSVC linker has path issues on Windows)
- Proxy at `localhost:10808` if behind firewall (set `http_proxy`/`https_proxy`)
- WASM built in WSL, web dev server runs on Windows host

## Architecture

```
Project → Workbench[] → history: Step[]
                          ├── Point
                          ├── Plane
                          ├── Sketch (2D geometry + constraints)
                          └── Extrusion (sketch → 3D solid)
```

- **Message system**: UI sends `Message` enum variants to Rust core, which mutates project state
- **Realization**: Workbench history is "realized" into concrete 3D geometry
- **Stores**: Single `$state` object (`packages/shared/stores.svelte.ts`) with staleness-triggered sync
- **Sketch solver**: Physics-based iterative constraint solver (spring forces + damping)

## Project Structure

```
packages/
  cadmium/          Rust CAD kernel → WASM
  shared/           TypeScript types, stores, utilities
applications/
  web/              Svelte 5 frontend
  tauri/            Tauri desktop wrapper (disabled, code preserved)
```

## License

[Elastic License 2.0](LICENSE.md) — You may use, modify, and distribute this software, but may not offer it as a service to third parties.
