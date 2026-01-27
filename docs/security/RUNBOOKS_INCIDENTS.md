# Runbooks Incidents Sécurité - Phase P15

## 📋 Vue d'ensemble

Playbooks pour réponse aux incidents sécurité, intégrés avec P13 (DR) et P15 (Alertes).

---

## 🚨 1. Revocation de Token

### Scénario
Token compromis ou utilisateur suspecté d'activité malveillante.

### Actions

1. **Identifier le token**
   ```sql
   -- Trouver le token dans la DB
   SELECT * FROM auth_tokens WHERE token_hash = sha256('token-compromis');
   ```

2. **Révoquer le token**
   ```sql
   UPDATE auth_tokens 
   SET revoked_at = NOW(), reason = 'security_incident'
   WHERE token_hash = sha256('token-compromis');
   ```

3. **Révoquer toutes les sessions utilisateur** (si nécessaire)
   ```sql
   UPDATE auth_sessions 
   SET revoked_at = NOW()
   WHERE user_id = 'user-id-suspect';
   ```

4. **Notifier l'utilisateur** (via email/SMS)
   - "Votre session a été révoquée pour des raisons de sécurité"

5. **Déclencher alerte** (P15)
   - Type: `unauthorized_access_attempt`
   - Severity: `warning`
   - Canal: Teams + Email

6. **Audit log**
   ```sql
   INSERT INTO security_audit_log (
     tenant_id, user_id, action, resource, reason, timestamp
   ) VALUES (
     'tenant-id', 'user-id', 'token_revoked', 'auth_tokens', 'security_incident', NOW()
   );
   ```

---

## 🔑 2. Rotation de Clés

### Scénario
Clé compromise ou rotation périodique (KEK, JWT, webhooks, SMTP).

### Actions

#### 2.1 Rotation KEK (Key Encryption Key)

1. **Générer nouvelle KEK** (via KMS)
   ```bash
   # Azure Key Vault
   az keyvault key create --vault-name yesselate-kv --name kek-v2 --kty RSA --size 2048
   
   # AWS KMS
   aws kms create-key --description "KEK v2"
   ```

2. **Re-chiffrer toutes les DEK** avec nouvelle KEK
   ```typescript
   import { wrapDek, unwrapDek } from '@/lib/server/security/encryption';
   
   // Pour chaque DEK
   const oldKek = await getKek('kek-v1');
   const newKek = await getKek('kek-v2');
   
   const dek = unwrapDek(envelope, oldKek);
   const newEnvelope = wrapDek(dek, newKek, 'kek-v2');
   
   // Mettre à jour dans DB
   await updateDekEnvelope(dekId, newEnvelope);
   ```

3. **Mettre à jour configuration**
   ```env
   KEK_ID=kek-v2
   ```

4. **Déclencher alerte** (P15)
   - Type: `key_rotation`
   - Severity: `info`
   - Canal: Teams

#### 2.2 Rotation JWT Secret

1. **Générer nouveau secret**
   ```bash
   openssl rand -base64 32
   ```

2. **Mettre à jour dans Secrets Manager**
   ```bash
   # Azure Key Vault
   az keyvault secret set --vault-name yesselate-kv --name jwt-secret-v2 --value "new-secret"
   
   # AWS Secrets Manager
   aws secretsmanager create-secret --name jwt-secret-v2 --secret-string "new-secret"
   ```

3. **Déployer avec période de transition** (support ancien + nouveau secret)
   ```typescript
   const jwtSecrets = [
     process.env.JWT_SECRET_V2, // Nouveau
     process.env.JWT_SECRET_V1, // Ancien (déprécié)
   ];
   
   // Essayer nouveau, puis ancien
   for (const secret of jwtSecrets) {
     try {
       const decoded = jwt.verify(token, secret);
       return decoded;
     } catch {}
   }
   ```

4. **Après période de transition** (ex: 7 jours)
   - Retirer ancien secret
   - Forcer re-authentification si nécessaire

#### 2.3 Rotation Webhooks (Teams)

1. **Créer nouveau webhook** (Teams)
   - Obtenir nouvelle URL

2. **Mettre à jour dans Secrets Manager**
   ```bash
   az keyvault secret set --vault-name yesselate-kv --name teams-webhook-v2 --value "new-url"
   ```

3. **Mettre à jour configuration**
   ```env
   TEAMS_WEBHOOK_URL_SECRET=teams-webhook-v2
   ```

4. **Tester nouveau webhook**
   ```typescript
   await sendTeamsNotification('Test rotation webhook', newWebhookUrl);
   ```

5. **Désactiver ancien webhook** (Teams)

---

## 🔄 3. Failover DB (P13)

### Scénario
DB primaire indisponible, bascule vers standby.

### Actions

1. **Vérifier état standby**
   ```sql
   SELECT pg_is_in_recovery(), pg_last_wal_receive_lsn(), pg_last_wal_replay_lsn();
   ```

2. **Arrêter writes non-critiques** (si possible)
   - Verrouiller endpoints mutation
   - Mode maintenance

3. **Promouvoir standby → primary**
   ```bash
   # Sur standby
   pg_ctl promote -D /var/lib/postgresql/data
   ```

4. **Reconfigurer DATABASE_URL**
   ```env
   DATABASE_URL=postgresql://user:pass@standby-host:5432/db
   ```

5. **Vérifier health endpoint**
   ```bash
   curl https://api.example.com/api/internal/health
   # Attendu: db.role='primary', lag=0
   ```

6. **Relancer workers** (si nécessaire)
   ```bash
   pm2 restart refreshMViewsWorker
   ```

7. **Déclencher alerte** (P15)
   - Type: `db_failover`
   - Severity: `critical`
   - Canal: Teams + SMS

8. **Documenter dans runbook DR** (P13)

---

## 🚫 4. Blocage IP/Tenant

### Scénario
IP ou tenant suspecté d'activité malveillante (rate-limit abuse, export abuse, etc.).

### Actions

#### 4.1 Blocage IP

1. **Identifier IP suspecte**
   ```typescript
   const ip = req.headers.get('x-forwarded-for')?.split(',')[0];
   ```

2. **Ajouter à liste noire** (Redis)
   ```typescript
   await redis.set(`blocked:ip:${ip}`, '1', 'EX', 3600); // 1h
   ```

3. **Mettre à jour firewall** (si nécessaire)
   ```bash
   # iptables
   iptables -A INPUT -s 1.2.3.4 -j DROP
   ```

4. **Middleware de blocage**
   ```typescript
   // middleware.ts
   const blocked = await redis.get(`blocked:ip:${ip}`);
   if (blocked) {
     return NextResponse.json({ error: 'IP blocked' }, { status: 403 });
   }
   ```

5. **Déclencher alerte** (P15)
   - Type: `rate_limit_abuse` ou `export_abuse`
   - Severity: `warning`
   - Canal: Teams

#### 4.2 Blocage Tenant

1. **Identifier tenant suspect**
   ```typescript
   const tenantId = ctx.tenantId;
   ```

2. **Désactiver tenant**
   ```sql
   UPDATE tenants 
   SET enabled = false, disabled_reason = 'security_incident', disabled_at = NOW()
   WHERE id = 'tenant-id';
   ```

3. **Bloquer toutes les requêtes**
   ```typescript
   // middleware.ts
   const tenant = await getTenant(tenantId);
   if (!tenant.enabled) {
     return NextResponse.json({ error: 'Tenant disabled' }, { status: 403 });
   }
   ```

4. **Notifier administrateur tenant** (email)

5. **Déclencher alerte** (P15)
   - Type: `suspicious_activity`
   - Severity: `critical`
   - Canal: Teams + SMS + Email

---

## 📊 5. Containment (Isolation)

### Scénario
Incident sécurité détecté, besoin d'isoler rapidement.

### Actions

1. **Mettre en mode maintenance**
   ```typescript
   // next.config.ts ou env
   MAINTENANCE_MODE=true
   ```

2. **Rediriger trafic** (si nécessaire)
   ```typescript
   // middleware.ts
   if (process.env.MAINTENANCE_MODE === 'true') {
     return NextResponse.redirect('/maintenance');
   }
   ```

3. **Désactiver endpoints critiques**
   ```typescript
   // app/api/export/dashboard/route.ts
   if (process.env.MAINTENANCE_MODE === 'true') {
     return NextResponse.json({ error: 'Maintenance mode' }, { status: 503 });
   }
   ```

4. **Notifier équipe** (Teams + SMS)

5. **Déclencher alerte** (P15)
   - Type: `containment_activated`
   - Severity: `critical`
   - Canal: Teams + SMS

---

## 🔍 6. Investigation

### Scénario
Incident détecté, besoin d'investigation.

### Actions

1. **Collecter logs** (corrID P4)
   ```bash
   # Rechercher par request-id
   grep "x-request-id: abc123" /var/log/app.log
   ```

2. **Analyser métriques** (Prometheus P4)
   ```promql
   rate(http_requests_total{status=~"4..|5.."}[5m])
   ```

3. **Vérifier télémétrie** (P14)
   ```sql
   SELECT * FROM telemetry_events 
   WHERE tenant_id = 'tenant-id' 
   AND occurred_at > NOW() - INTERVAL '1 hour'
   ORDER BY occurred_at DESC;
   ```

4. **Vérifier alertes** (P15)
   ```sql
   SELECT * FROM alert_events 
   WHERE tenant_id = 'tenant-id' 
   AND status = 'open'
   ORDER BY first_seen DESC;
   ```

5. **Documenter findings**
   - Root cause
   - Impact
   - Actions correctives

---

## ✅ Checklist Post-Incident

- [ ] Incident documenté (runbook mis à jour)
- [ ] Root cause identifiée
- [ ] Actions correctives appliquées
- [ ] Métriques surveillées (vérifier résolution)
- [ ] Alerte fermée (P15)
- [ ] Post-mortem planifié (si critique)

---

**Dernière mise à jour** : 2026-01-26
