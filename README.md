# Listana — votre carnet multi-médias

Listana regroupe au même endroit ce que vous regardez, lisez, jouez et écoutez. Vous ajoutez une œuvre, suivez votre progression, reprenez là où vous en étiez et marquez ce qui est terminé.

**Version 2 — refonte complète de l'interface.** Démo web : [[qassim-coding.github.io/Listana](https://qassim-coding.github.io/Listana)](http://qassim-coding.github.io/Listana](https://qassim-coding.github.io/Listana))

## Pourquoi c'est utile

- **Un seul carnet** pour les animés, séries, films, livres, mangas, jeux vidéo, podcasts, livres audio et notes.

- **Reprendre en un coup d'œil** : l'accueil affiche ce qui est en cours, tous médias confondus.

- **Une progression adaptée au média** : épisodes et saisons, minutes, pages, tomes ou chapitres.

- **Mise à jour rapide** : +1 épisode en un geste, ou saisie directe de la page, du chapitre ou des minutes atteints.

## Fonctionnalités

### Accueil

- Section « Reprendre » : les éléments en cours, du plus récent au plus ancien.

- Grille de catégories avec une icône et une couleur par média.

- Accès aux paramètres.

### Paramètres

- Apparence : système, clair ou sombre.

- Taille du texte : normal, grand ou très grand.

- Réglages enregistrés sur l'appareil.

### Par média

- **Animés** : animé ou film/OAV, épisodes, +1 épisode, passage automatique en « En cours » puis « Terminé ».

- **Séries TV** : saisons et épisodes, +1 épisode avec passage automatique à la saison suivante, prochain épisode affiché.

- **Films** : durée, minutes vues, note sur 5 étoiles, avis.

- **Livres** : auteur, pages optionnelles, statut calculé à partir de la page atteinte, notes.

- **Mangas** : suivi au tome ou au chapitre/scan, mise à jour par saisie directe ou +1 / +5 / +10.

- **Jeux vidéo** : plateforme, genre, « où j'en suis », bouton commencer puis terminer.

- **Podcasts et livres audio** : filtre par type, +1 épisode ou chapitre.

- **Bloc-notes** : éditeur plein écran, nombre de mots, tri par modification ou création.

Partout : recherche, filtres par statut avec compteurs, tri, modification, duplication (selon le média) et suppression avec confirmation.

## Où sont enregistrées les données

Tout reste sur l'appareil. Aucun compte n'est requis.

`src/hooks/useStorage.ts` utilise MMKV quand le module natif est disponible (build de développement ou EAS), et AsyncStorage sinon (Expo Go, web). **Tous les médias sont désormais conservés après un redémarrage.**

Le détail des clés est dans [docs/[ARBORESCENCE.md](http://ARBORESCENCE.md)](docs/[ARBORESCENCE.md](http://ARBORESCENCE.md)). Le texte affiché dans l'app est dans [docs/[privacy.md](http://privacy.md)](docs/[privacy.md](http://privacy.md)).

## Démarrer

```bash

npm install

npx expo start

```

Autres commandes :

```bash

npm run web          # Expo web

npm run android

npm run ios

npm run lint

npx tsc --noEmit     # vérification des types

npm run export:web   # export statique dans dist/, puis fix-public-paths.cjs

npm run preview:web  # sert le dossier dist

```

## Design

- Thème clair et sombre centralisé dans `src/theme.ts`, appliqué via `src/ThemeContext.tsx`.

- Une couleur par média, déclinée pour le clair et le sombre.

- Police Poppins (400, 600, 700). Icônes `@expo/vector-icons` (Ionicons).

- Zones tactiles d'au moins 44 px.

## Pile technique

Expo SDK 54, Expo Router 6, React 19.1, React Native 0.81, TypeScript.

## Publication

- **Web** : un push sur `main` ou `master` lance `.github/workflows/deploy-web.yml`. Le script `scripts/fix-public-paths.cjs` préfixe les assets par `/Listana` et force le routing par hash, comme `app.json` `extra.router.history`).

- **Mobile** : EAS Build, identifiant `com.listana.app`. Profils development, preview et production dans `eas.json`.

## Nouveautés de la version 2

**Interface**

- Nouveau design, thème clair/sombre et taille de texte réglable.

- Accueil avec « Reprendre » et catégories colorées.

- Cartes épurées et formulaires avec étiquettes visibles.

- Écrans dédiés de mise à jour de progression (manga, livre, film).

**Corrections**

- Mangas, jeux et podcasts n'étaient pas sauvegardés : ils le sont désormais.

- Animés : les statuts enregistrés par l'ancien formulaire d'édition n'apparaissaient pas dans les filtres (converti automatiquement).

- Animés et séries : +1 épisode passe en « En cours ».

- Séries : +1 en fin de saison passe à la saison suivante ; plusieurs taps rapides sont tous comptés.

- Films : statut automatique selon les minutes vues ; date de début enregistrée ; titre obligatoire.

- Jeux, podcasts : suppression ajoutée. Notes : confirmation avant suppression.

- Web : bouton retour fonctionnel en accès direct par URL.

## Ensuite

- Intégration d'API pour remplir les fiches (couvertures, métadonnées) : AniList (animés, mangas), Open Library (livres), TMDB (films, séries), RAWG (jeux), iTunes (podcasts). Le type `Movie` prévoit déjà des champs TMDB.

- Balayer une carte pour la marquer terminée, retour haptique, compteurs sur l'accueil.

---

Made by Qassim-Coding

