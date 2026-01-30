# SiteAuditor - Outil d'Audit SEO Complet

🚀 Application d'audit SEO, sécurité et performance avec comparateur de sites concurrents.

## 📋 Fonctionnalités

- ✅ **Analyse SEO** : Performance, meta tags, sitemap, robots.txt
- 🔒 **Sécurité** : Headers HTTP, HTTPS, vulnérabilités
- 🛠️ **Stack Technique** : Détection automatique des technologies
- 🔗 **Liens Cassés** : Scanner de liens internes et externes
- 🍪 **RGPD** : Vérification de conformité cookies et politique
- 📧 **DNS & Email** : Validation SPF, DMARC pour délivrabilité
- 🌿 **Eco-Index** : Impact environnemental et empreinte carbone
- 📱 **Social Media** : Prévisualisation Open Graph (LinkedIn, Twitter, Facebook)
- ⚔️ **Mode Versus** : Comparaison compétitive en parallèle

## 🏗️ Architecture

```
Check_securite/
├── backend/          # API FastAPI (Python)
│   ├── app/
│   │   ├── api/      # Endpoints
│   │   ├── services/ # Analyseurs (SEO, Security, etc.)
│   │   └── models/   # Schémas Pydantic
│   └── requirements.txt
│
└── frontend/         # Interface Next.js (TypeScript)
    ├── src/
    │   ├── app/      # Pages Next.js
    │   ├── components/
    │   └── lib/      # API client
    └── package.json
```

## 🚀 Installation

### Backend (Python)

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# ou source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

**Configuration** : Créer `.env` avec votre clé API Google PageSpeed :
```
GOOGLE_API_KEY=votre_cle_api_ici
```

**Lancer** :
```bash
python run.py
```
→ Backend disponible sur `http://localhost:8000`

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```
→ Frontend disponible sur `http://localhost:3000`

## 📦 Technologies

**Backend** :
- FastAPI
- httpx (requêtes async)
- BeautifulSoup4 (parsing HTML)
- dnspython (vérification DNS)
- Pydantic (validation)

**Frontend** :
- Next.js 16
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons

## 🎯 API Endpoints

- `POST /api/analyze` : Analyse complète (+ mode Versus avec `competitor_url`)
- `GET /api/health` : Status de l'API

## 🧪 Mode Versus

Comparez votre site avec un concurrent en un seul scan :
1. Activez "Mode Versus" dans la barre de recherche
2. Entrez l'URL concurrente
3. Les deux analyses s'exécutent **en parallèle** (pas de temps double)
4. Tableau comparatif visuel avec différentiels instantanés

## 📝 Licence

Projet privé - Tous droits réservés

## 👨‍💻 Auteur

Développé avec ❤️ pour un audit SEO professionnel
