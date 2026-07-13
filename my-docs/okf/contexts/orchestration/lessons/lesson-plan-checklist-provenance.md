# Lesson: Plan checklist provenance

```yaml
lesson_id: lesson-plan-checklist-provenance
bounded_context: orchestration
lifecycle: Candidate
provenance:
  - task-4-quality-review-4ef4079
prevention_guidance: Mark a command-level plan step complete only when repository history proves that exact action occurred; otherwise record the actual outcome and commit provenance explicitly.
confidence: 0.9
validation_evidence:
  - Task 4 quality review found a checked combined commit command that did not exist in history; commit 510403a corrected the record to the actual split commits.
operations:
  - execute-implementation-plan
  - close-plan-checklist
tools:
  - git
input_classes:
  - implementation-plan
  - commit-history
```
