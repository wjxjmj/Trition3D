<script lang="ts">
  import {T, useTask, useParent, useThrelte} from "@threlte/core"

  import type {Camera} from "three"
  import {TrackballControls as ThreeTrackballControls} from "./CadControls.js"

  import {useControlsContext} from "./useControlsContext.svelte.js"
  import type {TrackballControlsProps} from "./TrackballControls.svelte.js"

  let { ...rest }: TrackballControlsProps = $props()

  const parent = useParent()

  const isCamera = (p: any): p is Camera => {
    return p.isCamera
  }

  const {renderer, invalidate} = useThrelte()

  if (!isCamera($parent)) {
    throw new Error("Parent missing: <TrackballControls> need to be a child of a <Camera>")
  }

  const ref = new ThreeTrackballControls($parent, renderer.domElement)

  useTask(ref.update, {
    autoInvalidate: false,
  })

  const ctx = useControlsContext()
  ctx.trackballControls = ref
  $effect(() => {
    return () => {
      ctx.trackballControls = undefined
    }
  })
</script>

<T is={ref} {...rest} onchange={invalidate} />
