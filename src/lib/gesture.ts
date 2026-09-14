import type { TouchEvent } from 'react';

export type DragAxis = 'x' | 'y';

/** Starting coordinate of a single-finger touch on the given axis. */
export function dragStart(e: TouchEvent, axis: DragAxis): number {
  return axis === 'x' ? e.touches[0].clientX : e.touches[0].clientY;
}

/** Signed distance moved on the given axis since `start`. */
export function dragDelta(e: TouchEvent, start: number, axis: DragAxis): number {
  return dragStart(e, axis) - start;
}
