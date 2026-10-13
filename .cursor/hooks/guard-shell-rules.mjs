// Shell command policy for the beforeShellExecution hook. Kept separate from the
// runner so it can be unit-tested without executing anything.

/** @typedef {{ permission: 'allow' | 'deny' | 'ask', reason?: string }} Decision */

// Order matters: the first matching rule wins, so deny rules come before ask rules.
const RULES = [
  // --- deny: destroys data or history ---
  { permission: 'deny', reason: 'deletes Docker volumes (database data)', pattern: /\bdocker(?:-compose|\s+compose)\b[^|;&]*\bdown\b[^|;&]*(?:\s-v\b|\s--volumes\b)/i },
  { permission: 'deny', reason: 'deletes Docker volumes or prunes the system', pattern: /\bdocker\s+(?:volume\s+(?:rm|prune)|system\s+prune)\b/i },
  { permission: 'deny', reason: 'discards local changes (git reset --hard)', pattern: /\bgit\s+reset\b[^|;&]*--hard\b/i },
  { permission: 'deny', reason: 'rewrites remote history (force push)', pattern: /\bgit\s+push\b[^|;&]*(?:\s-f\b|\s--force\b|\s--force-with-lease\b)/i },
  { permission: 'deny', reason: 'deletes untracked files (git clean -f)', pattern: /\bgit\s+clean\b[^|;&]*\s-[a-z]*f/i },
  // Case-sensitive on purpose: -d (safe delete) is fine, -D (force delete) is not.
  { permission: 'deny', reason: 'force-deletes a branch (git branch -D)', pattern: /\bgit\s+branch\b[^|;&]*\s-D\b/ },
  { permission: 'deny', reason: 'drops or truncates database objects', pattern: /\b(?:drop\s+(?:database|table|schema)|truncate\s+(?:table\s+)?\w)/i },
  { permission: 'deny', reason: 'wipes Redis or a Mongo database', pattern: /\b(?:flushall|flushdb)\b|\bdropDatabase\s*\(/i },

  // --- ask: allowed only with the user's explicit approval ---
  { permission: 'ask', reason: 'runs E2E tests (builds and starts all apps)', pattern: /\bpnpm\s+(?:run\s+)?test:e2e\b|\bplaywright\s+test\b/i },
  { permission: 'ask', reason: 'pushes to a remote', pattern: /\bgit\s+push\b/i },
  { permission: 'ask', reason: 'opens a database client', pattern: /\b(?:psql|mongosh|redis-cli)\b/i },
  { permission: 'ask', reason: 'touches the .env secrets file', pattern: /(?:^|[\s"'=\\/])\.env(?![\w.])/ },
  { permission: 'ask', reason: 'recursively deletes files', pattern: /\brm\s+-[a-z]*(?:rf|fr)\b|\bRemove-Item\b[^|;&]*-Recurse\b/i },
];

/**
 * Decides whether a shell command may run.
 * @param {string} command Full command line as the agent wants to run it.
 * @returns {Decision} First matching rule's decision, or allow.
 */
export function evaluate(command) {
  for (const rule of RULES) {
    if (rule.pattern.test(command)) return { permission: rule.permission, reason: rule.reason };
  }
  return { permission: 'allow' };
}
