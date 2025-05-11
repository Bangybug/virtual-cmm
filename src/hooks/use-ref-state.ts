import { useCallback, useEffect, useRef, useState } from 'react'

export const useRefState = <T>(
  initialValue: T
): [React.RefObject<T>, (value: T) => void] => {
  const [state, setState] = useState<T>(initialValue)
  const stateRef = useRef<T>(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  /** order of setting current and calling setState is important */
  const setStateWithRef = useCallback((value: T) => {
    stateRef.current = value
    setState(value)
  }, [])

  return [stateRef, setStateWithRef]
}
