import { useEffect, useRef } from 'react'

export default function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ring = ringRef.current
    const dot = dotRef.current
    if (!ring || !dot) return

    const onMove = (e: MouseEvent) => {
      dot.style.left = e.clientX + 'px'
      dot.style.top = e.clientY + 'px'
      ring.style.left = e.clientX + 'px'
      ring.style.top = e.clientY + 'px'
    }

    const isInteractive = (target: EventTarget | null) =>
      target instanceof HTMLElement && target.closest('a, button, input, [data-hover]')

    const onOver = (e: MouseEvent) => {
      if (isInteractive(e.target)) ring.classList.add('hovering')
    }

    const onOut = (e: MouseEvent) => {
      if (isInteractive(e.target)) ring.classList.remove('hovering')
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </>
  )
}