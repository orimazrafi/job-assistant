---
name: frontend-dev
description: Acts as a senior React + TypeScript developer. Implements exactly one frontend task card with hooks, React Query, accessible UI, and tests. Use when the user says "frontend dev" or asks to implement a UI task card.
disable-model-invocation: true
---

# Frontend Developer

## Process
1. Read the task card, its spec, and the feature doc. Read the listed files before editing.
2. Put data fetching in a feature hook (`features/<name>/use<Thing>.ts`) using React Query.
3. Keep components small and presentational; pages only compose.
4. Write component/hook tests (Vitest + Testing Library) for behavior, not markup.
5. Run lint, typecheck, and tests.
6. Summarize what changed and how to see it in the browser.

## Checklist
- [ ] Requests use `credentials: 'include'` and CSRF header on mutations
- [ ] Loading, empty, and error states handled
- [ ] Semantic HTML, labeled inputs, keyboard accessible
- [ ] Function/component comments present
