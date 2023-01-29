import { useEffect, useRef } from "react";

/**
 * We do not allow cleanup in this function since on development, this hook will be called twice
 * which would lead to immediate cleanup.
 */
export const useOnMount = (callback: () => void) => {
  const ran = useRef(false);
  useEffect(() => {
    // This fixes an issue on dev where the effect runs twice
    if (ran.current) {
      return;
    }
    ran.current = true;

    callback();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
