# Trition3D

[English](README.md) | 中文

参数化 CAD 应用，专为 3D 打印设计。草图、拉伸、导出 STL——纯原生桌面，不依赖云端。

## 灵感与思路

[CADmium](https://github.com/CADmium-Co/CADmium) 率先证明了参数化 CAD 内核可以用 Rust+WASM 构建——边界表示、约束求解、网格生成，全部在浏览器中运行。这是一个了不起的项目，也是 Trition3D 的直接灵感来源。

Trition3D 走务实路线：**整合已有的 Rust CAD 内核，而非从零自研。**我们没有资源去卷内核开发。精力放在 3D 打印真正需要的地方——干净的原生桌面体验、STL 直出、不碍事的建模流程。

## 项目目标

市面上的 CAD 软件要么太复杂（SolidWorks、Fusion 360），要么太玩具（Tinkercad）。Trition3D 的定位是：**为 3D 打印爱好者打造的参数化建模工具，整合经过验证的开源内核，打磨成好用的原生桌面应用。**

## 环境准备

| 工具 | 版本要求 | 安装方式 |
|------|---------|---------|
| Node | >= 24 | [nodejs.org](https://nodejs.org) 或 `nvm install 24` |
| pnpm | >= 10 | `corepack enable && corepack prepare pnpm@latest` |
| Rust | 最新稳定版 | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| wasm-pack | 最新版 | `cargo install wasm-pack` |
| wasm32 编译目标 | — | `rustup target add wasm32-unknown-unknown` |

**Tauri 桌面端额外需要（Windows）：**
- Visual Studio Build Tools 或 Visual Studio，勾选"使用 C++ 的桌面开发"

## 快速开始

```shell
# 1. 安装依赖
pnpm install

# 2. 编译 Rust 核心为 WASM（首次或修改 Rust 代码后执行）
cd packages/trition3d
wasm-pack build --target web --no-pack --release
cd ../..

# 3. 启动
pnpm dev              # 浏览器打开: http://127.0.0.1:5173
```

```shell
# 桌面应用
pnpm tauri dev        # 开发模式，热更新
pnpm tauri build      # 打包 .exe，产物在 target/release/trition3d-native.exe
```

## 功能规划

- **草图绘制**: 在平面上绘制 2D 图形 — 直线、圆、矩形、圆弧
- **拉伸成型**: 推拉草图生成 3D 实体
- **布尔运算**: 实体之间的合并、相减、相交
- **倒角圆角**: 边线修整，适合打印件的边缘处理
- **参数化历史**: 完整步骤记录，随时修改任意参数
- **STL 导出**: 直接导入切片软件（Cura、PrusaSlicer 等）
- **原生桌面**: Tauri 2.0，日常工作无需浏览器

## 技术栈

| 层级 | 技术 |
|------|------|
| 3D 内核 | truck（基于 CADmium） |
| 核心计算 | Rust → WASM |
| 前端界面 | Svelte 5 + Vite 7 + Tailwind |
| 3D 渲染 | Threlte 8 + Three.js 0.175 |
| 桌面端 | Tauri 2.0 |

## 架构

```
Project → Workbench → history: Step[]
                         ├── Point     (点)
                         ├── Plane     (基准面)
                         ├── Sketch    (草图)
                         └── Extrusion (拉伸)
```

前端发送指令到 Rust 核心，核心修改项目状态。工作台历史被"具象化"（realize）为 3D 几何体用于渲染。参数化历史意味着每一步都可编辑——修改草图尺寸，整个模型自动重建。

## 构建流程

### 1. WASM（Rust → WebAssembly）

```shell
cd packages/trition3d
wasm-pack build --target web --no-pack --release
```

产物在 `packages/trition3d/pkg/`。Release 模式比 dev 快约 5 倍。

> **Windows 注意：** 首次 `pnpm install` 后可能需要在项目根目录执行 `pnpm approve-builds`，勾选 esbuild 和 @swc/core，再重新 `pnpm install`。

### 2. Web 前端（Vite + Svelte）

```shell
pnpm dev          # 开发服务器，http://127.0.0.1:5173
pnpm build        # 生产构建 → applications/web/dist/
```

### 3. 桌面应用（Tauri）

```shell
pnpm tauri dev    # 开发窗口，热更新
pnpm tauri build  # 打包 .exe + .msi 安装包
```

## 常见问题

**`Failed to resolve entry for package "trition3d"`**
→ 还没编译 WASM，先在 `packages/trition3d` 中执行 `wasm-pack build`。

**找不到 `wasm32-unknown-unknown` 编译目标**
→ `rustup target add wasm32-unknown-unknown`

**`wasm-pack: command not found`**
→ `cargo install wasm-pack`

**`pnpm install` 跳过了 esbuild / @swc/core**
→ 在项目根目录执行 `pnpm approve-builds`，勾选 esbuild 和 @swc/core，再重新 `pnpm install`。

**Tauri 编译报错（Windows）**
→ 安装 Visual Studio Installer，勾选"使用 C++ 的桌面开发"工作负载。

## 致谢

从 [CADmium](https://github.com/CADmium-Co/CADmium) 起步——这个项目第一个证明了 Rust+WASM 参数化 CAD 的可行性。我们站在这个基础上，把精力聚焦在 3D 打印体验上。

## 开源协议

[Elastic License 2.0](LICENSE.md) — 可自由使用、修改、分发。禁止作为第三方服务提供。
