import { ThreeEvent } from "@react-three/fiber";
import { ITool, TKeyEvents, TMouseEvents } from "../types";
import { surfaceContextInstance } from "../contexts";
import { Mesh } from "three";
import { circle } from "../../renderables/circle";

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
      const bvh = this._mesh?.geometry.boundsTree
      if (event.face?.a === undefined || !bvh) {
        return
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