---
name: "Doc Consistency Guardian"
description: "Check documentation consistency and propose minimal edits to keep docs aligned with project policy and architecture"
argument-hint: "Scope (default: documents/**)"
agent: "agent"
---
Validate and maintain consistency across project documentation for the provided scope.

Language policy:
- Always write all analysis, findings, questions, and summaries in Korean.

Inputs:
- Scope from the user argument. If omitted, use `documents/**` as the default scope.
- Core source-of-truth docs in this priority order:
  1) documents/02-governance/POLICY.md
  2) documents/03-architecture/AZURE_ARCHITECTURE.md
  3) Related docs in documents/** based on topic

Task:
1. Read the scope and identify relevant docs.
2. Detect contradictions, stale statements, mismatched fixed values, and missing cross-doc updates.
3. Report findings ordered by severity with file references and exact conflicting statements.
4. Propose minimal patch edits that resolve conflicts while preserving current structure and tone.
5. If edits are clear, safe, and unambiguous, apply them automatically.
6. Ask the user only when a change is ambiguous, policy precedence is unclear, or multiple valid resolutions exist.

Consistency rules:
- POLICY.md has highest precedence.
- If POLICY.md does not decide, AZURE_ARCHITECTURE.md takes precedence.
- Keep auth/security values aligned across AUTHORIZATION_MODEL.md and related API/ops docs.
- Keep hosting strategy aligned with documents/01-getting-started/HOSTING_STRATEGY.md.
- Do not introduce new hardcoded secrets or values that violate policy.

Output format:
- Findings:
  - [Severity] file path: short issue title
  - Evidence: exact statement A vs statement B
  - Risk: why this inconsistency matters
- Proposed changes:
  - file path: concise edit summary
- Open questions (only if needed):
  - short, decision-oriented questions

When no inconsistency is found:
- Explicitly state "No consistency findings" and list residual risk checks performed.
