# 📦 Database Migration Guide — Alembic

> **⚠️ Ne plus utiliser `reset_db.py` en production.** Ce script est bloqué automatiquement si `ENV=production` ou `DEBUG=false`.

---

## Commandes Essentielles (Windows)

> [!IMPORTANT]
> Vous devez utiliser l'exécutable situé dans votre environnement virtuel (`venv`).

### Appliquer toutes les migrations
```powershell
# Depuis le dossier backend/
.\venv\Scripts\alembic upgrade head
```

### Créer une nouvelle migration
```powershell
.\venv\Scripts\alembic revision --autogenerate -m "description"
```

### Vérifier l'état actuel
```powershell
.\venv\Scripts\alembic current
```

---

## Si vous avez activé le venv
Si vous avez déjà fait `.\venv\Scripts\activate`, vous pouvez simplement utiliser :
- `alembic upgrade head`
- `alembic current`

### Voir l'historique des migrations

```bash
cd backend
python -m alembic history
```

### Revenir en arrière (downgrade)

```bash
# Revenir d'une migration
python -m alembic downgrade -1

# Revenir à zéro (toutes les tables supprimées)
python -m alembic downgrade base
```

---

## Workflow Standard

1. **Modifier un modèle** (ex: ajouter un champ dans `app/models/user.py`)
2. **Générer la migration** : `python -m alembic revision --autogenerate -m "description"`
3. **Vérifier le fichier** dans `alembic/versions/` (relire le `upgrade()` et `downgrade()`)
4. **Appliquer** : `python -m alembic upgrade head`
5. **Committer** le fichier de migration avec le code

---

## Fichiers Importants

| Fichier | Rôle |
|---|---|
| `alembic.ini` | Configuration Alembic (le DB URL est lu depuis `.env`) |
| `alembic/env.py` | Import des modèles et connexion DB |
| `alembic/versions/` | Fichiers de migration versionnés |
| `reset_db.py` | ⚠️ DEV ONLY — Drop & recreate (bloqué en prod) |
