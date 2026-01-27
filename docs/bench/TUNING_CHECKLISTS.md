# Check-lists tuning – P19

À utiliser après un **No‑Go** ou pour un dimensionnement ciblé. Cocher au fur et à mesure.

---

## Postgres

- [ ] **PgBouncer** : transaction pooling actif ; `pool_size` / `max_client_conn` alignés avec `max_connections` DB.
- [ ] **shared_buffers** : ~ 25 % RAM DB.
- [ ] **effective_cache_size** : ~ 50–75 % RAM.
- [ ] **work_mem** : 16–64 MB selon requêtes lourdes (sorts, hash).
- [ ] **autovacuum** : agressif sur `factures`, `encaissements`, `telemetry_events` ; `vacuum_cost_limit` si besoin.
- [ ] **Index** : `tenant_id`, `(tenant_id, created_at)`, `(tenant_id, bureau_id)` ; partitions temporelles sur telemetry/audit.
- [ ] **MViews** : `REFRESH MATERIALIZED VIEW CONCURRENTLY` ; ordre par domaine (finance → achats → stocks).
- [ ] **pg_stat_statements** : activé ; analyser top requêtes lentes.

---

## Redis

- [ ] **RAM** : dimensionnée ≥ somme(clés rate-limit + finops + cache) × 1,5.
- [ ] **Evictions** : monitorer ; ajuster `maxmemory-policy` ou capacité.
- [ ] **Latence** : surveiller P99 ; identifier commandes lentes.
- [ ] **Sharding** : si charge clés > 1 nœud, prévoir sharding (ex. par tenant ou préfixe).

---

## API / Workers

- [ ] **Pool DB** : `max` aligné avec PgBouncer ; pas de sur souscription.
- [ ] **Rate-limit** : seuils (P11) homogènes ; Redis opérationnel pour `rateLimitRedis`.
- [ ] **FinOps / back-pressure** : guardrails P16 ON ; `max_rows_per_call`, quotas daily/monthly respectés.
- [ ] **Workers** : refresh MViews non bloquant ; queue évènements suivie ; pas de fuite mémoire.
- [ ] **Logs** : rotation configurée ; pas de remplissage disque.

---

## HPA / K8s

- [ ] **HPA** : scale sur CPU (ex. 65 %) ou RPS/pod si dispo ; `minReplicas` ≥ 2 par AZ.
- [ ] **Ressources** : `requests`/`limits` cohérents ; pas de throttling CPU inutile.
- [ ] **PDB** : `minAvailable` ou `maxUnavailable` pour éviter mise à jour disruptive.

---

*Réf. : [P19_BENCH_CAPACITY_PLANNING.md](./P19_BENCH_CAPACITY_PLANNING.md), [RUNBOOK_BENCH.md](./RUNBOOK_BENCH.md), `tools/capacity/calc.ts`.*
