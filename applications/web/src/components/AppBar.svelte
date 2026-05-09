<script lang="ts">
  import {store} from "shared/stores.svelte"
  import fileDownload from "js-file-download"
  import {Download, Upload, Bug, Sun, Moon, MessageCircle} from "lucide-static"
  import type {WithTarget} from "shared/types"
  import {isProject} from "shared/typeGuards"
  import {base} from "../base"
  import {renameProject} from "shared/projectUtils"

  const log = (function () { const context = "[AppBar.svelte]"; const color="gray"; return Function.prototype.bind.call(console.log, console, `%c${context}`, `font-weight:bold;color:${color};`)})() // prettier-ignore

  let {
    project,
    renaming = false,
    newProjectName = "",
    onnewFileContent,
  }: {
    project: Project
    renaming?: boolean
    newProjectName?: string
    onnewFileContent?: (content: string) => void
  } = $props()

  let isDarkMode = $state(localStorage.getItem("theme") === "dark")

  $effect(() => {
    project
    project && !isProject(project) && console.error("[AppBar.svelte] [project] fails isProject(project) typecheck", project)
  })

  function fileInput(e: WithTarget<Event, HTMLInputElement>) {
    const target = e.target as HTMLInputElement
    const file = target.files![0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = function (e) {
      onnewFileContent?.(e.target?.result as string)
    }
    reader.readAsText(file)
  }
</script>

<div class="bg-gray-200 dark:bg-gray-900 dark:text-slate-300 h-[45px]">
  <div class="flex items-center gap-4 bg-gray-">
    <div class="shrink-0 select-none">
      <img class="object-cover h-10 w-10 ml-4" alt="logo" src="{base}/cadmium_logo_min.svg" />
    </div>
    <div class="select-none">Trition3D</div>
    {#if renaming}
      <input
        class="bg-gray-300 text-gray-700 py-2 px-4 font-medium"
        type="text"
        bind:value={newProjectName}
        onblur={() => {
          log("Renaming project aborted")
          renaming = false
          newProjectName = project.name ?? ""
        }}
        onkeydown={e => {
          if (e.key === "Enter") {
            log("Renaming project")
            renameProject(newProjectName)
            project.name = newProjectName
            renaming = false
          }
        }}
      />
    {:else}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="font-medium"
        ondblclick={() => {
          log("Renaming project")
          renaming = true
          newProjectName = project.name ?? ""
        }}
      >
        {project.name ?? ""}
      </div>
    {/if}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="hover:bg-gray-300 dark:hover:bg-gray-600 rounded p-1"
      onclick={() => {
        let json = JSON.parse(store.wasmProject.to_json())
        json["__trition3d_hiddenSketches"] = store.hiddenSketches
        json["__trition3d_hiddenSolids"] = store.hiddenSolids
        fileDownload(JSON.stringify(json), `${project.name}.tri`)
      }}
    >
      <span class="h-6 w-6 block pointer-events-none">{@html Download}</span>
    </div>

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="hover:bg-gray-300 dark:hover:bg-gray-600 rounded p-1">
      <label for="file-inp">
        <span class="h-6 w-6 block pointer-events-none">{@html Upload}</span>
        <input id="file-inp" type="file" hidden onchange={fileInput} />
      </label>
    </div>

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="hover:bg-gray-300 dark:hover:bg-gray-600 rounded p-1"
      onclick={() => {
        window.open("https://github.com/wjxjmj/Trition3D/issues", "_blank")
      }}
    >
      <span class="h-6 w-6 block pointer-events-none">{@html Bug}</span>
    </div>

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="hover:bg-gray-300 dark:hover:bg-gray-600 rounded p-1"
      onclick={() => {
        if (localStorage.getItem("theme") === "light") {
          document.documentElement.classList.add("dark")
          localStorage.setItem("theme", "dark")
          isDarkMode = true
        } else {
          document.documentElement.classList.remove("dark")
          localStorage.setItem("theme", "light")
          isDarkMode = false
        }
      }}
    >
      <span class="h-6 w-6 block pointer-events-none">
        {#if isDarkMode}
          {@html Moon}
        {:else}
          {@html Sun}
        {/if}
      </span>
    </div>

    <div class="flex-grow flex flex-row-reverse gap-4 mr-4">
      <div class="opacity-30 cursor-not-allowed" title="Coming soon">
        <span class="h-6 w-6 block pointer-events-none">{@html MessageCircle}</span>
      </div>
      <div>
        <a href="https://github.com/wjxjmj/Trition3D" target="_blank">
          <svg class="h-6 w-6" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
        </a>
      </div>
    </div>
  </div>
</div>
