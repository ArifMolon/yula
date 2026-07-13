# YULA OKF

YULA'nın kalıcı kanonik hafızası provenance taşıyan, git geçmişli OKF Markdown belgeleridir. Embedding modelleri semantik temsilleri üretir; FTS5 ve sqlite-vec bu belgelerden yeniden üretilebilen türetilmiş arama indeksleridir.

## Belge yaşam döngüsü

```text
Todo -> Progress -> Review -> Prod
```

- `Todo`: İşlenmeye hazır, aktif claim taşımayan belge.
- `Progress`: Bir agent tarafından UI/API üzerinden claim edilmiş belge.
- `Review`: Şema, provenance, kaynak ve gerekirse agent review kontrollerinde.
- `Prod`: Kanonik, gözden geçirilmiş ve yeni claim'e açık belge.

GitHub delivery state bu yaşam döngüsünden ayrıdır. Kullanıcı operasyonel durumları Markdown düzenleyerek değiştirmez; UI/API transition komutları kullanılır.

## Claim kuralları

- Claim; owner, session, issue, claimed_at ve lease_expires_at alanlarını taşır.
- Varsayılan lease iki saattir ve yalnız aktif Execution tarafından yenilenebilir.
- Süresi dolmuş claim; HandoffBrief, Execution ve trace kanıtı incelenmeden devralınamaz.
- Devralma öncesinde bir stale-claim recovery kaydı oluşturulur.
- Aktif `Progress` claim'i bulunan belgeyi başka bir agent değiştiremez.

## Yazma sahipliği

Bütün kalıcı OKF, FTS5 ve sqlite-vec yazıları Core'daki tek `KnowledgeWriter` üzerinden serileştirilir. Agentlar, worker'lar ve ingestion araçları ortak SQLite veritabanına doğrudan yazmaz. WAL eşzamanlı okumaları destekler; SQLite'ın tek-yazar özelliğini kaldırmaz.

Her Execution geçici sandbox scratch memory kullanabilir. Knowledge Curator bu içeriği ya siler ya da kaynaklı bilgiyi OKF'e promote eder. Kalıcı agent micro-brain'ları v1 kapsamı dışındadır.

## Dizinler

- `concepts/`: kaynaklı kanonik bilgi belgeleri.
- `contexts/<context>/lessons/`: bounded-context sahipliğindeki doğrulanmış dersler.
- `handoffs/`: issue başına güncel HandoffBrief.
- `event-storming/`: domain discovery kayıtları.
- `log.md`: append-only knowledge update ledger.
