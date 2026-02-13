# Discovery Documents

Place your discovery documents from claude.ai in this directory:

- `vision.md` — Product vision, problem statement, target audience, success metrics
- `features.md` — Feature specifications grouped by MVP / V1 / Future
- `personas-and-flows.md` — User personas and journey maps (optional for smaller projects)
- `ux-direction.md` — Design principles and UX philosophy (optional for smaller projects)

**Minimum required:** `vision.md` and `features.md`

After placing the docs, open Claude Code and say: "read the docs and set up this project"

Claude Code will then:
1. Read all discovery docs
2. Recommend a tech stack
3. Generate `architecture.md`
4. Break `features.md` into individual feature files in `features/`
5. Initialize `decisions.md`
6. Scaffold the codebase

Delete this README after setup.
