# Trition3D

[中文](README_zh.md) | English

A parametric CAD application for 3D printing. Sketch, extrude, export STL — all in a native desktop app, no cloud needed.

## Inspiration & Approach

[CADmium](https://github.com/CADmium-Co/CADmium) proved that a parametric CAD kernel can be built in Rust+WASM — boundary representation, constraint solving, mesh generation, all running in the browser. It's a remarkable project and the direct inspiration for Trition3D.

Trition3D takes a pragmatic approach: **integrate multiple open-source CAD kernels, each doing what it does best.** We don't have the resources to build a kernel from scratch. Instead, we stitch together battle-tested libraries — constraint solvers, B-Rep engines, mesh booleans — through a common intermediate format (triangle soup + face grouping). See [docs/KERNEL_SURVEY.md](docs/KERNEL_SURVEY.md) for the full survey of evaluated libraries.

## Goal

Most CAD software is either too complex (SolidWorks, Fusion 360) or too limiting (Tinkercad). Trition3D targets the middle ground: **a parametric modeler simple enough for 3D printing hobbyists, built by integrating battle-tested open-source kernels into a polished native desktop app.**

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

## Kernel Strategy

Rather than relying on a single monolithic kernel, Trition3D integrates specialized libraries for each layer of the CAD pipeline:

| Layer | Current | Target | Why |
|-------|---------|--------|-----|
| **Constraint solving** | CADmium (spring-based) | arael-sketch-solver or solverang | More constraint types, LM solver, pure Rust |
| **B-Rep construction** | truck (via CADmium) | OpenGeometry | Better extrude/sweep, freeform editing (push/pull) |
| **Boolean operations** | truck-shapeops | Manifold | Guaranteed manifold output, production-proven |
| **Mesh repair** | — | MeshLib (C++ FFI) | Fix broken imported STLs |
| **STL/3MF export** | via OBJ | Direct + lib3mf | Native binary STL, official 3MF support |
| **STEP export** | truck-stepio | STEPcode or ruststep | No OCCT dependency |

The intermediate format crossing all kernel boundaries is **MeshGL** — a flat triangle soup with face/original-ID tracking that every kernel can consume or produce.

## Technology

| Layer | Current | Planned |
|-------|---------|---------|
| 3D Kernel | truck (via CADmium) | OpenGeometry + Manifold |
| Constraint Solver | CADmium (spring-based) | arael-sketch-solver / solverang |
| Core | Rust → WASM | Rust → WASM |
| Frontend | Svelte 5 + Vite 7 + Tailwind | Same |
| Rendering | Threlte 8 + Three.js 0.175 | Same |
| Desktop | Tauri 2.0 | Same |

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

Starting from [CADmium](https://github.com/CADmium-Co/CADmium) — the project that first proved parametric CAD in Rust+WASM is possible. We build on their foundation, focusing our efforts on the 3D printing experience.

## License

[Elastic License 2.0](LICENSE.md) — Free to use, modify, distribute. May not offer as a service to third parties.
