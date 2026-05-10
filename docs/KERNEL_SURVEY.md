# Kernel Survey

Comprehensive survey of open-source geometry libraries relevant to Trition3D's kernel integration strategy. Evaluated May 2026.

## Strategy

Trition3D does not build a CAD kernel from scratch. We integrate existing open-source kernels, focusing our effort on the application layer — UX, 3D printing workflow, and native desktop experience.

The integration architecture uses **triangle soup + face grouping** (Manifold MeshGL structure) as the universal intermediate format crossing Rust/C++/WASM boundaries.

---

## 1. B-Rep / Geometry Kernels

### Top Candidates

| Library | Lang | License | Half-Edge | Boolean | Extrude/Sweep | Export | Maturity |
|---------|------|---------|-----------|---------|---------------|--------|----------|
| **OpenGeometry** | Rust | npm published | Yes (own) | Yes (boolmesh) | Yes | STL, STEP, IFC | v1.0.9, production npm |
| **geop** | Rust | MIT | No (deliberately avoids) | Yes | No | No | Early, active |
| **neco-brep** | Rust | ? | No | Yes (2D stable, 3D exp.) | Yes (extrude/revolve/sweep/loft) | STL | v0.1, experimental |
| **truck** | Rust | Apache 2.0 | Yes | Yes (shapeops) | Via modeling | STEP (ruststep) | v0.7, mature, current Trition3D kernel |
| **Fornjot** | Rust | 0BSD | Yes (internal) | Basic | Yes | STL, 3MF | Early, active, ~2.5k stars |

### C++ Standalone (No OpenCASCADE dependency)

| Library | Lang | License | Key Features |
|---------|------|---------|-------------|
| **SGM** (Sandia) | C++11 | Open source | Lightweight B-Rep, zero deps, STEP/STL, 95% test coverage, multi-threaded |
| **BRL-CAD libnmg** | C | LGPL/BSD | 40yr old half-edge NMG library, battle-tested algorithms |

### Assessment

**Primary pick: OpenGeometry.** Same stack (Rust + wasm-pack + WASM), clean API, npm published. The B-Rep structure is a full half-edge with topology validation. Covers extrude, sweep, offset, and freeform editing (pushPullFace, moveEdge, loopCut) that truck doesn't have.

**Watch: geop.** The deliberate avoidance of half-edge in favor of Riemannian Manifolds is architecturally interesting for numerical stability. MIT licensed. Not mature enough yet.

---

## 2. Constraint Solvers

Constraint solvers are the hardest piece to source. The solver is what makes CAD "parametric" — without it, you have a 3D modeler, not parametric CAD.

### Pure Rust

| Library | Method | Scope | Constraints | License | Status |
|---------|--------|-------|-------------|---------|--------|
| **arael-sketch-solver** | Levenberg-Marquardt + symbolic diff | 2D | 40+ | ? | v0.6, active |
| **solverang** | Newton/LM/Auto/Robust/Sparse multi-backend | 2D + 3D + assembly | 15 (2D) + 8 (3D) | Apache 2.0 | v0.1, brand new (Mar 2026) |
| **ezpz** (KittyCAD) | Pure Rust 2D solver | 2D | 9 types | MIT | v0.2, 75k downloads |
| **ISOtope** (CADmium) | Spring energy + BFGS | 2D | Spring-based | ? | CADmium built-in |
| **CADmium solver** (current) | Physics-based iterative (spring+damping) | 2D | SegmentLength, SegmentAngle, CircleDiameter, SegmentsEqual | Elastic 2.0 | In Trition3D now |

### C/C++ (with C FFI possible)

| Library | Lang | Method | Scope | Constraints | License |
|---------|------|--------|-------|-------------|---------|
| **SolveSpace solver** (libslvs) | C++/C API | Newton + LM + symbolic Jacobian | 2D + 3D | 37+ | GPLv3 |
| **PlaneGCS** (FreeCAD) | C++ | DogLeg + LM + BFGS | 2D only | 10+ | LGPL |

### Assessment

**Current: CADmium's built-in solver.** Works, already integrated, handles basic sketch constraints. Weaknesses: only 4 constraint types, physics-based (can be slow to converge).

**Upgrade path: arael-sketch-solver.** 40+ constraint types with symbolic differentiation. Pure Rust, no C++ dependency. The Levenberg-Marquardt approach is the same algorithm used by SolveSpace and FreeCAD. Version 0.6 indicates it's functional.

**Long-term: solverang.** 2D+3D+assembly in pure Rust, Apache 2.0. Multiple solver backends (Newton, LM, sparse, parallel). Brand new but architecturally the right approach. Worth contributing to rather than replacing.

**GPL traps:** SolveSpace (GPLv3) and PlaneGCS (LGPL) are the most mature solvers, but GPL compatibility with Elastic License 2.0 is a hard conflict. Can learn from their algorithms but cannot link the code.

---

## 3. Mesh Boolean / CSG

| Library | Lang | Method | License | Maturity | Notes |
|---------|------|--------|---------|----------|-------|
| **Manifold** | C++ (C FFI) | Guaranteed-manifold, symbolic perturbation | Apache 2.0 | Production (OpenSCAD, Blender, Godot, 30+ users) | The gold standard |
| **boolmesh** | Rust | Pure Rust, Manifold-inspired | MPL-2.0 | New, active | Menger Sponge depth 4 in ~4s |
| **csgrs** | Rust | BSP tree | MIT | Active | Integrates with Dimforge ecosystem |

### Assessment

**Primary pick: Manifold (via manifold-csg-rs).** Guaranteed manifold output is the killer feature — no more "boolean failed, mesh is broken." Already wrapped in Rust via `manifold-csg` crate. Production-proven in OpenSCAD, Blender, Godot.

**Backup: boolmesh.** Pure Rust, no C++ build dependency. Worth watching if Manifold's C++ build becomes a pain point.

---

## 4. Mesh Repair

| Library | Lang | License | Key Features |
|---------|------|---------|-------------|
| **MeshLib** | C++ (Python/C# bindings) | Free non-commercial | Self-intersection removal, hole filling, degenerate removal, zero-offset reconstruction |
| **ImatiSTL** | C++ | GPL/Commercial | Dedicated STL repair, local + global remeshing |
| **VCGLib** | C++ (header) | GPL | Powers MeshLab, 100k+ LOC, quadric simplification, hole filling |

Needed primarily for imported STL cleanup (user brings a broken Thingiverse model into Trition3D).

---

## 5. File Format Libraries

### STL
- **microstl** (C++17 single-header, MIT-like): Read + write ASCII/binary. Minimal.
- **stl_reader** (C++ single-header, BSD): Read-only. Most popular.

### 3MF
- **lib3mf** (C++ official reference, BSD): Full read/write/validate from 3MF Consortium.
- **threemf2** (Rust, crates.io): Core Spec 1.3.0 + Production, Beam Lattice extensions.

### STEP
- **STEPcode** (C, BSD-like): Former NIST STEP Class Library. Independent of OpenCASCADE. Reads/writes Part 21. ~70k LOC, 2,400 commits over 15+ years.
- **ruststep** (Rust): Truck companion. Parser for Part 21.
- **foxtrot** (Rust, Apache 2.0/MIT): Formlabs' STEP viewer libraries. EXPRESS parsing, STEP parsing.

### glTF/GLB
- **gltf-rs** (Rust): Canonical glTF 2.0 crate. Full spec.
- **mesh-tools** (Rust): Purpose-built for procedural geometry export.

### DXF
- **dxf** (Rust crate): Read support. Used by OpenGeometry as a dependency.

---

## 6. Half-Edge Data Structures (Reference)

| Library | Lang | License | Notes |
|---------|------|---------|-------|
| **lox** (Rust) | Rust | MIT/Apache 2.0 | Fast, multiple mesh structures, prop maps, benchmarks |
| **alum** (Rust) | Rust | ? | Inspired by OpenMesh, decimation + subdivision |
| **yig/halfedge** (C++) | C++ | Public Domain | Minimal, zero deps, excellent reference implementation |
| **geometry-central** (C++) | C++ | MIT | Most feature-rich: differential geometry, geodesics, direction fields |
| **polymesh** (C++) | C++17 | MIT | Modern C++17, smart handles, functional iteration |

---

## 7. SDF / F-Rep Kernels

| Library | Lang | License | Maturity |
|---------|------|---------|----------|
| **libfive** | C++ | MPL 2.0 | High, published research |
| **fidget** (Rust) | Rust | ? | JIT to native, interval arithmetic, SIMD |
| **sdfu** (Rust) | Rust | ? | Most mature Rust SDF crate |

F-Rep is an alternative to B-Rep: define shapes as mathematical functions, CSG is trivial. Good for organic shapes, harder for "bevel this specific edge" operations. Probably not the primary path for Trition3D, but relevant for fillet/chamfer implementation ideas.

---

## 8. C++ Standalone Libraries Worth Knowing

| Library | What It Does | License | Why It Matters |
|---------|-------------|---------|----------------|
| **SGM** | Lightweight B-Rep kernel | Open source | Zero deps, STEP/STL, 95% tested |
| **STEPcode** | Independent STEP parser | BSD-like | No OCCT dependency |
| **PlaneGCS** | FreeCAD's 2D sketch solver (DogLeg+LM+BFGS) | LGPL | Reference algorithm, production use |
| **MeshLib** | Mesh repair/boolean/reconstruction | Free non-commercial | 10x faster claim on booleans |
| **stl_reader** | Single-header STL reader | BSD 2-Clause | Dead simple integration |

---

## 9. Intermediate Format

All kernel-to-kernel communication uses the **MeshGL triangle soup** structure:

```
vertPos:        [x0, y0, z0,  x1, y1, z1,  ...]   f64 per vertex
triVerts:       [v0, v1, v2,  v3, v4, v5,  ...]   u32 index triples
faceID:         [f0, f0, f0,  f1, f1, f1,  ...]   u32 per triangle
runOriginalID:  [o0, o0, o0,  o1, o1, o1,  ...]   u32 per triangle (optional)
```

**Why this format:**
- Manifold's native format — zero conversion for boolean ops
- OpenGeometry's `Brep.get_triangle_vertex_buffer()` outputs it directly
- STL export is just writing this to disk
- C/Rust/WASM FFI boundary: `&[f64]` + `&[u32]`, no serialization overhead

---

## 10. Recommended Integration Path

```
Trition3D Architecture (target)

Sketch + Constraints
├── Current:  CADmium solver (works, 4 constraint types)
├── Upgrade:  arael-sketch-solver (40+ types, LM + symbolic diff)
└── Future:   solverang (2D+3D+assembly, multi-backend)

B-Rep Construction
├── Primary:  OpenGeometry (extrude, sweep, offset, freeform edit)
└── Backup:   neco-brep (extrude/revolve/sweep/loft)

Boolean Operations
├── Primary:  Manifold (guaranteed manifold, via manifold-csg-rs)
└── Backup:   boolmesh (pure Rust, no C++ build)

Mesh Repair
└── MeshLib (C++ FFI, called on STL import)

Export
├── STL:      Direct from MeshGL (trivial)
├── 3MF:      lib3mf (official C library) or threemf2 (Rust)
├── STEP:     STEPcode (C FFI) or ruststep (Rust)
└── glTF:     mesh-tools or gltf-rs
```

---

## 11. License Compatibility Quick Reference

| Dependency | License | Compatible with Elastic 2.0? |
|-----------|---------|------------------------------|
| Manifold | Apache 2.0 | Yes |
| OpenGeometry | Check npm | Needs verification |
| geop | MIT | Yes |
| boolmesh | MPL-2.0 | File-level copyleft, check |
| csgrs | MIT | Yes |
| ezpz | MIT | Yes |
| solverang | Apache 2.0 | Yes |
| ISOtope | ? | Check |
| arael-sketch-solver | ? | Needs verification |
| STEPcode | BSD-like | Yes |
| lib3mf | BSD 2-Clause | Yes |
| threemf2 | ? | Needs verification |
| ruststep | ? | Needs verification |
| MeshLib | Free non-commercial | Check terms |
| SolveSpace (libslvs) | GPLv3 | **No — hard conflict** |
| PlaneGCS | LGPL | Dynamic linking only |
