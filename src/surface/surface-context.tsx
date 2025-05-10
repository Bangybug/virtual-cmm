import { Camera, EventDispatcher, Mesh, Raycaster, Vector2, WebGLRenderer } from "three"
import { ITool, TDisplayMode, TKeyEvents, TMouseEvents, TSurface, TSurfaceEvents } from "./types"
import { ThreeEvent } from "@react-three/fiber"
import { CameraControls } from "@react-three/drei"

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
    this.dispatchEvent({ type: 'registerSurface', surfaceKey: surface.surfaceKey })
  }

  unregisterSurface(surfaceKey: string, mesh: Mesh) {
    if (this.surfaces.get(surfaceKey)?.mesh === mesh) {
      this.dispatchEvent({ type: 'unregisterSurface', surfaceKey })
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

  enableCamera() {
    (this.threeState?.controls as CameraControls).enabled = true
  }

  disableCamera() {
    (this.threeState?.controls as CameraControls).enabled = false
  }

  setShowWireframe(enable: boolean) {
    this.displayMode.showWireframe = enable
    this.dispatchEvent({type: 'displayMode', ...this.displayMode})
    this.threeState?.invalidate()
  }

  private isActionAllowed = () =>
    !(this.threeState?.controls as CameraControls).active


}