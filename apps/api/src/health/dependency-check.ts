/** A single dependency probe used by HealthService. `check` resolves if healthy, rejects otherwise. */
export interface DependencyCheck {
  readonly name: string;
  check(): Promise<void>;
}

/** DI token for the list of all dependency checks. */
export const DEPENDENCY_CHECKS = Symbol('DEPENDENCY_CHECKS');

/** DI token for the per-check timeout in milliseconds. */
export const HEALTH_CHECK_TIMEOUT_MS = Symbol('HEALTH_CHECK_TIMEOUT_MS');
