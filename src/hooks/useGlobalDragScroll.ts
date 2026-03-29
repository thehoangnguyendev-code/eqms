import { useEffect, useRef } from 'react';

type DragState = {
  isDragging: boolean;
  startX: number;
  scrollLeft: number;
  target: HTMLDivElement | null;
  hasMoved: boolean;
};

const DRAG_THRESHOLD = 6;

export const useGlobalDragScroll = () => {
  const dragState = useRef<DragState>({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    target: null,
    hasMoved: false,
  });

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;

      const target = (event.target as HTMLElement)?.closest('div.overflow-x-auto, div.overflow-auto') as HTMLDivElement | null;
      if (!target) return;
      if (target.scrollWidth <= target.clientWidth) return;

      dragState.current = {
        isDragging: true,
        startX: event.clientX,
        scrollLeft: target.scrollLeft,
        target,
        hasMoved: false,
      };

      target.style.cursor = 'grabbing';
      target.style.userSelect = 'none';
      target.classList.add('drag-scroll-target');
      target.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    };

    const handlePointerMove = (event: PointerEvent) => {
      const state = dragState.current;
      if (!state.isDragging || !state.target) return;

      const deltaX = event.clientX - state.startX;
      if (Math.abs(deltaX) > DRAG_THRESHOLD) {
        state.hasMoved = true;
      }
      state.target.scrollLeft = state.scrollLeft - deltaX;
    };

    const stopDrag = () => {
      const state = dragState.current;
      if (!state.isDragging || !state.target) {
        dragState.current.isDragging = false;
        return;
      }

      const target = state.target;
      target.style.cursor = 'grab';
      target.style.userSelect = '';

      if (state.hasMoved) {
        const preventClick = (event: MouseEvent) => {
          event.preventDefault();
          event.stopPropagation();
          target.removeEventListener('click', preventClick, true);
        };
        target.addEventListener('click', preventClick, true);
      }

      dragState.current = {
        isDragging: false,
        startX: 0,
        scrollLeft: 0,
        target: null,
        hasMoved: false,
      };
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', stopDrag);
    document.addEventListener('pointercancel', stopDrag);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', stopDrag);
      document.removeEventListener('pointercancel', stopDrag);
    };
  }, []);
};
