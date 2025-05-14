import { EDialog } from '../store/ui-store'
import { TNode } from '../types'

export const mockNodes = (): TNode[] => {
  return [
    { key: '1', label: 'points1', class: EDialog.PointsDialog },
    { key: '2', label: 'curve1', class: EDialog.CurveDialog },
  ]
}
