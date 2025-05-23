import { HTMLProps, useCallback, useEffect, useState } from 'react'
import { ESubclass, IEntitiesEvent, TNode } from '../types'
import { entitiesContext } from '../../contexts'
import { useRefState } from '../../hooks/use-ref-state'
import { EDialog } from '../store/ui-store'
import { AlignMiddle, Bezier, Cookie } from 'react-bootstrap-icons'

interface TTreeNodeProps extends Pick<HTMLProps<HTMLDivElement>, 'onClick'> {
  value: TNode
}

export const TreeNode = ({ value, ...rest }: TTreeNodeProps) => {
  const [selected, setSelected] = useRefState(false)
  const [label, setLabel] = useState(value.label)
  const [isVisible, setVisible] = useState(!value.hidden)

  useEffect(() => {
    const select = (event: IEntitiesEvent) => {
      if (event.node.key === value.key) {
        setSelected(true)
      } else if (selected.current) {
        setSelected(false)
      }
    }
    entitiesContext.addEventListener('open', select)

    const update = (event: IEntitiesEvent) => {
      if (event.node.key === value.key) {
        setLabel(event.node.label)
      }
    }
    entitiesContext.addEventListener('update', update)

    return () => {
      entitiesContext.removeEventListener('open', select)
      entitiesContext.removeEventListener('update', update)
    }
  }, [])

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      setVisible((old) => {
        entitiesContext.setNodeVisibility(value.key, !old)
        return !old
      })
      event.stopPropagation()
      event.preventDefault()
    },
    [value.key]
  )

  return (
    <div
      className={[
        'node',
        selected.current ? 'selected' : '',
        !isVisible ? 'hidden' : '',
      ].join(' ')}
      {...rest}
    >
      <span onClick={onClick}>
        {value.class === EDialog.PointsDialog &&
          (value.subclass === ESubclass.CrossSection ? (
            <AlignMiddle />
          ) : (
            <Cookie />
          ))}
        {value.class === EDialog.CurveDialog && <Bezier />}
      </span>
      &nbsp; &nbsp;
      {label}
    </div>
  )
}
