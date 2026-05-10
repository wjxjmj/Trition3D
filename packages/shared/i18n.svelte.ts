// Simple reactive i18n using Svelte 5 runes.
// Add new keys to both dictionaries; use `t.keyname` in components.
// The language switcher in AppBar reads/writes localStorage('lang').

const en = {
  // Browser tree
  planes: "Planes",
  bodies: "Bodies",
  sketches: "Sketches",
  noSolids: "No solids yet",
  noSketches: "No sketches yet",
  noPlanes: "No planes yet",
  // Feature panels
  history: "History",
  solids: "Solids",
  extrusion: "Extrusion",
  sketch: "Sketch",
  plane: "Plane",
  point: "Point",
  // Form labels
  name: "Name",
  length: "Length",
  faces: "Faces",
  surface: "Surface",
  // Buttons
  done: "Done",
  cancel: "Cancel",
  // Actions
  newProject: "New Project",
  download: "Download",
  upload: "Upload",
  rename: "Rename",
  hide: "Hide",
  show: "Show",
  delete: "Delete",
  // Sketch tools
  "tool.select": "Select",
  "tool.line": "Line",
  "tool.circle": "Circle",
  "tool.rectangle": "Rectangle",
  "newSketch": "New Sketch",
  solve: "Solve",
  step: "Step",
  // Context menu
  downloadOBJ: "Download as OBJ",
  downloadSTEP: "Download as STEP",
  // CubeGizmo faces
  front: "Front",
  back: "Back",
  top: "Top",
  bottom: "Bottom",
  left: "Left",
  right: "Right",
  // CubeGizmo arrows
  up: "Up",
  down: "Down",
  // Misc
  language: "Language",
  darkMode: "Dark Mode",
  comingSoon: "Coming soon",
  reportBug: "Report a bug",
  sourceCode: "Source code",
}

const zh: typeof en = {
  planes: "基准面",
  bodies: "实体",
  sketches: "草图",
  noSolids: "暂无实体",
  noSketches: "暂无草图",
  noPlanes: "暂无基准面",
  history: "历史",
  solids: "实体",
  extrusion: "拉伸",
  sketch: "草图",
  plane: "基准面",
  point: "点",
  name: "名称",
  length: "长度",
  faces: "面",
  surface: "表面",
  done: "完成",
  cancel: "取消",
  newProject: "新建项目",
  download: "下载",
  upload: "打开",
  rename: "重命名",
  hide: "隐藏",
  show: "显示",
  delete: "删除",
  "tool.select": "选择",
  "tool.line": "直线",
  "tool.circle": "圆",
  "tool.rectangle": "矩形",
  "newSketch": "新建草图",
  solve: "求解",
  step: "步进",
  downloadOBJ: "导出 OBJ",
  downloadSTEP: "导出 STEP",
  front: "前",
  back: "后",
  top: "上",
  bottom: "下",
  left: "左",
  right: "右",
  up: "上",
  down: "下",
  language: "语言",
  darkMode: "深色模式",
  comingSoon: "即将推出",
  reportBug: "报告问题",
  sourceCode: "源代码",
}

const dicts = { en, zh } as const
type Lang = keyof typeof dicts

export const langState = $state<{ code: Lang }>({
  code: ((typeof localStorage !== "undefined" && localStorage.getItem("lang")) || "en") as Lang,
})

export function setLang(code: Lang) {
  langState.code = code
  if (typeof localStorage !== "undefined") localStorage.setItem("lang", code)
}

/** Reactive — reads langState.code ($state) so Svelte tracks the dependency. */
export function tr() {
  return dicts[langState.code]
}
