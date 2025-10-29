
POWER_4
Jeu de Puissance 4 développé en Go avec interface web


---

## 🎯 Description

**Power4** est une implémentation complète du célèbre jeu **Puissance 4**, développée en **Go (backend)** avec une interface **HTML/CSS/JavaScript**.  
Le jeu gère la logique serveur (placement de jetons, tour par tour, détection de victoire), l’animation visuelle, l’enregistrement **de l’historique des parties** et un **classement de joueurs** (scoreboard).

Ce projet a été réalisé dans le cadre **d’un apprentissage structuré du langage Go et du développement web structuré côté serveur**.

---

## ✅ Fonctionnalités

| Fonctionnalité | Status |
|----------------|--------|
| Plateau Puissance 4 jouable | ✅ |
| Tour par tour (2 joueurs) | ✅ |
| Choix des pseudos & jetons personnalisés | ✅ |
| Animation de chute des jetons | ✅ |
| Détection automatique de victoire | ✅ |
| Gestion match nul | ✅ |
| Historique des parties (`/histo`) | ✅ |
| Classement des joueurs (`/players`) | ✅ |
| Interface responsive | ✅ |

---

## 🛠️ Technologies utilisées

| Technologie | Usage |
|-------------|-------|
| **Go (Golang)** | Serveur + logique du jeu |
| **HTML5** | Structure des pages |
| **CSS3** | Design + animations |
| **JavaScript (ES6)** | Dynamique du front |
| **JSON** | Sauvegarde historique et scores |
| **Net/HTTP natif** | Routes backend (pas de framework externe) |

---

## 📦 Installation

### Prérequis
- Go 1.20 ou supérieur
- Git (optionnel)
- Navigateur moderne (Chrome, Firefox…)

### Installation & lancement
```bash
git clone <URL_DU_PROJET>
cd power4
go mod tidy
go run .
