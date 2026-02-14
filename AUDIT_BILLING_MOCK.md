# Audit – Système d’abonnement fictif (Mock Billing)

**Rôle :** Senior System Architect / Expert Sécurité  
**Périmètre :** Feature Gating, Billing Mock, Base de données → Backend → Frontend

---

## 1. État des lieux – Ce qui fonctionne bien

### 1.1 Modèle de données (User)

- **Champs billing présents et cohérents :** `plan_tier`, `subscription_active`, `subscription_end_date`, `stripe_customer_id`, `stripe_subscription_id`, `scans_count_today`, `last_scan_date`.
- **Valeurs par défaut correctes :** `plan_tier = "starter"`, `subscription_active = True`, `scans_count_today = 0`. Tout le monde démarre bien en Starter.
- **UserRead** expose bien le plan et les infos nécessaires au frontend.

### 1.2 Backend – Points solides

- **Quota de scans :** `FeatureGuard.check_scan_quota()` est utilisé dans `POST /api/audits/` ; refus 403 si quota dépassé. Reset implicite par date : si `last_scan_date != today` le quota est considéré à zéro (pas de cron nécessaire).
- **Historique :** `GET /api/audits/` applique `history_days` selon le plan (7 / 30 / 3650).
- **Monitors :** Limite par plan (`monitor_limit`) appliquée dans `POST /api/monitors/` avec message d’erreur explicite.
- **Billing mock :** `POST /billing/simulate-upgrade` et `POST /billing/cancel` mettent à jour `plan_tier` en base et font `session.commit()` + `refresh`. Passage Agency → Starter géré dans cancel.
- **Dépendances d’auth :** `get_current_user` / `get_current_active_user` utilisées sur la majorité des routes sensibles.

### 1.3 Frontend

- **Mise à jour immédiate après upgrade :** `refreshUser()` est appelé après `simulateUpgrade()` (pricing et dashboard/subscription). Pas besoin de F5.
- **PDF :** Contrôle côté UI via `user?.plan_tier === "pro" || "agency"` dans `DownloadButton.tsx` (pas de composant `<FeatureLock>` générique, mais logique claire).
- **Subscription page :** Affiche le plan actuel et propose upgrade/downgrade de façon cohérente.

---

## 2. Failles détectées

### 2.1 Critique – Routes non protégées par le plan

| Route | Problème | Risque |
|-------|----------|--------|
| `POST /api/analyze` | Aucune auth, aucun quota. | Un Starter (ou même anonyme) peut lancer autant de scans que voulu ; seul l’enregistrement dans l’historique (POST /api/audits/) consomme le quota. |
| `GET /api/stream` | Idem, pas d’auth. | Même risque. |
| `POST /api/analyze/async` | Pas d’auth ni quota. | Idem. |
| `POST /api/ai/summary` | Pas d’auth. | Feature « ai_assistant » (Pro+) utilisable par n’importe qui. |
| `POST /api/ai/fix` | Pas d’auth. | Idem. |
| `GET/POST/DELETE /api/api-keys/*` | Auth uniquement (get_current_user). | Feature « api_access » (Agency) non appliquée ; tout utilisateur connecté peut créer des clés API. |
| `GET /api/leads/` | Auth uniquement. | Feature « lead_widget » (Agency) non appliquée ; tout le monde peut lister des leads. |

**Test mental demandé :** Il n’existe pas de route `/api/pdf/export` côté backend. L’export PDF est fait côté client. Donc un appel Postman à `/api/pdf/export` renverrait **404**, pas 403. Le verrouillage PDF est uniquement frontend ; si un jour tu exposes un endpoint PDF côté API, il faudra le protéger (Pro+).

### 2.2 Critique – Dépendances `requires_pro_plan` / `requires_agency_plan` inutilisées

- Dans `deps.py`, `requires_pro_plan` et `requires_agency_plan` sont définis mais **jamais utilisés** dans les routers. Aucune route ne les injecte. Donc aucun 403 basé sur le plan pour des routes « feature-gated » côté backend.

### 2.3 Moyen – Billing mock et proxy Next

- Le front appelle `/billing/simulate-upgrade` et `/billing/cancel`. Le proxy Next ne réécrit que `/api/*` vers le backend. Avec `NEXT_PUBLIC_API_URL` vide (proxy), `fetch('/billing/simulate-upgrade')` va vers Next → **404**. La simulation d’upgrade ne fonctionne qu’avec une URL d’API explicite (ex. `http://localhost:8000`). Il manque une réécriture pour `/billing/*` ou il faut exposer le mock sous `/api/billing/*`.

### 2.4 Mineur – Incohérence plan « starter » vs « free »

- Backend et `User` utilisent `plan_tier = "starter"`. Le frontend (subscription page) compare parfois à `'free'`. Si l’API renvoie `plan_tier: "starter"` et le front affiche « free », à harmoniser (par ex. tout en `starter` côté front).

### 2.5 Mineur – Whitelabel (branding) non restreint

- `PATCH /api/users/me` permet à tout utilisateur de modifier `agency_name`, `brand_color`, `logo_url`. Ces champs sont « whitelabel » (Agency). Fonctionnellement acceptable en mock, mais en prod on pourrait restreindre à Agency.

---

## 3. Recommandations de code

### 3.1 Backend – Utiliser les deps et FeatureGuard partout

1. **Analyze (quota + auth) :**
   - Exiger `get_current_user` (ou `get_current_active_user`) sur `POST /api/analyze`, `GET /api/stream`, `POST /api/analyze/async`.
   - Avant de lancer le scan, appeler `FeatureGuard.check_scan_quota(current_user)` et renvoyer 403 si dépassé (même message qu’en audit). Ainsi le coût (scan) est aligné avec le quota.

2. **AI (Pro+) :**
   - Sur `POST /api/ai/summary` et `POST /api/ai/fix`, injecter `Depends(requires_pro_plan)`. Ainsi un appel direct en Postman avec un token Starter renvoie **403 Forbidden**.

3. **API Keys (Agency) :**
   - Sur tous les endpoints `/api/api-keys/*`, remplacer/ajouter `Depends(requires_agency_plan)` (en plus de l’auth). Seuls les comptes Agency peuvent lister/créer/révoquer des clés.

4. **Leads (Agency) :**
   - Sur `GET /api/leads/`, injecter `Depends(requires_agency_plan)`. Seuls les Agency voient les leads du widget.

5. **Optionnel – Historique (feature « history ») :**
   - Aujourd’hui `GET /api/audits/` applique seulement `history_days` (Starter = 7). Pour coller à la config `features`, tu pourrais exiger `FeatureGuard.can_perform_action(user, "history")` et renvoyer 403 pour Starter si tu décides que « history » = Pro+. Sinon, garder le comportement actuel (7 jours pour tout le monde) et documenter.

### 3.2 Backend – Ne pas modifier le quota dans analyze

- Le quota doit être **consommé à un seul endroit** : soit à l’enregistrement de l’audit (`POST /api/audits/`), soit au début de l’analyse. Recommandation : garder la consommation dans `POST /api/audits/` et, dans `POST /api/analyze` (et async/stream), **uniquement vérifier** le quota (sans incrémenter). Si OK, on lance le scan ; le frontend enregistre ensuite l’audit, qui incrémente alors le compteur. Ainsi pas de double comptage et une seule source de vérité.

### 3.3 Frontend – Proxy billing

- Soit ajouter dans `next.config.ts` une réécriture pour le mock :
  - `{ source: "/billing/:path*", destination: "http://127.0.0.1:8000/billing/:path*" }`
- Soit déplacer les routes mock sous l’API : par ex. `POST /api/billing/simulate-upgrade` et `POST /api/billing/cancel`, et adapter le backend (router sous `/api/billing`) et le frontend (appeler `/api/billing/simulate-upgrade` et `/api/billing/cancel`). La seconde option uniformise tout sous `/api` et évite une réécriture dédiée.

### 3.4 DRY – Centraliser la logique « feature »

- Créer une dépendance FastAPI du type `def require_feature(feature: str)` qui :
  - dépend de `get_current_active_user`
  - appelle `FeatureGuard.can_perform_action(user, feature)` et lève 403 si faux.
- Brancher cette dépendance sur les routes AI (`ai_assistant`), API Keys (`api_access`), Leads (`lead_widget`), et éventuellement PDF si tu ajoutes une route. Ainsi une seule définition des noms de features (dans `plans.py`) et pas de duplication de `requires_pro_plan` / `requires_agency_plan` pour chaque feature.

---

## 4. Synthèse

- **Base de données et modèle User :** OK ; champs et défauts cohérents.
- **Billing mock (upgrade/cancel) :** Logique correcte et mise à jour en base ; attention à l’URL (proxy vs direct).
- **Feature gating backend :** **Insuffisant.** Les routes les plus sensibles (analyze, AI, api-keys, leads) ne sont pas protégées par le plan ; les deps `requires_pro_plan` / `requires_agency_plan` ne sont pas utilisées. Un utilisateur Starter peut aujourd’hui :
  - lancer des analyses sans limite,
  - utiliser l’IA et créer des clés API / voir les leads s’il devine les routes.
- **Frontend :** Mise à jour immédiate après upgrade et contrôles UI (PDF, etc.) corrects ; le backend doit rester la référence pour tout ce qui est quota et accès aux features.

Les corrections proposées ci-dessus (protection des routes avec auth + quota ou plan, utilisation des deps existantes ou d’un `require_feature`, et optionnellement proxy/rewrite billing) rendront le système cohérent et sûr de bout en bout.

---

## 5. Corrections appliquées (post-audit)

- **Backend**
  - **AI** : `POST /api/ai/summary` et `POST /api/ai/fix` protégés par `Depends(requires_pro_plan)` → 403 si plan Starter.
  - **API Keys** : tous les endpoints `/api/api-keys/*` protégés par `requires_agency_plan`.
  - **Leads** : `GET /api/leads/` protégé par `requires_agency_plan`.
  - **Analyze** : `POST /api/analyze`, `GET /api/stream`, `POST /api/analyze/async` exigent `get_current_user` + `FeatureGuard.check_scan_quota` → 401 sans token, 403 si quota dépassé.
  - **deps.py** : ajout de `require_feature(feature_name)` pour réutiliser la config PLANS.
- **Frontend**
  - **Billing** : réécriture Next ` /billing` et `/billing/:path*` vers le backend ; `simulateUpgrade` et `cancelSubscription` utilisent `process.env.NEXT_PUBLIC_API_URL ?? ""` pour passer par le proxy.
  - **Analyze** : envoi du `Authorization: Bearer` (token depuis `localStorage`) dans `api.ts` et `useAnalyzeStream.ts` pour tous les appels analyze / stream / async et tasks.
