import {
  Camera,
  EventDispatcher,
  Mesh,
  Plane,
  Raycaster,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import {
  ITool,
  TDisplayMode,
  TKeyEvents,
  TMouseEvents,
  TSurface,
  TSurfaceEvents,
} from './types'
import { ThreeEvent } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import { SurfaceAuxiliaries } from './surface-auxiliaries'
import { setCursorToPoint } from './tools/point-select/utils'
import { circle } from '../renderables/circle'

interface IThreeState {
  pointer: Vector2
  camera?: Camera
  gl: WebGLRenderer
  raycaster: Raycaster
  controls: EventDispatcher | null
  invalidate: (frames?: number) => void
}

export class SurfaceContext extends EventDispatcher<TSurfaceEvents> {
  readonly displayMode: TDisplayMode = {
    showWireframe: false,
  }

  readonly auxiliaries = new SurfaceAuxiliaries(this)

  private threeState?: IThreeState = undefined

  private surfaces = new Map<string, TSurface>()

  private hovered: ThreeEvent<PointerEvent> | undefined = undefined

  private isEnteredSurface = false

  private isCameraUpdating = false

  #activeTool?: ITool = undefined

  showCrossSection(mesh: Mesh, visible: boolean, plane?: Plane): boolean {
    const surface = this.getSurfaceFor(mesh)
    if (!surface || (visible && !plane)) {
      return false
    }

    this.dispatchEvent({
      type: 'crossSectionDisplay',
      visible,
      surface,
      plane
    })
    return true
  }

  getSurfaceFor(mesh: Mesh) {
    return this.surfaces.values().find(v => v.mesh === mesh)
  }

  readonly keyboardEvents: TKeyEvents = {
    onKeyPress: (event) => {
      if (this.#activeTool && this.isActionAllowed()) {
        this.#activeTool.keyboardEvents?.onKeyPress(event)
      }
    },

    onKeyDown: (event) => {
      if (this.#activeTool && this.isActionAllowed()) {
        this.#activeTool.keyboardEvents?.onKeyDown?.(event)
      }
    },

    onKeyUp: (event) => {
      if (this.#activeTool && this.isActionAllowed()) {
        this.#activeTool.keyboardEvents?.onKeyUp?.(event)
      }
    },
  }

  readonly mouseEvents: TMouseEvents = {
    onPointerDown: (event: ThreeEvent<PointerEvent>) => {
      if (this.#activeTool && this.isActionAllowed()) {
        this.#activeTool.mouseEvents.onPointerDown(event)
        this.threeState?.invalidate(10)
      }
    },

    onPointerMove: (event: ThreeEvent<PointerEvent>) => {
      this.hovered = event
      if (this.#activeTool && this.isActionAllowed()) {
        this.#activeTool.mouseEvents.onPointerMove(event)
        this.threeState?.invalidate(10)
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
      if (!this.isEnteredSurface) {
        return
      }

      if (this.#activeTool && this.isActionAllowed()) {
        this.#activeTool.mouseEvents.onPointerUp(event)
      }
    },

    onPointerLeave: () => {
      if (!this.isEnteredSurface) {
        return
      }

      this.isEnteredSurface = false
      this.hovered = undefined
      if (this.#activeTool && this.isActionAllowed()) {
        this.#activeTool.mouseEvents.onPointerLeave()
      }
      this.enableCamera()
    },

    onPointerEnter: (event: ThreeEvent<PointerEvent>) => {
      if (event.buttons !== 0) {
        return
      }

      this.isEnteredSurface = true

      this.hovered = event
      if (this.#activeTool && this.isActionAllowed()) {
        this.#activeTool.mouseEvents.onPointerEnter?.(event)
        this.threeState?.invalidate(10)
      }
      this.disableCamera()
    },
  }

  setThreeState(rootState: IThreeState) {
    this.threeState = rootState
  }

  registerSurface(surface: TSurface) {
    this.surfaces.set(surface.surfaceKey, surface)
    this.dispatchEvent({ type: 'registerSurface', surface })
  }

  unregisterSurface(surfaceKey: string, mesh: Mesh) {
    const surface = this.surfaces.get(surfaceKey)
    if (surface?.mesh === mesh) {
      this.dispatchEvent({ type: 'unregisterSurface', surface })
      this.surfaces.delete(surfaceKey)
    }
  }

  invalidate() {
    this.threeState?.invalidate()
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
      this.#activeTool = undefined
    }
  }

  enableCamera() {
    if (this.threeState?.controls) {
      ; (this.threeState.controls as CameraControls).enabled = true
    }
  }

  disableCamera() {
    if (this.threeState?.controls) {
      ; (this.threeState.controls as CameraControls).enabled = false
    }
  }

  setShowWireframe(enable: boolean) {
    this.displayMode.showWireframe = enable
    this.dispatchEvent({ type: 'displayMode', ...this.displayMode })
    this.threeState?.invalidate(10)
  }

  isActionAllowed = () => true
  // TODO no way to disable camera or pointer actions while it is moving
  // !this.isCameraUpdating
  // Boolean(this.threeState?.controls && (this.threeState.controls as CameraControls).currentAction || 0 === 0)

  onCameraStart = () => {
    this.isCameraUpdating = true
  }

  onCameraEnd = () => {
    this.isCameraUpdating = false
  }

  setCursorAtMeshPoint(point: Vector3, alignToMesh: boolean = true) {
    const firstSurfaceKey = this.surfaces.keys().next().value
    if (firstSurfaceKey !== undefined) {
      const surface = this.surfaces.get(firstSurfaceKey)
      const bvh = surface?.mesh.geometry.boundsTree
      if (bvh) {
        const hit = bvh.closestPointToPoint(point)
        if (hit) {
          setCursorToPoint({
            mesh: surface.mesh,
            cursor: circle,
            faceIndex: hit.faceIndex,
            point,
            alignToMesh,
          })
          circle.visible = true
          this.invalidate()
        }
      }
    }
  }
}
