import { TNode } from '../types'

export const mockNodes = (): TNode[] => {
  return [
    { key: '1', label: 'points1', class: 'points' },
    { key: '2', label: 'curve1', class: 'curve' },
  ]
}
