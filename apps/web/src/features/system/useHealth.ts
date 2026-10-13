import { useQuery } from '@tanstack/react-query';
import { fetchHealth } from '../../api/system';
import { systemKeys } from './queryKeys';

/** Owns the health report query; refreshes every 10 s so the page reflects outages quickly. */
export function useHealth() {
  return useQuery({
    queryKey: systemKeys.health,
    queryFn: fetchHealth,
    refetchInterval: 10_000,
  });
}
