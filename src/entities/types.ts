import { BaseEvent } from "three"
import { EDialog } from "./store/ui-store"

export type TNodeKey = string

export enum ESubclass {
  CrossSection
}

export type TNode = {
  class: EDialog
  subclass?: ESubclass
  hidden?: boolean
  label: string
  key: TNodeKey
}

export interface IEntitiesEvent extends BaseEvent {
  type: 'add' | 'remove' | 'open' | 'update'
  node: TNode
}

export type TEntitiesEvents =  {
  add: IEntitiesEvent
  remove: IEntitiesEvent
  open: IEntitiesEvent
  update: IEntitiesEvent
}
