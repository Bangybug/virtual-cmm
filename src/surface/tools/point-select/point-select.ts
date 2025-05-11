import { ThreeEvent } from "@react-three/fiber";
import { ITool, TKeyEvents, TMouseEvents } from "../../types";
import { Mesh } from "three";
import { circle } from "../../../renderables/circle";
import { setCursorToPoint } from "./utils";

export class PointSelect implements ITool {
  private _mesh: Mesh | undefined = undefined

  readonly mouseEvents: TMouseEvents = {
    onPointerDown: (event) => {
      if (event.button !== 0) {
        return
      }
      // TODO get point
    },

    onPointerMove: (event) => {
      if (this._mesh && event.faceIndex) {
        setCursorToPoint({ mesh: this._mesh, cursor: circle, point: event.point, faceIndex: event.faceIndex })
      }
    },

    onPointerUp: () => {
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