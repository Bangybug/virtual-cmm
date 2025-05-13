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

  const onDrag = useCallback((e: MouseEvent) => {
    const div = modal.current
    if (div && pos.current) {
      pos.current.left += e.movementX
      pos.current.top += e.movementY
      div.style.left = `${pos.current.left}px`
      div.style.top = `${pos.current.top}px`
    }
  }, [])

  const onMouseUp = useCallback(() => {
    document.removeEventListener('mousemove', onDrag)
    const draggable = modal.current
    if (draggable) {
      draggable.classList.remove('active')
    }
  }, [])

  useEffect(() => {
    const draggable = modal.current
    if (draggable && show) {
      draggable.addEventListener('mousedown', (e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (target.classList?.contains('react-resizable-handle')) {
          return
        }

        draggable.classList.add('active')
        document.addEventListener('mousemove', onDrag)
      })

      document.addEventListener('mouseup', onMouseUp)
    }

    if (!show) {
      if (draggable) {
        document.removeEventListener('mouseup', onMouseUp)
      }
    }
  }, [modal, show, onMouseUp, onDrag])
}
