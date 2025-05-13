import { BaseEvent } from "three"

export type TNode = {
  class: 'points' | 'curve'
  label: string
  key: string
}

export interface IEntitiesEvent extends BaseEvent {
  type: 'add' | 'remove' | 'open'
  node: TNode
}

export type TEntitiesEvents =  {
  add: IEntitiesEvent
  remove: IEntitiesEvent
  open: IEntitiesEvent
}

