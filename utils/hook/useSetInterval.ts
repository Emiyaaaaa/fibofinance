import { useCallback, useRef } from "react";

export const useSetInterval = (callback: () => void, delay: number) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef(false);

  const start = useCallback(() => {
    console.log("start", isRunningRef.current);
    if (isRunningRef.current) return;

    intervalRef.current = setInterval(callback, delay);
    isRunningRef.current = true;
  }, [callback, delay]);

  const stop = useCallback(() => {
    console.log("stop", isRunningRef.current);
    if (!isRunningRef.current) return;

    setTimeout(
      () => clearInterval(intervalRef.current as NodeJS.Timeout),
      delay + 100
    );
    isRunningRef.current = false;
  }, []);

  return { start, stop };
};
