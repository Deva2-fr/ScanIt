# 🏆 Battle Mode V2 - Architecture Finale

## 🚀 Vue d'ensemble
Le Battle Mode permet de comparer deux sites web en temps réel avec une visualisation graphique avancée et une expérience gamifiée.

## 🛠 Composants Clés

### 1. `ComparisonView.tsx` (Split Screen)
- **Architecture**: Grid 2 colonnes (Target vs Competitor)
- **Gamification**: 
  - 🎉 Confettis automatiques en cas de victoire (`canvas-confetti`)
  - 🏆 Badge Winner animé
  - 🟢🔴 Color-coding dynamique (Vert=Gagnant, Rouge=Perdant, Orange=Concurrent)
- **Features**:
  - Suppression de la table détaillée (trop chargée)
  - Intégration du composant `BattleRadar`

### 2. `BattleRadar.tsx` (Visualisation)
- **Librairie**: `recharts`
- **Type**: Radar Chart (Graphique en toile d'araignée)
- **Métriques**: Performance, SEO, Sécurité, Accessibilité, Best Practices, Green IT
- **Design**: 
  - Vert (#4ade80) pour le site principal
  - Orange (#fb923c) pour le concurrent
  - Grille sombre pour le contraste

### 3. `useAnalyzeStream.ts` (Backend Communication)
- **Gestion Hybride**:
  - **Mode Single**: Utilise Streaming (GET /api/stream)
  - **Mode Versus**: Utilise POST /api/analyze
- **Simulation**: Ajout de logs simulés ("Analyzing competitor...") pour patienter pendant le scan parallèle

## 🔄 Flux de Données

1. **User Input**: Saisie de 2 URLs dans `SearchBar`
2. **Hook**: `useAnalyzeStream` détecte `competitorUrl`
3. **API**: Appel POST vers `/api/analyze`
4. **Backend**:
   - Scan parallèle avec `asyncio.gather()`
   - Calcul du winner (`target`, `competitor`, ou `draw`)
   - Retourne JSON unifié
5. **Frontend**:
   - Réception des données
   - Simulation des logs terminée
   - Affichage `ComparisonView`
   - Déclenchement `useEffect` -> Confetti si victoire

## 🎨 Design System

| Élément | Couleur | Classe Tailwind |
|---------|---------|-----------------|
| **Victoire** | Vert Neon | `text-green-400`, `bg-green-500/10` |
| **Défaite** | Rouge | `text-red-400` |
| **Concurrent** | Orange | `text-orange-400`, `border-orange-500/50` |
| **Radar Grid** | Gris Zinc | `stroke-zinc-700` |
| **Crad Glow** | Variable | `shadow-[color]-500/20` |

## ✅ État Actuel
- [x] Backend Parallèle
- [x] Calcul Winner Auto
- [x] Interface Split Screen
- [x] Graphique Radar
- [x] Animation Confetti
- [x] Animation Logs Terminal en Mode Versus

---
*Dernière mise à jour: 2026-02-04*
