import { ThreeEvent } from "@react-three/fiber";
import { ITool, TKeyEvents, TMouseEvents } from "../../types";
import { Mesh } from "three";
import { circle } from "../../../renderables/circle";
import { setCursorToPoint } from "./utils";
import { entitiesContext } from "../../../contexts";

export class PointSelect implements ITool {
  private _mesh: Mesh | undefined = undefined

  readonly mouseEvents: TMouseEvents = {
    onPointerDown: (event) => {
    },

    onPointerMove: (event) => {
      if (event.buttons !== 0) {
        return
      }

      if (this._mesh && event.faceIndex) {
        setCursorToPoint({ mesh: this._mesh, cursor: circle, point: event.point, faceIndex: event.faceIndex })
      }
    },

    onPointerUp: (event) => {
      // TODO create points node if not found
      const { activeNode } = entitiesContext
      const data = activeNode && entitiesContext.getPoints(activeNode.key)
      if (data) {
        data.points.addPoint([event.point.x, event.point.y, event.point.z])
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


}