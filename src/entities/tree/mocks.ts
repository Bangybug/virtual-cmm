import { Points } from '../../cglib/builders/points'
import { EDialog } from '../store/ui-store'
import { TNode, TNodeKey, TPointCollection } from '../types'
import { createPoints } from '../../renderables/points'

export const mockNodes = (): TNode[] => {
  return [
    { key: '1', label: 'points1', class: EDialog.PointsDialog },
    { key: '2', label: 'curve1', class: EDialog.CurveDialog },
  ]
}

export const mockPoints = (target: Map<TNodeKey, TPointCollection>) => {
  const p = new Points({reserveVertices: 10, componentCount: 3})
  p.addPoint([1.111, 2.222, 3.333])
  p.addPoint([4.111, 5.222, 6.333])

  target.set("1", {
    points: p,
    key: '1',
    renderable: createPoints(p)
  })
}