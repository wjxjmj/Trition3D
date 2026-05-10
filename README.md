# Trition3D

[中文](README_zh.md) | English

A self-built parametric CAD application for 3D printing. Sketch, extrude, export STL — all in a native desktop app, no cloud needed.

## Goal

Most CAD software is either too complex (SolidWorks, Fusion 360) or too limiting (Tinkercad). Trition3D targets the middle ground: **parametric modeling simple enough for 3D printing hobbyists, with a self-built kernel that gives full control over the modeling pipeline.**

The CAD kernel — boundary representation, constraint solver, mesh generation — is implemented from scratch in Rust. No dependency on external CAD libraries.

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
| 3D Kernel | Self-built (Rust) |
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

## License

[Elastic License 2.0](LICENSE.md) — Free to use, modify, distribute. May not offer as a service to third parties.
