import { BaseEvent } from "three"

export type TNode = {
  class: 'points' | 'curve'
  label: string
  key: string
}

export interface IEntitiesEvent extends BaseEvent {
  type: 'add' | 'remove'
  node: TNode
}

export type TEntitiesEvents =  {
  add: IEntitiesEvent
  remove: IEntitiesEvent
}

