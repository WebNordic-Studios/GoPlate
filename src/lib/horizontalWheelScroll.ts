/**
 * When the pointer is over a horizontally scrollable element, map vertical
 * wheel/trackpad movement to scrollLeft. Uses a non-passive listener so
 * preventDefault works. At the scroll extremes, the default (page) scroll runs.
 */
export function attachHorizontalWheelScroll(el: HTMLElement): () => void {
  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey) return
    const { scrollWidth, clientWidth } = el
    if (scrollWidth <= clientWidth + 1) return

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (delta === 0) return

    const before = el.scrollLeft
    el.scrollLeft += delta
    if (el.scrollLeft === before) return
    e.preventDefault()
  }

  el.addEventListener('wheel', onWheel, { passive: false })
  return () => el.removeEventListener('wheel', onWheel)
}
