<script lang="ts">
  import {store} from "shared/stores.svelte"
  import fileDownload from "js-file-download"
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
    <div class="select-none">CADmium</div>
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
        let asString = store.wasmProject.to_json()
        fileDownload(asString, `${project.name}.cadmium`)
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor"><path d="M224,152v56a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V152a8,8,0,0,1,16,0v56H208V152a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,132.69V40a8,8,0,0,0-16,0v92.69L93.66,106.34a8,8,0,0,0-11.32,11.32Z" /></svg>
    </div>

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="hover:bg-gray-300 dark:hover:bg-gray-600 rounded p-1">
      <label for="file-inp">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor"><path d="M224,152v56a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V152a8,8,0,0,1,16,0v56H208V152a8,8,0,0,1,16,0ZM90.34,82.34l32-32a8,8,0,0,1,11.32,0l32,32a8,8,0,0,1-11.32,11.32L136,75.31V128a8,8,0,0,1-16,0V75.31l-18.34,18.35a8,8,0,0,1-11.32-11.32Z" /></svg>
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
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor"><path d="M167.2,92.4A28,28,0,0,0,148,84H108a28,28,0,0,0-19.2,8.4l-1.6,1.6A27.82,27.82,0,0,0,80,105.39V128a8,8,0,0,0,16,0V105.6a12,12,0,0,1,12-12h40a12,12,0,0,1,12,12V128a8,8,0,0,0,16,0V105.6A28,28,0,0,0,167.2,92.4ZM216,48V208a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V48A16,16,0,0,1,56,32H200A16,16,0,0,1,216,48ZM200,48H56V208H200Z" /></svg>
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
      {#if isDarkMode}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor"><path d="M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z" /></svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor"><path d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z" /></svg>
      {/if}
    </div>

    <div class="flex-grow flex flex-row-reverse gap-4 mr-4">
      <div>
        <a href="https://discord.com/invite/qJCsKJeyZv" target="_blank">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor"><path d="M247.51,174.39A220.42,220.42,0,0,1,224,208c-2.79,4.42-6.38,8-10.66,10.72l-.12.07a8,8,0,0,1-9.73-2.39l-16.51-22a155.32,155.32,0,0,1-36.37,8.76,8,8,0,0,1-8.61-7.39,8.16,8.16,0,0,1,7.33-8.71,141.48,141.48,0,0,0,29.81-7.14,4,4,0,0,0,2.31-2.14,176.19,176.19,0,0,0,19.41-50.83,4,4,0,0,0-1.52-3.83A198.4,198.4,0,0,0,181,101.19a4,4,0,0,0-4.27.62,177.83,177.83,0,0,0-69-27.23,4,4,0,0,0-4.06,1.78l-8.68,13a4,4,0,0,0,.26,4.56,153.87,153.87,0,0,1,10.38,14.9,4,4,0,0,1-1.48,5.74A79.62,79.62,0,0,0,75.53,100.67a4,4,0,0,1-5.2-2,82.26,82.26,0,0,1-6-24.67,4,4,0,0,1,2.38-3.79,177.93,177.93,0,0,0-69,27.17,4,4,0,0,0-4.27.62,198.4,198.4,0,0,0-18,18.92,4,4,0,0,0-1.52,3.83,176.19,176.19,0,0,0,19.41,50.83,4,4,0,0,0,2.31,2.14,141.48,141.48,0,0,0,29.81,7.14,8.16,8.16,0,0,1,7.33,8.71,8,8,0,0,1-8.61,7.39,155.32,155.32,0,0,1-36.37-8.76l-16.51,22a8,8,0,0,1-9.73,2.39l-.12-.07c-4.28-2.72-7.87-6.3-10.66-10.72a220.42,220.42,0,0,1-23.51-33.61,8,8,0,0,1,1.35-9.62C64.16,130.93,128,40,128,40s63.84,90.93,79.12,124.76A8,8,0,0,1,247.51,174.39Z" /></svg>
        </a>
      </div>
      <div>
        <a href="https://github.com/mattferraro/cadmium" target="_blank">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor"><path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.36a8,8,0,0,0,6.71-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8,8,0,0,0,1.1,7.69A41.74,41.74,0,0,1,200,104Z" /></svg>
        </a>
      </div>
    </div>
  </div>
</div>
