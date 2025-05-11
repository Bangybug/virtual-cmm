import { Camera, EventDispatcher, Mesh, Raycaster, Vector2, WebGLRenderer } from "three"
import { ITool, TDisplayMode, TKeyEvents, TMouseEvents, TSurface, TSurfaceEvents } from "./types"
import { ThreeEvent } from "@react-three/fiber"
import { CameraControls } from "@react-three/drei"
import { SurfaceAuxiliaries } from "./surface-auxiliaries"

interface IThreeState {
  pointer: Vector2
  camera?: Camera
  gl: WebGLRenderer
  raycaster: Raycaster
  controls: EventDispatcher | null
  invalidate: (frames?: number) => void;
}

export class SurfaceContext extends EventDispatcher<TSurfaceEvents> {
  readonly displayMode: TDisplayMode = {
    showWireframe: false
  }

  readonly auxiliaries = new SurfaceAuxiliaries(this)

  private threeState?: IThreeState = undefined

  private surfaces = new Map<string, TSurface>()

  private hovered: ThreeEvent<PointerEvent> | undefined = undefined

  #activeTool?: ITool = undefined

  readonly keyboardEvents: TKeyEvents = {
    onKeyPress: event => {
      if (this.#activeTool && this.isActionAllowed()) {
        this.#activeTool.keyboardEvents?.onKeyPress(event)
      }
    },

    onKeyDown: event => {
      if (this.#activeTool && this.isActionAllowed()) {
        this.#activeTool.keyboardEvents?.onKeyDown?.(event)
      }
    },

    onKeyUp: event => {
      if (this.#activeTool && this.isActionAllowed()) {
        this.#activeTool.keyboardEvents?.onKeyUp?.(event)
      }
    },
  }

  readonly mouseEvents: TMouseEvents = {
    onPointerDown: (event: ThreeEvent<PointerEvent>) => {
      if (this.#activeTool && this.isActionAllowed()) {
        this.#activeTool.mouseEvents.onPointerDown(event)
      }
    },

    onPointerMove: (event: ThreeEvent<PointerEvent>) => {
      this.hovered = event
      if (this.#activeTool && this.isActionAllowed()) {
        this.#activeTool.mouseEvents.onPointerMove(event)
      }
    },

    onPointerCanvasMove: (event: React.PointerEvent<HTMLDivElement>) => {
      if (this.#activeTool && this.isActionAllowed()) {
        this.#activeTool.mouseEvents.onPointerCanvasMove?.(event)
      }
    },

    onPointerCanvasOut: () => {
      if (this.#activeTool && this.isActionAllowed()) {
        this.#activeTool.mouseEvents.onPointerCanvasOut?.()
      }
    },

    onPointerUpCanvas: (event: React.PointerEvent<HTMLDivElement>) => {
      if (this.#activeTool && this.isActionAllowed()) {
        this.#activeTool.mouseEvents.onPointerUpCanvas?.(event)
      }
    },

    onPointerUp: (event: ThreeEvent<PointerEvent>) => {
      if (this.#activeTool && this.isActionAllowed()) {
        this.#activeTool.mouseEvents.onPointerUp(event)
      }
    },

    onPointerLeave: () => {
      this.hovered = undefined
      if (this.#activeTool && this.isActionAllowed()) {
        this.#activeTool.mouseEvents.onPointerLeave()
      }
    },

    onPointerEnter: (event: ThreeEvent<PointerEvent>) => {
      this.hovered = event
      if (this.#activeTool && this.isActionAllowed()) {
        this.#activeTool.mouseEvents.onPointerEnter?.(event)
      }
    },
  }

  setThreeState(rootState: IThreeState) {
    this.threeState = rootState
  }

  registerSurface(surface: TSurface) {
    this.surfaces.set(surface.surfaceKey, surface)
    this.dispatchEvent({ type: 'registerSurface', surface });
  }

  unregisterSurface(surfaceKey: string, mesh: Mesh) {
    const surface = this.surfaces.get(surfaceKey)
    if (surface?.mesh === mesh) {
      this.dispatchEvent({ type: 'unregisterSurface', surface })
      this.surfaces.delete(surfaceKey)
    }
  }

  get activeTool(): ITool | undefined {
    return this.#activeTool
  }

  set activeTool(activeTool: ITool) {
    if (this.#activeTool !== activeTool) {
      this.#activeTool?.off()
      this.#activeTool = activeTool
      activeTool.on()

      this.enableCamera()
    }
  }

  deactivateTool(tool: ITool) {
    if (tool === this.#activeTool) {
      tool.off()
    }
  }

  enableCamera() {
    if (this.threeState) {
      (this.threeState.controls as CameraControls).enabled = true
    }
  }

  disableCamera() {
    if (this.threeState) {
      (this.threeState?.controls as CameraControls).enabled = false
    }
  }

  setShowWireframe(enable: boolean) {
    this.displayMode.showWireframe = enable
    this.dispatchEvent({ type: 'displayMode', ...this.displayMode })
    this.threeState?.invalidate(10)
  }

  private isActionAllowed = () =>
    Boolean(this.threeState && !(this.threeState.controls as CameraControls).active)


}