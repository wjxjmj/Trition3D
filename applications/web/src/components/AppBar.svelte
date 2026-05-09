<script lang="ts">
  import {store} from "shared/stores.svelte"
  import fileDownload from "js-file-download"
  import {Download, Upload, Bug, Sun, Moon, MessageCircle, CodeXml} from "lucide-static"
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
      <span class="h-6 w-6 block">{@html Download}</span>
    </div>

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="hover:bg-gray-300 dark:hover:bg-gray-600 rounded p-1">
      <label for="file-inp">
        <span class="h-6 w-6 block">{@html Upload}</span>
        <input id="file-inp" type="file" hidden onchange={fileInput} />
      </label>
    </div>

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="hover:bg-gray-300 dark:hover:bg-gray-600 rounded p-1"
      onclick={() => {
        let asString = JSON.stringify(store.messageHistory)
        fileDownload(asString, `${project.name}.history.json`)
      }}
    >
      <span class="h-6 w-6 block">{@html Bug}</span>
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
      <span class="h-6 w-6 block">
        {#if isDarkMode}
          {@html Moon}
        {:else}
          {@html Sun}
        {/if}
      </span>
    </div>

    <div class="flex-grow flex flex-row-reverse gap-4 mr-4">
      <div>
        <a href="https://discord.com/invite/qJCsKJeyZv" target="_blank">
          <span class="h-6 w-6 block">{@html MessageCircle}</span>
        </a>
      </div>
      <div>
        <a href="https://github.com/Trition3D-Co/Trition3D" target="_blank">
          <span class="h-6 w-6 block">{@html CodeXml}</span>
        </a>
      </div>
    </div>
  </div>
</div>
