import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react'

export function useDraggable(
  modal: RefObject<HTMLDivElement | null>,
  show: boolean
) {
  const pos = useRef({ left: 0, top: 0 })

  useLayoutEffect(() => {
    const draggable = modal.current
    if (draggable && (pos.current.left === 0 || pos.current.top === 0)) {
      pos.current.left = Math.floor(
        draggable.offsetLeft - draggable.offsetWidth * 0.5
      )
      pos.current.top = Math.floor(
        draggable.offsetTop - draggable.offsetHeight * 0.5
      )

      draggable.style['transform'] = ''
      draggable.style.left = `${pos.current.left}px`
      draggable.style.top = `${pos.current.top}px`
    }
  })

  const onDrag = useCallback((e: PointerEvent) => {
    const div = modal.current
    if (div && pos.current) {
      pos.current.left += e.movementX
      pos.current.top += e.movementY
      div.style.left = `${pos.current.left}px`
      div.style.top = `${pos.current.top}px`
    }
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const onMouseUp = useCallback((e: PointerEvent) => {
    document.removeEventListener('pointermove', onDrag)
    const draggable = modal.current
    if (draggable) {
      draggable.classList.remove('active')
      draggable.releasePointerCapture(e.pointerId)
    }
  }, [])

  useEffect(() => {
    const draggable = modal.current
    if (draggable && show) {
      draggable.addEventListener('pointerdown', (e: PointerEvent) => {
        const target = e.target as HTMLElement
        // if (target.classList?.contains('react-resizable-handle')) {
        //   return
        // }
        if (!target.classList?.contains('modal-header')) {
          return
        }

        draggable.setPointerCapture(e.pointerId)

        draggable.classList.add('active')
        document.addEventListener('pointermove', onDrag)
      })

      document.addEventListener('pointerup', onMouseUp)
    }

    if (!show) {
      if (draggable) {
        document.removeEventListener('pointerup', onMouseUp)
      }
    }
  }, [modal, show, onMouseUp, onDrag])
}
