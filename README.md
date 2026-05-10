# Trition3D

[中文](README_zh.md) | English

A parametric CAD application for 3D printing. Sketch, extrude, export STL — all in a native desktop app, no cloud needed.

## Inspiration & Roadmap

[CADmium](https://github.com/CADmium-Co/CADmium) proved that a parametric CAD kernel can be built from scratch in Rust+WASM — boundary representation, constraint solving, mesh generation, all running in the browser. That project is a remarkable achievement and the direct inspiration for Trition3D.

**Current state:** Trition3D starts from CADmium's codebase — same kernel, same architecture. This gives us a working parametric CAD foundation to iterate on immediately.

**Where we're going:** Incrementally replace the CAD kernel with our own implementation, purpose-built for 3D printing workflows. The goal is **a native desktop parametric modeler where we own every piece of the modeling pipeline.**

## Goal

Most CAD software is either too complex (SolidWorks, Fusion 360) or too limiting (Tinkercad). Trition3D targets the middle ground: **parametric modeling simple enough for 3D printing hobbyists, with a self-built kernel that gives full control over the modeling pipeline.**

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node | >= 24 | [nodejs.org](https://nodejs.org) or `nvm install 24` |
| pnpm | >= 10 | `corepack enable && corepack prepare pnpm@latest` |
| Rust | latest stable | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| wasm-pack | latest | `cargo install wasm-pack` |
| wasm32 target | — | `rustup target add wasm32-unknown-unknown` |

**Additional for Tauri desktop (Windows):**
- Visual Studio Build Tools or Visual Studio with "Desktop development with C++"
- Windows 10 SDK

## Quick Start

```shell
# 1. Install dependencies
pnpm install

# 2. Compile Rust kernel to WASM (only needed once, or when Rust code changes)
cd packages/trition3d
wasm-pack build --target web --no-pack --release
cd ../..

# 3. Start the app
pnpm dev              # Browser: http://127.0.0.1:5173
```

```shell
# Desktop app
pnpm tauri dev        # Dev mode with hot reload
pnpm tauri build      # Release .exe at target/release/trition3d-native.exe
```

## Features (planned)

- **Sketches**: 2D drawing on planes — line, circle, rectangle, arc
- **Extrusions**: Push/pull sketches into 3D solids
- **Boolean operations**: Add, subtract, intersect solids
- **Fillets & chamfers**: Edge finishing for printable parts
- **Parametric history**: Full step history, edit any parameter at any time
- **STL export**: Direct export for slicers (Cura, PrusaSlicer, etc.)
- **Native desktop**: Tauri 2.0, no browser required for daily use

## Technology

| Layer | Technology |
|-------|-----------|
| 3D Kernel | truck (current) → self-built (planned) |
| Core | Rust → WASM |
| Frontend | Svelte 5 + Vite 7 + Tailwind |
| Rendering | Threlte 8 + Three.js 0.175 |
| Desktop | Tauri 2.0 |

## Architecture

```
Project → Workbench → history: Step[]
                         ├── Point
                         ├── Plane
                         ├── Sketch
                         └── Extrusion
```

UI sends commands to Rust core, which mutates project state. Workbench history is "realized" into 3D geometry for rendering. The parametric history means every step is editable — change a sketch dimension and the entire model rebuilds.

## Build pipeline

### 1. WASM (Rust → WebAssembly)

```shell
cd packages/trition3d
wasm-pack build --target web --no-pack --release
```

Output in `packages/trition3d/pkg/`. Release mode is ~5x faster than dev.

> **Windows note:** On first install you may need `pnpm approve-builds` in the repo root to allow esbuild / @swc/core native modules.

### 2. Web frontend (Vite + Svelte)

```shell
pnpm dev          # Dev server at http://127.0.0.1:5173
pnpm build        # Production build → applications/web/dist/
```

### 3. Desktop app (Tauri)

```shell
pnpm tauri dev    # Dev window with hot reload
pnpm tauri build  # Bundled .exe + .msi installer
```

## Troubleshooting

**`Failed to resolve entry for package "trition3d"`**
→ The WASM pkg hasn't been built. Run `wasm-pack build` in `packages/trition3d`.

**`wasm32-unknown-unknown` target not found**
→ `rustup target add wasm32-unknown-unknown`

**`wasm-pack: command not found`**
→ `cargo install wasm-pack`

**`pnpm install` skips esbuild / @swc/core**
→ Run `pnpm approve-builds` in the repo root, select esbuild and @swc/core, then `pnpm install` again.

**Tauri build fails on Windows**
→ Install "Desktop development with C++" workload from Visual Studio Installer.

## Acknowledgments

Starting from [CADmium](https://github.com/CADmium-Co/CADmium) — the project that first proved parametric CAD in Rust+WASM is possible. We stand on their shoulders while building our own path forward.

## License

[Elastic License 2.0](LICENSE.md) — Free to use, modify, distribute. May not offer as a service to third parties.
