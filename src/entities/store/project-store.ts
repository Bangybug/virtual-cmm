import { BaseEvent, EventDispatcher } from "three"
import { TNode, TNodeKey } from "../types"
import { TPointCollection } from "../points/types"

const VERSION = 1

export type TProject = {
  version: number
  tree?: TNode[]
  points?: Record<TNodeKey, { data: number[] }>
}

export interface IProjectLoadEvent extends BaseEvent {
  type: 'load'
  project: TProject
}

export interface IProjectStoreEvent extends BaseEvent {
  type: 'save'
  setProject: (tree: TNode[], points: Map<TNodeKey, TPointCollection>) => void
}

export type TProjectEvents = {
  load: IProjectLoadEvent
  save: IProjectStoreEvent
}

export class ProjectStore extends EventDispatcher<TProjectEvents> {
  constructor() {
    super()

    window.addEventListener('beforeunload', () => {
      this.saveProject()
    })
  }

  loadProject() {
    const item = window.localStorage.getItem('project')
    if (!item) {
      return
    }

    const json = JSON.parse(item) as TProject
    if (json.version !== VERSION) {
      return
    }
    this.dispatchEvent({ type: 'load', project: json })
  }

  saveProject() {
    let tree: TNode[] | undefined = undefined
    let points = new Map<TNodeKey, TPointCollection>()

    this.dispatchEvent({ type: 'save', setProject: (t, p) => { tree = t; points = p } })

    if (!tree) {
      return
    }

    let pointsMap: TProject['points'] | undefined = undefined
    if (points.size) {
      pointsMap = points.entries().reduce((acc: TProject['points'], cur) => {
        const key = cur[0]
        acc![key] = {
          data: cur[1].points.map(p => ([...p])).flat()
        }
        return acc
      }, {} satisfies TProject['points'])
    }

    let p = {
      version: VERSION,
      tree,
      points: pointsMap
    } satisfies TProject

    window.localStorage.setItem('project', JSON.stringify(p))
  }
}
