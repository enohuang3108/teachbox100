---
name: teachbox100-testing
description: "Route a TeachBox100 change to its test seam and record the proof the commit gate requires. Read before editing product code, and before a weekly, pre-release, or prod QA round."
---

# TeachBox100 testing

A **proof** is the smallest public check that establishes the behavior a teacher or student experiences.

| Branch | Read |
| --- | --- |
| Changing a behavior, fixing a bug, adding a teaching unit | [`proof.md`](proof.md) |
| Running a QA round — weekly, pre-release, or prod | [`qa.md`](qa.md), invoked as `/qa-test` |
| Dispatching QA sub agents | [`qa-aspects.md`](qa-aspects.md) |
| Writing a case, report, or bug issue | [`qa-templates.md`](qa-templates.md) |

`docs/testing.md` holds the behavior matrix. Both branches select their scope from it, and a change to a unit's public behavior or its real-device requirement is edited there.

## Pick the seam

| Change | Proof | Place |
| --- | --- | --- |
| Rules, data, parsing, encoding, state transitions | A deterministic test | `lib/**/*.test.ts` or `app/**/*.test.ts` |
| A teacher or student browser journey | A Playwright flow | `e2e/<flow>.spec.ts` |
| Microphone, WebRTC, touch feel, physics, animation, audio, projection readability, multiple devices | A real-device case | the matrix plus `/qa-test` |

Make the seam **red** first, implement the smallest **green** change, then run the focused proof.
