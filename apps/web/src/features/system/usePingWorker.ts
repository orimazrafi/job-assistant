import { useMutation } from '@tanstack/react-query';
import { pingWorker } from '../../api/system';

/** Owns the "ping worker" mutation: sends a job through the queue and exposes the result or error. */
export function usePingWorker() {
  return useMutation({ mutationFn: pingWorker });
}
