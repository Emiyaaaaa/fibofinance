import { useCallback, useRef } from "react";

export const useSetInterval = (callback: () => void, delay: number) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef(false);

  const start = useCallback(() => {
    if (isRunningRef.current) return;

    intervalRef.current = setInterval(callback, delay);
    isRunningRef.current = true;
  }, [callback, delay]);

  const stop = useCallback(() => {
    if (!isRunningRef.current) return;

    setTimeout(
      () => clearInterval(intervalRef.current as NodeJS.Timeout),
      delay + 100
    );
    isRunningRef.current = false;
  }, []);

  return { start, stop };
};
