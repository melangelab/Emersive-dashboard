import { useEffect, useRef } from "react"

export default function useInterval(callback: () => void, delay: number | null, now?: boolean) {
  const savedCallback = useRef<(() => void) | null>(null)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    function tick() {
      savedCallback.current?.()
    }
    if (delay !== null) {
      const id = setInterval(tick, delay)
      if (now) tick()
      return () => clearInterval(id)
    }
    return undefined
  }, [delay, now])
}
