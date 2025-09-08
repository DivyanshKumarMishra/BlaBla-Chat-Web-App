import { useCallback, useRef } from 'react';

function useDebounce(cb, delay) {
  const timer = useRef(null);

  const debouncedFunction = useCallback(
    (...args) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }

      timer.current = setTimeout(() => {
        cb(...args);
      }, delay);
    },
    [cb, delay]
  );

  return debouncedFunction;
}

export default useDebounce;
