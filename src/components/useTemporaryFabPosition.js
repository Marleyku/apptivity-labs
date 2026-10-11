import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const MOVE_THRESHOLD_PX2 = 25;
const MARGIN = 8;

/**
 * Temporary FAB drag offset. Resets on route change / remount (page load).
 * Does not persist. Returns style override + pointer handlers for the FAB button.
 *
 * Usage:
 *   const { fabStyle, fabPointerProps, onFabClick } = useTemporaryFabPosition(openFeedback);
 *   <button style={fabStyle} {...fabPointerProps} onClick={onFabClick} … />
 */
export function useTemporaryFabPosition(openFeedback) {
  const location = useLocation();
  const [pos, setPos] = useState(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    setPos(null);
  }, [location.pathname, location.search, location.hash]);

  const fabStyle = pos
    ? { left: pos.left, top: pos.top, right: 'auto', bottom: 'auto', position: 'fixed' }
    : undefined;

  function onPointerDown(e) {
    if (e.button !== 0) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    dragRef.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origLeft: rect.left,
      origTop: rect.top,
      moved: false,
    };
    suppressClickRef.current = false;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  function onPointerMove(e) {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && dx * dx + dy * dy < MOVE_THRESHOLD_PX2) return;
    d.moved = true;
    suppressClickRef.current = true;
    const el = e.currentTarget;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const left = Math.min(Math.max(MARGIN, d.origLeft + dx), window.innerWidth - w - MARGIN);
    const top = Math.min(Math.max(MARGIN, d.origTop + dy), window.innerHeight - h - MARGIN);
    setPos({ left, top });
  }

  function onPointerUp(e) {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  function onFabClick(e) {
    if (suppressClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
      suppressClickRef.current = false;
      return;
    }
    openFeedback?.(e);
  }

  return {
    fabStyle,
    fabPointerProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
    onFabClick,
  };
}
