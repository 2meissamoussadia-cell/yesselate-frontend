/**
 * Hook pour gérer les touch gestures (swipe, pinch, etc.)
 * 
 * Utilisé pour améliorer l'expérience mobile avec des gestures naturels
 */

import { useCallback, useRef, useEffect } from 'react';

export interface TouchGestureCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinchIn?: () => void;
  onPinchOut?: () => void;
}

interface TouchState {
  startX: number;
  startY: number;
  startDistance: number;
  isSwiping: boolean;
  isPinching: boolean;
}

const SWIPE_THRESHOLD = 50; // pixels minimum pour déclencher un swipe
const PINCH_THRESHOLD = 20; // pixels minimum pour déclencher un pinch

/**
 * Hook pour gérer les touch gestures sur un élément
 * 
 * @param callbacks - Callbacks pour les différents gestures
 * @param options - Options de configuration
 * @returns Ref à attacher à l'élément
 * 
 * @example
 * ```tsx
 * const swipeRef = useTouchGestures({
 *   onSwipeLeft: () => navigateNext(),
 *   onSwipeRight: () => navigatePrev(),
 * });
 * 
 * return <div ref={swipeRef}>...</div>;
 * ```
 */
export function useTouchGestures(
  callbacks: TouchGestureCallbacks,
  options: {
    enabled?: boolean;
    preventDefault?: boolean;
  } = {}
) {
  const { enabled = true, preventDefault = true } = options;
  const elementRef = useRef<HTMLElement>(null);
  const touchStateRef = useRef<TouchState | null>(null);

  const getDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || e.touches.length === 0) return;

      if (e.touches.length === 1) {
        // Swipe gesture
        touchStateRef.current = {
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
          startDistance: 0,
          isSwiping: true,
          isPinching: false,
        };
      } else if (e.touches.length === 2) {
        // Pinch gesture
        const distance = getDistance(e.touches[0], e.touches[1]);
        touchStateRef.current = {
          startX: 0,
          startY: 0,
          startDistance: distance,
          isSwiping: false,
          isPinching: true,
        };
      }
    },
    [enabled, getDistance]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !touchStateRef.current) return;

      if (preventDefault) {
        e.preventDefault();
      }

      const state = touchStateRef.current;

      if (state.isSwiping && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - state.startX;
        const deltaY = e.touches[0].clientY - state.startY;

        // Détecter la direction principale
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Swipe horizontal
          if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
            if (deltaX > 0 && callbacks.onSwipeRight) {
              callbacks.onSwipeRight();
              touchStateRef.current = null; // Reset après déclenchement
            } else if (deltaX < 0 && callbacks.onSwipeLeft) {
              callbacks.onSwipeLeft();
              touchStateRef.current = null;
            }
          }
        } else {
          // Swipe vertical
          if (Math.abs(deltaY) > SWIPE_THRESHOLD) {
            if (deltaY > 0 && callbacks.onSwipeDown) {
              callbacks.onSwipeDown();
              touchStateRef.current = null;
            } else if (deltaY < 0 && callbacks.onSwipeUp) {
              callbacks.onSwipeUp();
              touchStateRef.current = null;
            }
          }
        }
      } else if (state.isPinching && e.touches.length === 2) {
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const delta = currentDistance - state.startDistance;

        if (Math.abs(delta) > PINCH_THRESHOLD) {
          if (delta < 0 && callbacks.onPinchIn) {
            callbacks.onPinchIn();
            touchStateRef.current = null;
          } else if (delta > 0 && callbacks.onPinchOut) {
            callbacks.onPinchOut();
            touchStateRef.current = null;
          }
        }
      }
    },
    [enabled, preventDefault, callbacks, getDistance]
  );

  const handleTouchEnd = useCallback(() => {
    touchStateRef.current = null;
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [enabled, preventDefault, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return elementRef;
}
