# Lesson: Delivery patterns are not domain language

```yaml
lesson_id: lesson-delivery-patterns-are-not-domain-language
bounded_context: orchestration
lifecycle: Candidate
provenance:
  - spec-p0-domain-discovery-issues-12-15-user-review
prevention_guidance: Keep delivery mechanics such as tracer bullet in the operating model; use the owning bounded context's Ubiquitous Language and the concrete domain outcome in issue titles, Project presentation, handoffs, and domain-facing documentation.
confidence: 0.9
validation_evidence:
  - User review identified that the Tracer issue prefix made Domain Discovery work appear to be test-only work.
operations:
  - decompose-spec-issue
  - name-domain-work-item
tools:
  - github-issues
  - matt-to-tickets
input_classes:
  - domain-facing-issue-title
  - delivery-plan
```
