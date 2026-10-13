import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { evaluate } from './guard-shell-rules.mjs';

/** Asserts that each command gets the expected permission, optionally on a given branch. */
function expectAll(permission, commands, context = {}) {
  for (const command of commands) {
    const where = context.branch ? ` on ${context.branch}` : '';
    assert.equal(evaluate(command, context).permission, permission, `"${command}"${where} should be ${permission}`);
  }
}

describe('guard-shell rules', () => {
  it('denies destructive commands', () => {
    expectAll('deny', [
      'docker compose down -v',
      'docker compose down --volumes',
      'docker-compose down -v',
      'docker volume rm job-assistant_pg-data',
      'docker volume prune -f',
      'docker system prune -a',
      'git reset --hard HEAD~1',
      'git push --force origin main',
      'git push -f',
      'git push --force-with-lease',
      'git clean -fd',
      'git branch -D feature/x',
      'psql -c "DROP TABLE users"',
      'psql -c "drop database job_assistant"',
      'psql -c "TRUNCATE users"',
      'redis-cli FLUSHALL',
      'mongosh --eval "db.dropDatabase()"',
    ]);
  });

  it('keeps main reachable only through a PR the user merges', () => {
    expectAll('deny', [
      'gh pr merge 12 --squash',
      'git push origin main',
      'git push -u origin HEAD:main',
      'git push origin +main',
    ]);
    expectAll('deny', ['git commit -m "feat: x"', 'git merge card/001-01', 'git push', 'git push -u origin HEAD'], {
      branch: 'main',
    });
  });

  it('closes the bypasses that reach main from a card branch', () => {
    const onCard = { branch: 'card/001-01' };
    expectAll('deny', [
      // switch chained with commit/merge/push: the hook only saw the card branch
      'git switch main && git merge card/001-01 && git push',
      'git checkout main; git commit -m "x"',
      'git switch main\ngit push',
      'git switch -c card/x && git commit -m "x"',
      // other ways to name or include main
      'git push --all',
      'git push origin --all',
      'git push --mirror',
      'git push origin HEAD:refs/heads/main',
      'git push origin +refs/heads/main',
      'git push origin --delete main',
      // global options before the subcommand
      'git -C . push origin main',
      'git -c user.name=x push origin HEAD:main',
      'git --no-pager push --all',
    ], onCard);
    expectAll('deny', ['git -C . commit -m "x"', 'git --no-pager merge card/x'], { branch: 'main' });
  });

  it('allows the card-branch flow: commit, push, and open a PR without asking', () => {
    const onCard = { branch: 'card/001-01' };
    expectAll('allow', ['git switch -c card/001-01', 'git diff --stat', 'git pull', 'gh pr view 12'], onCard);
    expectAll('allow', ['git commit -m "feat(001-01): users table"', 'git push -u origin card/001-01'], onCard);
    expectAll('allow', ['gh pr create --fill --base main', 'git push origin card/001-01:refs/heads/card/001-01'], onCard);
    expectAll('allow', ['git switch main', 'git checkout -b card/001-02', 'git switch main && git pull'], onCard);
    expectAll('allow', ['git push origin card/main-page', 'git push origin main-fix'], { branch: 'card/main-page' });
  });

  it('asks before commit or push when the branch is unknown, and before creating a repo', () => {
    expectAll('ask', ['git commit -m "x"', 'git merge card/x', 'git push', 'git push origin card/x']);
    expectAll('ask', ['gh repo create job-assistant --public'], { branch: 'card/001-01' });
  });

  it('judges git/gh/docker by the command, not by words in quoted text', () => {
    const onCard = { branch: 'card/x' };
    expectAll('allow', [
      'git commit -m "chore: deny gh pr merge and git push --force on main"',
      'git commit -m "docs: never run docker compose down -v" -m "or git reset --hard"',
    ], onCard);
    expectAll('deny', [
      'git status && gh pr merge 1',
      'git status; git push --force',
      'pnpm test | git reset --hard',
      'if ($ok) { git push origin main }',
      'echo hi\ngit clean -fd',
    ], onCard);
  });

  it('asks before E2E, DB clients, .env, and recursive deletes', () => {
    expectAll('ask', [
      'pnpm test:e2e',
      'pnpm run test:e2e',
      'pnpm exec playwright test',
      'psql -h localhost -p 5433 -U job',
      'mongosh mongodb://localhost:27017',
      'redis-cli ping',
      'Get-Content .env',
      'cat .env',
      'Copy-Item .env.example .env',
      'rm -rf dist',
      'Remove-Item -Recurse -Force apps/api/dist',
    ]);
  });

  it('allows everyday commands', () => {
    expectAll('allow', [
      'pnpm test',
      'pnpm test:int',
      'pnpm lint',
      'pnpm dev',
      'docker compose up -d',
      'docker compose down',
      'docker compose ps',
      'git status',
      'git branch -d merged-branch',
      'Get-Content .env.example',
      'pnpm --filter @job-assistant/api add zod',
    ]);
  });
});
