---
name: handoff
description: Updates docs/progress.md at the end of a session so the next chat can start with small, accurate context. Use when the user says "handoff", "wrap up", "end session", or the context is getting too large.
disable-model-invocation: true
---

# Handoff

Update `docs/progress.md` (keep the whole file under ~60 lines):

1. **Current focus**: feature and task card in progress.
2. **Done this session**: 1–5 bullets, with commit hashes if committed.
3. **Decisions made**: bullets, with links to new ADRs.
4. **Open issues / blockers**: bullets.
5. **Next steps**: the next 1–3 task cards, in order.

Move older "Done" items into the Roadmap checklist instead of growing the file.
Then tell the user: "Start a new chat with `@AGENTS.md @docs/progress.md @<next task card>`".
