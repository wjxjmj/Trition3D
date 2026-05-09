# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Environment

- Develop on **Windows 11** with **WSL** available for WASM compilation
- Host proxy at `localhost:10808`
- Rust: stable-x86_64-pc-windows-msvc (MSVC toolchain with Windows SDK)
- Node >= 24, pnpm >= 10

## Build & Run

```shell
pnpm install
pnpm dev              # Web: http://127.0.0.1:5173
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
- **Package**: `trition3d` (Rust crate + WASM, was `cadmium`)
- **File extension**: `.tri` (was `.cadmium`)
- **Repos**: Gitea `http://127.0.0.1:3333/wjxjmj/Trition3D` / GitHub `wjxjmj/Trition3D`
- **Branch**: `feature/tauri-native` (main)

## Architecture

```
pnpm monorepo + Cargo workspace
├── packages/trition3d/        Rust CAD kernel → WASM (was packages/cadmium)
│   └── src/                   project.rs, workbench.rs, sketch/, solid.rs, message.rs
├── packages/shared/           TypeScript types, stores ($state), bridge, utilities
│   ├── stores.svelte.ts       Single $state object (was 20+ svelte/store writables)
│   ├── projectUtils.ts        WASM message dispatch (sync)
│   ├── trition3dBridge.ts     WASM/Tauri dual-mode bridge (async Tauri, sync WASM)
│   └── workerBridge.ts        Web Worker optional offload (experimental)
├── applications/web/          Svelte 5.55 + Vite 7 + Threlte 8.5 + Three.js 0.175
│   └── src/worker/trition3d.worker.ts   WASM computation Worker
└── applications/tauri/        Tauri 2.0 desktop wrapper
    ├── src/lib.rs             Rust native commands (Arc<Mutex<Project>> singleton)
    └── capabilities/default.json  core:default + shell:allow-open
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
- truck-* crates pinned to git rev

## External Links in Tauri

Use `window.__TAURI_INTERNALS__.invoke("plugin:shell|open", { path: url })`.
Requires `tauri-plugin-shell` in Cargo.toml and `shell:allow-open` in capabilities.
