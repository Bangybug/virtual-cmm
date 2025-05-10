import { ThreeEvent } from '@react-three/fiber'
import { BaseEvent, Mesh } from 'three'

export type TMouseEvents = {
  onPointerDown: (event: ThreeEvent<PointerEvent>) => void
  onPointerMove: (event: ThreeEvent<PointerEvent>) => void
  onPointerCanvasMove?: (event: React.PointerEvent<HTMLDivElement>) => void
  onPointerCanvasOut?: () => void
  onPointerUpCanvas?: (event: React.PointerEvent<HTMLDivElement>) => void
  onPointerUp: (event: ThreeEvent<PointerEvent>) => void
  onPointerLeave: () => void
  onPointerEnter?: (event: ThreeEvent<PointerEvent>) => void
}

export type TKeyEvents = {
  onKeyPress: (event: KeyboardEvent) => void
  onKeyDown?: (event: KeyboardEvent) => void
  onKeyUp?: (event: KeyboardEvent) => void
}

export interface ITool {
  mouseEvents: TMouseEvents
  keyboardEvents?: TKeyEvents

  on: () => boolean
  off: () => boolean
}

export type TSurface = {
  mesh: Mesh,
  surfaceKey: string
  source: string | File
}

export interface ISurfaceEvent extends BaseEvent {
  type: 'surfaceChanged' | 'registerSurface' | 'unregisterSurface'
  surfaceKey: string
}

export type TSurfaceEvents =  {
  surfaceChanged: ISurfaceEvent
  registerSurface: ISurfaceEvent
  unregisterSurface: ISurfaceEvent
}