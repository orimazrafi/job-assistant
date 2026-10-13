// Shell command policy for the beforeShellExecution hook. Kept separate from the
// runner so it can be unit-tested without executing anything.

/** @typedef {{ permission: 'allow' | 'deny' | 'ask', reason?: string }} Decision */
/** @typedef {{ branch?: string }} Context Current git branch, when known. */

// Start of a command: line start or after a separator (; & | newline) or an opening ( or {.
// git/gh/docker rules use it so the same words inside quoted text, such as a commit
// message, don't trigger them. DB and file rules stay unanchored on purpose: the danger
// is often inside quotes (psql -c "DROP TABLE ...").
const AT_CMD = String.raw`(?:^|[;&|\n({])\s*`;

// `git` plus any global options before the subcommand (`git -C dir push`, `git -c k=v commit`).
const GIT = String.raw`git(?:\s+-[cC]\s+\S+|\s+--[\w-]+(?:=\S+)?)*\s+`;
// A push destination naming main: `main`, `:main`, `+main`, or `refs/heads/main`.
const MAIN_REF = String.raw`[\s:+](?:refs/heads/)?main(?![\w/.-])`;

/** Builds a regex for `source` that only matches at the start of a command. */
function cmd(source, flags = 'i') {
  return new RegExp(AT_CMD + source, flags);
}

// Order matters: the first matching rule wins, so deny rules come before ask rules.
// A rule with `onBranch` only applies when the current branch matches it; one with
// `branchUnknown` only when the hook could not read the branch.
// Commits, card-branch pushes, and PRs are allowed: the user reviews at the PR merge.
const RULES = [
  // --- deny: code reaches main only through a PR the user merges on GitHub ---
  { permission: 'deny', reason: 'merges a pull request (only the user merges, on GitHub)', pattern: cmd(String.raw`gh\s+pr\s+merge\b`) },
  { permission: 'deny', reason: 'pushes to main (push the card branch and open a PR)', pattern: cmd(String.raw`${GIT}push\b[^|;&]*${MAIN_REF}`) },
  { permission: 'deny', reason: 'pushes every branch, main included (push only the card branch)', pattern: cmd(String.raw`${GIT}push\b[^|;&]*\s--(?:all|mirror)\b`) },
  // The hook reads the branch before the command runs, so a switch chained with a commit or
  // push would act on a branch the hook never saw.
  { permission: 'deny', reason: 'switches branch and commits, merges, or pushes in one command (run the switch on its own)', pattern: cmd(String.raw`${GIT}(?:switch|checkout)\b[\s\S]*[;&|\n({]\s*${GIT}(?:commit|merge|push)\b`) },
  { permission: 'deny', reason: 'pushes from main (switch to the card branch)', pattern: cmd(String.raw`${GIT}push\b`), onBranch: 'main' },
  { permission: 'deny', reason: 'commits or merges directly on main (create the card branch first)', pattern: cmd(String.raw`${GIT}(?:commit|merge)\b`), onBranch: 'main' },

  // --- deny: destroys data or history ---
  { permission: 'deny', reason: 'deletes Docker volumes (database data)', pattern: cmd(String.raw`docker(?:-compose|\s+compose)\b[^|;&]*\bdown\b[^|;&]*(?:\s-v\b|\s--volumes\b)`) },
  { permission: 'deny', reason: 'deletes Docker volumes or prunes the system', pattern: cmd(String.raw`docker\s+(?:volume\s+(?:rm|prune)|system\s+prune)\b`) },
  { permission: 'deny', reason: 'discards local changes (git reset --hard)', pattern: cmd(String.raw`${GIT}reset\b[^|;&]*--hard\b`) },
  { permission: 'deny', reason: 'rewrites remote history (force push)', pattern: cmd(String.raw`${GIT}push\b[^|;&]*(?:\s-f\b|\s--force\b|\s--force-with-lease\b)`) },
  { permission: 'deny', reason: 'deletes untracked files (git clean -f)', pattern: cmd(String.raw`${GIT}clean\b[^|;&]*\s-[a-z]*f`) },
  // Case-sensitive on purpose: -d (safe delete) is fine, -D (force delete) is not.
  { permission: 'deny', reason: 'force-deletes a branch (git branch -D)', pattern: cmd(String.raw`${GIT}branch\b[^|;&]*\s-D\b`, '') },
  { permission: 'deny', reason: 'drops or truncates database objects', pattern: /\b(?:drop\s+(?:database|table|schema)|truncate\s+(?:table\s+)?\w)/i },
  { permission: 'deny', reason: 'wipes Redis or a Mongo database', pattern: /\b(?:flushall|flushdb)\b|\bdropDatabase\s*\(/i },

  // --- ask: allowed only with the user's explicit approval ---
  { permission: 'ask', reason: 'runs E2E tests (builds and starts all apps)', pattern: /\bpnpm\s+(?:run\s+)?test:e2e\b|\bplaywright\s+test\b/i },
  { permission: 'ask', reason: 'commits or pushes, and the current branch is unknown (it could be main)', pattern: cmd(String.raw`${GIT}(?:commit|merge|push)\b`), branchUnknown: true },
  { permission: 'ask', reason: 'creates a GitHub repository', pattern: cmd(String.raw`gh\s+repo\s+create\b`) },
  { permission: 'ask', reason: 'opens a database client', pattern: /\b(?:psql|mongosh|redis-cli)\b/i },
  { permission: 'ask', reason: 'touches the .env secrets file', pattern: /(?:^|[\s"'=\\/])\.env(?![\w.])/ },
  { permission: 'ask', reason: 'recursively deletes files', pattern: /\brm\s+-[a-z]*(?:rf|fr)\b|\bRemove-Item\b[^|;&]*-Recurse\b/i },
];

/**
 * Decides whether a shell command may run.
 * @param {string} command Full command line as the agent wants to run it.
 * @param {Context} [context] Current branch; when unknown, commits and pushes need approval.
 * @returns {Decision} First matching rule's decision, or allow.
 */
export function evaluate(command, context = {}) {
  for (const rule of RULES) {
    if (rule.onBranch && rule.onBranch !== context.branch) continue;
    if (rule.branchUnknown && context.branch) continue;
    if (rule.pattern.test(command)) return { permission: rule.permission, reason: rule.reason };
  }
  return { permission: 'allow' };
}
