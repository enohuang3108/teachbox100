# Testing

For a user-visible behavior change, a new unit, or a bug fix, read [the testing matrix](docs/testing.md) before editing. It defines the public behavior each unit protects and the cases that require real-device agent verification.

1. Choose one public seam: a deterministic rule, a state boundary, or a teacher/student browser flow.
2. Make that seam red with a focused test, then implement the smallest change that makes it green.
3. Keep deterministic behavior in `lib/**/*.test.ts`; use E2E only when a browser flow crosses a meaningful UI boundary. Keep microphone, WebRTC, physics, and projection checks in the matrix's agent-verification column.
4. Run the affected test first, then the relevant project scripts from `package.json`. Update the matrix when a unit's public behavior or agent-verification need changes.

Done means the changed behavior has a passing test at its chosen seam and the matrix still describes it accurately.
