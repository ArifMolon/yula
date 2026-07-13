# Lesson: Canonical instruction source coverage

```yaml
lesson_id: lesson-canonical-instruction-source-coverage
bounded_context: orchestration
lifecycle: Candidate
provenance:
  - final-review-feature-shared-agent-instructions-510403a
prevention_guidance: Contract-test both link resolution and the complete minimum source set an agent needs to resume work, including governing ADRs, designs, schemas, policies, scripts, and tracker state.
confidence: 0.8
validation_evidence:
  - Final whole-branch review found missing operating-model ADR, design, and schema links after task-level reviews had passed.
operations:
  - author-agent-instructions
  - review-agent-handoff-readiness
tools:
  - node-test
  - git
input_classes:
  - agent-instruction-markdown
  - canonical-source-index
```
