import { useEffect, useLayoutEffect, useMemo, useState } from "react";

const isBrowser = typeof window !== "undefined";
const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

type UseMeasureRect = Pick<
  DOMRectReadOnly,
  "x" | "y" | "top" | "left" | "right" | "bottom" | "height" | "width"
>;
type UseMeasureResult<E extends Element = Element> = UseMeasureRect;

const defaultState: UseMeasureRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
};

export function useMeasure<E extends Element = Element>(
  element: E
): UseMeasureResult<E> {
  const [rect, setRect] = useState<UseMeasureRect>(defaultState);

  const observer = useMemo(() => {
    const handleRect = (rect: DOMRectReadOnly) => {
      const { x, y, width, height, top, left, bottom, right } = rect;
      setRect({ x, y, width, height, top, left, bottom, right });
    };

    if (typeof ResizeObserver === "undefined") {
      // If there's no ResizeObserver we'll just
      // use the first measure as rect.
      return {
        observe(target: Element) {
          handleRect(target.getBoundingClientRect());
        },
        disconnect: () => {
          // do nothing
        },
      };
    }

    return new ResizeObserver((entries) => {
      if (entries[0]) {
        handleRect(entries[0].target.getBoundingClientRect());
      }
    });
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!element || !observer) {
      return undefined;
    }

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [element, observer]);

  return rect;
}
