# Trition3D

[English](README.md) | 中文

一个参数化 3D CAD 应用。通过草图和拉伸构建模型，支持浏览器和原生桌面运行。

## 快速开始

```shell
# 前置条件: Node >= 24, pnpm >= 10, Rust
pnpm install
pnpm dev          # 浏览器: http://127.0.0.1:5173
pnpm tauri dev    # 桌面应用
pnpm tauri build  # 打包 .exe/.msi 分发
```

## 功能

- **草图绘制**: 在平面上绘制 2D 图形 — 直线、圆、矩形
- **拉伸成型**: 将草图转换为 3D 实体
- **视角操作**: 旋转/平移/缩放 + Gizmo 导航立方体
- **文件导出**: OBJ（网格）、STEP（边界表示）、.tri（项目文件）
- **文件导入**: 打开 .tri 项目文件
- **暗色模式**: 工具栏一键切换
- **原生桌面**: Tauri 2.0，WASM 在 WebView 中运行

## 技术栈

| 层级 | 技术 |
|------|------|
| 3D 内核 | truck (Rust b-rep 引擎) |
| 核心计算 | Rust → WASM |
| 前端界面 | Svelte 5.55 + Vite 7 + Tailwind |
| 3D 渲染 | Threlte 8.5 + Three.js 0.175 |
| 桌面端 | Tauri 2.0 |
| 图标库 | lucide-static |

## 架构

```
Project → Workbench → history: Step[]
                         ├── Point     (点)
                         ├── Plane     (基准面)
                         ├── Sketch    (草图)
                         └── Extrusion (拉伸)
```

前端发送 `Message` 指令到 Rust 核心，核心修改项目状态。工作台历史（Workbench history）被"具象化"（realize）为 3D 几何体用于渲染。

## 编译 WASM（Windows 需要在 WSL 中操作）

```shell
cd packages/trition3d
wasm-pack build --target web --no-pack --release
```

Release 编译可显著提升圆形拉伸等重计算场景的性能。

## 环境说明

- **WSL 推荐**用于 WASM 编译（Windows MSVC 链接器有路径兼容问题）
- 代理设置：`export http_proxy=http://localhost:10808`
- WASM 在 WSL 中编译，前端开发在 Windows 宿主机

## 开源协议

[Elastic License 2.0](LICENSE.md) — 可自由使用、修改、分发。禁止作为第三方服务提供。

---

派生自 [CADmium](https://github.com/CADmium-Co/CADmium)，独立升级维护。
