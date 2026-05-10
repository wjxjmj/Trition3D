# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project Goal

**Trition3D** — a parametric CAD application targeting simple 3D printing modeling. Native desktop app (Tauri).

Inspired by [CADmium](https://github.com/CADmium-Co/CADmium), the pioneering project that first proved a parametric CAD kernel could be built in Rust+WASM. Trition3D starts from CADmium's codebase and integrates existing Rust CAD kernels (truck), focusing development effort on the application layer — UX, 3D printing workflow, and native desktop polish — rather than kernel engineering.

## Repos

- **Gitea** (primary): `http://127.0.0.1:3333/wjxjmj/Trition3D`
- **GitHub** (mirror): `https://github.com/wjxjmj/Trition3D`
- Remote names: `gitea` (Gitea), `origin` (GitHub)
- **Default push target is Gitea.** Use `origin` only when explicitly asked to push to GitHub.
- GitHub push often needs proxy: `export https_proxy=http://127.0.0.1:10808`

## Environment

- Develop on **Windows 11** with **WSL** available
- Host proxy at `localhost:10808`
- Rust: stable-x86_64-pc-windows-msvc (MSVC toolchain with Windows SDK)
- Node >= 24, pnpm >= 10

## Build & Run

```shell
pnpm install
pnpm dev              # Web dev: http://127.0.0.1:5173
pnpm tauri dev        # Desktop app (Vite + Tauri window)
pnpm tauri build      # Release .exe at target/release/trition3d-native.exe
pnpm build            # Web production build
```

**WASM build** (in WSL, with proxy):
```shell
cd packages/trition3d
wasm-pack build --target web --no-pack --release
```

## Project Identity

- **Product**: Trition3D
- **Package**: `trition3d` (Rust crate + WASM)
- **File extension**: `.tri`
- **Repos**: Gitea `http://127.0.0.1:3333/wjxjmj/Trition3D` / GitHub `wjxjmj/Trition3D`
- **Target audience**: 3D printing hobbyists, not industrial CAD users

## Architecture (current — transitional)

```
pnpm monorepo + Cargo workspace
├── packages/trition3d/        Rust CAD kernel → WASM
│   └── src/                   project.rs, workbench.rs, sketch/, solid.rs, message.rs
├── packages/shared/           TypeScript types, stores ($state), bridge, utilities
│   ├── stores.svelte.ts       Single $state object
│   ├── projectUtils.ts        WASM message dispatch (sync)
│   └── trition3dBridge.ts     WASM/Tauri dual-mode bridge
├── applications/web/          Svelte 5.55 + Vite 7 + Threlte 8.5 + Three.js 0.175
└── applications/tauri/        Tauri 2.0 desktop wrapper
    ├── src/lib.rs             Rust native commands (Arc<Mutex<Project>> singleton)
    └── capabilities/default.json
```

## Core Patterns

**Staleness sync** (App.svelte $effects):
`projectIsStale → workbench sync → realizationIsStale → mesh computation`
All WASM calls are synchronous. Store is a single `$state` object.

**Message system**: UI sends `Message` enum → `sendWasmMessage()` → WASM `send_message()` → mutates Project → returns result. Tools (NewLine, NewCircle, etc.) expect sync response for point IDs.

**Icons**: lucide-static via `{@html}` (phosphor-svelte incompatible with Svelte 5 runes).

**Sketch tools**: `click()` functions exported via Svelte 4 pattern, called by PassiveSketch via `bind:this`. Must remain synchronous.

## Key Limitations

- Circle extrusion performance: release WASM required (5x faster than dev)
- Tauri native backend ready but not wired (async IPC incompatible with sync toolchain)
- Web Worker infrastructure ready but not wired (same async issue)
- No assembly/component hierarchy (linear step history only)
- 3D kernel (truck via CADmium) is an external dependency
