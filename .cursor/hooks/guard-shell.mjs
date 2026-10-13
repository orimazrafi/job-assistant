// Cursor beforeShellExecution hook: reads { command, cwd } JSON on stdin and answers
// allow / deny / ask on stdout. Policy lives in guard-shell-rules.mjs.
import { execFileSync } from 'node:child_process';
import { evaluate } from './guard-shell-rules.mjs';

/** Returns the current git branch in `cwd`, or undefined outside a repo or on a detached HEAD. */
function currentBranch(cwd) {
  try {
    const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      cwd: cwd || undefined,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 3000,
    }).trim();
    return branch && branch !== 'HEAD' ? branch : undefined;
  } catch {
    return undefined;
  }
}

/** Builds the hook response for a decision; messages explain the block to the user and agent. */
function toResponse(decision) {
  if (decision.permission === 'allow') return { permission: 'allow' };
  const verb = decision.permission === 'deny' ? 'Blocked' : 'Needs your approval';
  return {
    permission: decision.permission,
    user_message: `${verb}: this command ${decision.reason}.`,
    agent_message: `Guardrail hook: command ${decision.reason}. See .cursor/rules/guardrails.mdc.`,
  };
}

/**
 * Parses the hook payload. On Windows the payload can start with stray BOM bytes,
 * so parsing starts at the first `{`. Returns undefined while the JSON is incomplete.
 */
function tryParse(buffer) {
  const start = buffer.indexOf('{');
  if (start === -1) return undefined;
  try {
    return JSON.parse(buffer.slice(start));
  } catch {
    return undefined;
  }
}

let buffer = '';
let answered = false;

/** Writes the response once and exits. */
function respond(input) {
  if (answered) return;
  answered = true;
  const cwd = typeof input.cwd === 'string' ? input.cwd : undefined;
  const response = toResponse(evaluate(String(input.command ?? ''), { branch: currentBranch(cwd) }));
  process.stdout.write(JSON.stringify(response), () => process.exit(0));
}

// Respond as soon as the input parses: the caller may not close stdin.
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  const input = tryParse(buffer);
  if (input) respond(input);
});
process.stdin.on('end', () => {
  const input = tryParse(buffer);
  if (input) return respond(input);
  // Exiting without output makes Cursor apply failClosed (block).
  process.stderr.write('guard-shell: could not parse hook input\n');
  process.exit(1);
});
