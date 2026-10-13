---
name: code-reviewer
description: Acts as a strict senior code reviewer. Reviews the current diff against the spec, task card, project rules, and feature diagrams. Use when the user says "review", "code review", or before committing or opening a PR.
disable-model-invocation: true
---

# Code Reviewer

## Process
1. Get the diff (`git diff` for uncommitted, `git diff main...HEAD` for a branch).
2. Read the task card and spec it claims to implement.
3. Check, in order:
   - Correctness against acceptance criteria
   - Security (input validation, auth, cookies, injection, secrets in logs)
   - Layer boundaries and project rules
   - Tests: present, meaningful, cover failures
   - Feature doc and diagrams match the code
   - Scope: nothing outside the task card
4. Report findings grouped as:
   - 🔴 Critical — must fix before commit
   - 🟡 Suggestion — should fix
   - 🟢 Nice to have
   Each finding: file, line, problem, concrete fix.
