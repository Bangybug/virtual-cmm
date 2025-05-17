import { ThreeEvent } from "@react-three/fiber";
import { ITool, TKeyEvents, TMouseEvents } from "../../types";
import { Mesh, Vector3 } from "three";
import { circle } from "../../../renderables/circle";
import { setCursorToPoint } from "./utils";
import { entitiesContext, surfaceContextInstance } from "../../../contexts";

export class PointSelect implements ITool {
  private _mesh: Mesh | undefined = undefined

  private meshPointAtCursor?: {
    point: Vector3,
    normal: Vector3
  }

  readonly mouseEvents: TMouseEvents = {
    onPointerDown: (event) => {
    },

    onPointerMove: (event) => {
      if (event.buttons !== 0) {
        return
      }

      if (this._mesh && event.faceIndex) {
        this.updateCursorPoint(
          setCursorToPoint({ mesh: this._mesh, cursor: circle, point: event.point, faceIndex: event.faceIndex })
        )
      }
    },

    onPointerUp: (event) => {
      // TODO create points node if not found
      if (!surfaceContextInstance.isActionAllowed()) {
        return
      }
      const { activeNode } = entitiesContext
      const data = activeNode && entitiesContext.getPoints(activeNode.key)
      const point = this.getCursorMeshPoint(event.point)
      if (data && point) {
        data.points.addPoint([point.x, point.y, point.z])
        entitiesContext.updatePoints(activeNode.key, data.points)
      }
      event.stopPropagation()
    },

    onPointerLeave: () => {
      this.hide()
    },

    onPointerCanvasOut: () => {
      this.mouseEvents.onPointerLeave()
    },

    onPointerEnter: (event: ThreeEvent<PointerEvent>) => {
      this._mesh = event.eventObject as Mesh
      this._mesh.parent?.add(circle)
      event.stopPropagation()
      this.mouseEvents.onPointerMove(event)
      this.show()
    }
  }

  keyboardEvents?: TKeyEvents | undefined;


  on = () => {
    this._mesh = undefined

    return true
  }

  off = () => {
    circle.removeFromParent()
    this._mesh = undefined
    return true
  }

  private show = () => {
    circle.visible = true
  }

  public hide = () => {
    circle.visible = false
  }

  public isVisible = () => {
    return circle.visible
  }


  private updateCursorPoint(p?: Vector3[]) {
    if (!p) {
      return
    }
    if (!this.meshPointAtCursor) {
      this.meshPointAtCursor = {
        point: p[0],
        normal: p[1]
      }
    } else {
      this.meshPointAtCursor.point = p[0]
      this.meshPointAtCursor.normal = p[1]
    }
  }

  private getCursorMeshPoint(point: Vector3): Vector3 {
    return this.meshPointAtCursor?.point || point
  }

}