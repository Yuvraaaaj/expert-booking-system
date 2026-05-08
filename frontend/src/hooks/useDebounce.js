import { useState, useEffect } from 'react';

/**
 * Debounces a value, delaying its update by `delay` ms.
 * @param {any} value  — the value to debounce
 * @param {number} delay — debounce delay in milliseconds (default 400ms)
 * @returns {any} debounced value
 */
const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
