import { useCallback, useEffect, useState } from 'react';

/** A memoized loader owns its result; changing it hides and cancels the old request. */
export function useApiResource(load) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    if (!load) return;
    const controller = new AbortController();

    async function run() {
      try {
        const data = await load(controller.signal);
        if (!controller.signal.aborted) setResult({ load, attempt, data, error: null });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn('[useApiResource] 요청 실패:', error.code || error.status || error.name);
        setResult({ load, attempt, data: null, error });
        controller.abort();
      }
    }

    run();
    return () => controller.abort();
  }, [load, attempt]);

  const current = Boolean(load && result?.load === load && result.attempt === attempt);
  return {
    data: current ? result.data : null,
    error: current ? result.error : null,
    loading: Boolean(load && !current),
    retry,
  };
}
