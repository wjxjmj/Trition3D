# Trition3D

[中文](README_zh.md) | English

A parametric 3D CAD application. Build models with sketches and extrusions, run in browser or as a native desktop app.

## Quick Start

```shell
# Prerequisites: Node >= 24, pnpm >= 10, Rust
pnpm install
pnpm dev          # Browser: http://127.0.0.1:5173
pnpm tauri dev    # Desktop app
pnpm tauri build  # Package .exe/.msi for distribution
```

## Features

- **Sketches**: 2D drawing on planes — line, circle, rectangle
- **Extrusions**: Convert sketches to 3D solids
- **Navigation**: Orbit/pan/zoom + Gizmo cube
- **Export**: OBJ, STEP, `.tri` (project file)
- **Dark mode**: Toggle in toolbar
- **Native desktop**: Tauri 2.0, runs WASM in webview

## Technology

| Layer | Technology |
|-------|-----------|
| 3D Kernel | truck (Rust b-rep) |
| Core | Rust → WASM |
| Frontend | Svelte 5.55 + Vite 7 + Tailwind |
| Rendering | Threlte 8.5 + Three.js 0.175 |
| Desktop | Tauri 2.0 |
| Icons | lucide-static |

## Architecture

```
Project → Workbench → history: Step[]
                         ├── Point
                         ├── Plane
                         ├── Sketch
                         └── Extrusion
```

UI sends `Message` commands to Rust core, which mutates project state. Workbench history is "realized" into 3D geometry for rendering.

## Building WASM (WSL required on Windows)

```shell
cd packages/trition3d
wasm-pack build --target web --no-pack --release
```

## License

[Elastic License 2.0](LICENSE.md) — Free to use, modify, distribute. May not offer as a service to third parties.

---

Forked from [CADmium](https://github.com/CADmium-Co/CADmium), upgraded and maintained independently.
