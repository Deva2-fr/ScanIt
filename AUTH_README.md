# 🔐 Système d'Authentification - Documentation

## Vue d'ensemble

Ce système d'authentification implémente une solution complète et sécurisée pour votre application SaaS avec :
- **Backend FastAPI** avec SQLModel et SQLite
- **Frontend Next.js** avec Shadcn/UI
- **JWT** pour la gestion des sessions
- **Bcrypt** pour le hashing des mots de passe

---

## 📦 Backend (FastAPI)

### Structure des fichiers

```
backend/
├── app/
│   ├── core/
│   │   ├── __init__.py
│   │   └── security.py          # Fonctions de sécurité (JWT, hashing)
│   ├── models/
│   │   └── user.py              # Modèles SQLModel pour User
│   ├── api/
│   │   ├── analyze.py           # Routes existantes
│   │   └── auth.py              # Routes d'authentification
│   ├── database.py              # Configuration DB SQLite
│   ├── deps.py                  # Dépendances (get_current_user)
│   ├── config.py                # Configuration (JWT secret)
│   └── main.py                  # Point d'entrée FastAPI
├── database.db                  # Base de données SQLite (créée au démarrage)
└── requirements.txt             # Dépendances Python
```

### Installation Backend

```bash
cd backend
pip install -r requirements.txt
```

### Configuration

Modifiez `backend/.env` pour définir votre clé secrète JWT :

```env
SECRET_KEY=your-very-secret-key-change-this-in-production
```

⚠️ **IMPORTANT** : En production, générez une clé sécurisée :
```bash
openssl rand -hex 32
```

### Démarrage Backend

```bash
cd backend
python run.py
```

Le serveur démarre sur `http://localhost:8000`

### Endpoints API

#### 1. Inscription
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123!",
  "full_name": "John Doe"  // optionnel
}
```

**Réponse (201 Created)** :
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "created_at": "2026-01-31T15:00:00"
}
```

#### 2. Connexion (JSON)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

**Réponse (200 OK)** :
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### 3. Connexion (OAuth2 - Form)
```http
POST /api/auth/token
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=securePassword123!
```

#### 4. Profil utilisateur (Route protégée)
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Réponse (200 OK)** :
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "created_at": "2026-01-31T15:00:00"
}
```

### Utilisation dans vos routes

Pour protéger une route existante :

```python
from fastapi import APIRouter, Depends
from app.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/api/protected-route")
async def protected_route(current_user: User = Depends(get_current_user)):
    """Route protégée nécessitant une authentification"""
    return {
        "message": f"Hello {current_user.email}",
        "user_id": current_user.id
    }
```

---

## 🎨 Frontend (Next.js)

### Structure des fichiers

```
frontend/src/
├── app/
│   ├── login/
│   │   └── page.tsx             # Page de connexion
│   ├── register/
│   │   └── page.tsx             # Page d'inscription
│   ├── profile/
│   │   └── page.tsx             # Page de profil
│   └── layout.tsx               # Layout avec AuthProvider
├── components/
│   ├── ui/                      # Composants Shadcn/UI
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── label.tsx
│   │   ├── avatar.tsx
│   │   └── badge.tsx
│   ├── auth-header.tsx          # Header avec navigation
│   └── user-profile.tsx         # Composant profil utilisateur
└── contexts/
    └── AuthContext.tsx          # Context React pour auth
```

### Installation Frontend

```bash
cd frontend
npm install
```

### Configuration

Le fichier `.env.local` contient déjà :
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Démarrage Frontend

```bash
cd frontend
npm run dev
```

L'application démarre sur `http://localhost:3000`

### Utilisation du Context Auth

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, login, register, logout, loading } = useAuth()

  // Connexion
  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123')
      // Redirection automatique ou affichage
    } catch (error) {
      console.error(error)
    }
  }

  // Inscription
  const handleRegister = async () => {
    try {
      await register('user@example.com', 'password123', 'John Doe')
      // Login automatique après inscription
    } catch (error) {
      console.error(error)
    }
  }

  // Déconnexion
  const handleLogout = () => {
    logout()
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <div>Please login</div>
  }

  return (
    <div>
      <h1>Welcome {user?.email}</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}
```

### Routes disponibles

- `/login` - Page de connexion
- `/register` - Page d'inscription
- `/profile` - Page de profil (protégée)

---

## 🔒 Sécurité

### Bonnes pratiques implémentées

✅ **Hashing des mots de passe** : Bcrypt avec salt automatique
✅ **JWT sécurisé** : Tokens signés avec HS256
✅ **Validation des données** : Pydantic (Backend) et validations (Frontend)
✅ **Protection CORS** : Configuration dans FastAPI
✅ **Validation email** : Format vérifié côté client et serveur
✅ **Mots de passe forts** : Minimum 8 caractères requis
✅ **Expiration des tokens** : 7 jours par défaut
✅ **Routes protégées** : Middleware d'authentification

### Points d'attention pour la production

⚠️ **À FAIRE avant la mise en production** :

1. **Générer une vraie clé secrète JWT** :
   ```bash
   openssl rand -hex 32
   ```
   
2. **Utiliser HTTPS** :
   - Tous les appels API doivent être en HTTPS
   - Les cookies doivent avoir l'attribut `Secure`

3. **Passer à PostgreSQL** :
   - SQLite n'est pas recommandé en production
   - Migrer vers PostgreSQL ou MySQL

4. **Implémenter le refresh token** :
   - Actuellement, seul l'access token existe
   - Ajouter un système de refresh token

5. **Limiter les tentatives de connexion** :
   - Ajouter un rate limiting sur `/auth/login`
   - Bloquer les comptes après X tentatives

6. **Ajouter la vérification email** :
   - Envoyer un email de confirmation
   - Vérifier l'email avant activation

7. **Implémenter "Mot de passe oublié"** :
   - Système de reset par email

8. **Logger les événements de sécurité** :
   - Connexions suspectes
   - Échecs de connexion
   - Changements de mot de passe

---

## 🧪 Tests

### Test Backend (avec curl)

#### Inscription
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'
```

#### Connexion
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Récupérer le profil
```bash
TOKEN="your-token-here"
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Test Frontend

1. Ouvrez `http://localhost:3000/register`
2. Créez un compte
3. Vous êtes automatiquement connecté et redirigé
4. Visitez `/profile` pour voir vos informations
5. Utilisez le dropdown dans le header pour vous déconnecter

---

## 📚 Dépendances ajoutées

### Backend (`requirements.txt`)
```txt
sqlmodel>=0.0.14
passlib[bcrypt]>=1.7.4
python-jose[cryptography]>=3.3.0
python-multipart>=0.0.6
```

### Frontend (`package.json`)
```json
{
  "@radix-ui/react-avatar": "^1.1.16",
  "@radix-ui/react-label": "^2.1.8"
}
```

---

## 🎯 Prochaines étapes suggérées

1. **Ajouter des rôles utilisateur** (user, admin, etc.)
2. **Implémenter la vérification email**
3. **Ajouter "Mot de passe oublié"**
4. **Créer des tests unitaires**
5. **Migrer vers PostgreSQL**
6. **Implémenter le refresh token**
7. **Ajouter l'authentification OAuth (Google, GitHub)**
8. **Créer un tableau de bord admin**

---

## 🐛 Résolution de problèmes

### Erreur : "Email already registered"
→ L'email existe déjà en base. Utilisez un autre email ou supprimez `database.db`.

### Erreur : "Could not validate credentials"
→ Le token JWT est invalide ou expiré. Reconnectez-vous.

### Erreur CORS
→ Vérifiez que `NEXT_PUBLIC_API_URL` pointe vers le bon backend.
→ Vérifiez la configuration CORS dans `backend/app/config.py`.

### Token non envoyé
→ Vérifiez que le token est bien stocké dans `localStorage`.
→ Vérifiez le header `Authorization: Bearer <token>`.

---

## 📞 Support

Pour toute question ou problème :
- Consultez la documentation FastAPI : https://fastapi.tiangolo.com
- Consultez la documentation Next.js : https://nextjs.org/docs
- Consultez la documentation Shadcn/UI : https://ui.shadcn.com

---

**Créé le** : 31 janvier 2026
**Version** : 1.0.0
