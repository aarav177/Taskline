import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

const EMPTY = { tasks: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } };

// Loads one page of tasks plus the status counts, and reloads when the filters change.
export function useTasks(filters) {
  const [data, setData] = useState(EMPTY);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const { status, priority, search, sort, order, page } = filters;
  useEffect(() => {
    let cancelled = false; // ignore answers that arrive after the filters changed again
    setLoading(true);
    setError('');

    Promise.all([api.listTasks({ status, priority, search, sort, order, page }), api.getStats()])
      .then(([list, counts]) => {
        if (cancelled) return;
        setData(list);
        setStats(counts);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [status, priority, search, sort, order, page, version]);

  return { tasks: data.tasks, pagination: data.pagination, stats, loading, error, refresh };
}
