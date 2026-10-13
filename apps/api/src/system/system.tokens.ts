/** DI token for the QueueEvents listener of the `system` queue (used to await job results). */
export const SYSTEM_QUEUE_EVENTS = Symbol('SYSTEM_QUEUE_EVENTS');

/** DI token for how long `POST /api/system/ping` waits for the worker, in milliseconds. */
export const PING_TIMEOUT_MS = Symbol('PING_TIMEOUT_MS');
