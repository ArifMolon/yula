# YULA OKF Log

Bu dosya append-only knowledge update ledger'dır. Mevcut kayıtlar yeniden yazılmaz veya silinmez.

## Entry format

```markdown
## YYYY-MM-DDTHH:mm:ssZ — KnowledgeUpdateRequested

- Request: kur-...
- Issue: owner/repo#123
- Spec: SPEC-...
- Bounded Context: orchestration
- Pull Request: owner/repo#456
- Capability: domain capability name
- Events: PublishedEventName
- Lessons: lesson ID or none
- Verification: command and result reference
```
