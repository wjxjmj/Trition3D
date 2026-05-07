import {useThrelteUserContext} from "@threlte/core"
import type {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js"
import type {TrackballControls} from "three/examples/jsm/controls/TrackballControls.js"

type ControlsContext = {
  orbitControls: OrbitControls | undefined
  trackballControls: TrackballControls | undefined
}

/**
 * ### `useControlsContext`
 *
 * This hook is used to register the `OrbitControls` or `TrackballControls` instance
 * with the `ControlsContext`. We're using this context to enable and disable the
 * controls when the user is interacting with the TransformControls.
 */
export const useControlsContext = (): ControlsContext => {
  let ctx = { orbitControls: undefined as OrbitControls | undefined, trackballControls: undefined as TrackballControls | undefined }
  return useThrelteUserContext<ControlsContext>("threlte-controls", { ...ctx } as any)
}
