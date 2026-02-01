# 🎉 Système d'Authentification - Démarrage Rapide

## ✅ Installation Complète !

Votre système d'authentification est maintenant **entièrement configuré** et prêt à être utilisé !

---

## 🚀 Démarrage en 2 minutes

### 1. **Backend (Terminal 1)**
```bash
cd backend
python run.py
```
✅ Le serveur démarre sur `http://localhost:8000`

### 2. **Frontend (Terminal 2)**
```bash
cd frontend
npm run dev
```
✅ L'application démarre sur `http://localhost:3000`

---

## 🧪 Test Rapide

### Option 1 : Via le Frontend (Recommandé)

1. Ouvrez votre navigateur : `http://localhost:3000/register`
2. Créez un compte avec :
   - Email : `test@example.com`
   - Mot de passe : `password123` (min 8 caractères)
   - Nom complet : `Test User` (optionnel)
3. Cliquez sur **Create Account**
4. ✅ Vous êtes automatiquement connecté !
5. Visitez `/profile` pour voir vos informations

### Option 2 : Via l'API (curl)

#### Inscription
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"full_name\":\"Test User\"}"
```

#### Connexion
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

#### Récupérer le profil
```bash
# Remplacez YOUR_TOKEN par le token reçu à la connexion
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📁 Ce qui a été créé

### Backend
```
backend/app/
├── core/
│   └── security.py          ✅ JWT & hashing (bcrypt)
├── models/
│   └── user.py              ✅ Modèle User SQLModel
├── api/
│   └── auth.py              ✅ Routes auth (register/login/me)
├── database.py              ✅ Configuration SQLite
├── deps.py                  ✅ Dépendances (get_current_user)
└── main.py                  ✅ Mise à jour avec routes auth
```

### Frontend
```
frontend/src/
├── app/
│   ├── login/page.tsx       ✅ Page de connexion
│   ├── register/page.tsx    ✅ Page d'inscription
│   └── profile/page.tsx     ✅ Page de profil
├── contexts/
│   └── AuthContext.tsx      ✅ Context React pour l'auth
├── components/
│   ├── ui/
│   │   ├── label.tsx        ✅ Nouveau composant
│   │   └── avatar.tsx       ✅ Nouveau composant
│   ├── auth-header.tsx      ✅ Header avec navigation
│   └── user-profile.tsx     ✅ Affichage du profil
```

---

## 🔐 Routes disponibles

### Backend API
| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| POST | `/api/auth/register` | Créer un compte | ❌ Non |
| POST | `/api/auth/login` | Se connecter (JSON) | ❌ Non |
| POST | `/api/auth/token` | Se connecter (OAuth2) | ❌ Non |
| GET | `/api/auth/me` | Profil utilisateur | ✅ Oui |

### Frontend Pages
| URL | Description | Auth requise |
|-----|-------------|--------------|
| `/login` | Connexion | ❌ Non |
| `/register` | Inscription | ❌ Non |
| `/profile` | Profil utilisateur | ✅ Recommandé |
| `/` | Page d'accueil | ❌ Non |

---

## 💡 Utilisation dans votre code

### Protéger une route Backend

```python
from fastapi import APIRouter, Depends
from app.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/api/my-protected-route")
async def my_route(current_user: User = Depends(get_current_user)):
    return {
        "message": f"Hello {current_user.email}!",
        "user_id": current_user.id
    }
```

### Utiliser l'auth dans un composant Frontend

```tsx
'use client'
import { useAuth } from '@/contexts/AuthContext'

export default function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth()

  if (!isAuthenticated) {
    return <a href="/login">Se connecter</a>
  }

  return (
    <div>
      <p>Bienvenue {user?.email}</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  )
}
```

---

## 📖 Documentation complète

Consultez `AUTH_README.md` pour :
- Structure détaillée des fichiers
- Exemples de code complets
- Sécurité et best practices
- Gestion des erreurs
- Déploiement en production

---

## ⚡ Prochaines étapes

✅ **Fait** :
- [x] Authentication complète (register/login)
- [x] JWT avec bcrypt
- [x] Pages frontend modernes
- [x] Context React pour la session
- [x] Routes protégées

🔜 **À implémenter** (optionnel) :
- [ ] Vérification email
- [ ] Mot de passe oublié
- [ ] Refresh tokens
- [ ] Rôles utilisateur (user/admin)
- [ ] OAuth (Google, GitHub)

---

## 🐛 En cas de problème

### Le backend ne démarre pas
→ Vérifiez que les dépendances sont installées : `pip install -r requirements.txt`

### Le frontend affiche des erreurs
→ Installez les dépendances : `npm install`

### "Email already registered"
→ L'email existe déjà. Supprimez `backend/database.db` pour recommencer.

### Token invalide
→ Le token a expiré (7 jours). Reconnectez-vous.

### CORS errors
→ Vérifiez que le backend tourne sur le bon port (8000)

---

## 📞 Documentation

- **FastAPI** : https://fastapi.tiangolo.com
- **Next.js** : https://nextjs.org
- **SQLModel** : https://sqlmodel.tiangolo.com
- **Shadcn/UI** : https://ui.shadcn.com

---

**🎉 Félicitations ! Votre système d'authentification est prêt à l'emploi !**

*Créé le 31 janvier 2026*
