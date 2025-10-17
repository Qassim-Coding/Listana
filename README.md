# Listana — votre carnet multi‑médias 📚🎮🎬🎧

Listana est une app simple et fun pour suivre tout ce que vous regardez, lisez, jouez et écoutez. En un clin d’œil, vous ajoutez un élément, notez votre progression, filtrez par statut et marquez vos œuvres comme terminées. Fini les listes éparpillées — tout est centralisé, clair et agréable à parcourir.

## Pourquoi c’est utile ?
- Un seul endroit pour vos médias: animés, séries TV, films, livres, mangas, jeux vidéo, podcasts et livres audio.
- Suivi de progression adapté: épisodes/minutes/pages/chapitres/tomes selon le média.
- Filtres rapides et tri (date, titre, statut) pour retrouver ce que vous voulez voir/lire/jouer ensuite.
- Boutons d’ajout rapides « ＋ Ajouter … » et actions utiles (marquer terminé, éditer, dupliquer quand pertinent).

## Fonctionnalités actuelles
- Animés, Séries TV, Films, Livres, Mangas, Jeux vidéo, Podcasts/Livres audio, Bloc‑notes.
- Ajout/édition via des modales conçues pour aller à l’essentiel.
- Filtres par statut (à voir/lire/écouter, en cours, terminé, abandonné) et tri par date/titre/statut.
- Calcul et affichage de progression (barres, pourcentages, pages/minutes/épisodes)..

## Bientôt (roadmap)
- Intégrations d’API pour enrichir et illustrer automatiquement vos listes: affiches, jaquettes, métadonnées, etc.
  - API cinéma
  - API jeux vidéo
  - API manga/animé
  - API podcasts

## Démarrer le projet

1) Installer les dépendances

```bash
npm install
```

2) Lancer l’app (Expo, simulateur/émulateur ou Expo Go)

```bash
npx expo start
```

Ce projet utilise le router d’Expo (routing par fichiers dans le dossier `app`). L’écran d’accueil (`app/index.tsx`) affiche une grille de médias et redirige vers les écrans dédiés.

## Structure et navigation
- `app/index.tsx` → Accueil (grille) puis navigation vers chaque média.
- `app/anime.tsx` → Animés (`src/screens/AnimesScreen.tsx`)
- `app/tv.tsx` → Séries TV (`src/screens/TVShowsScreen.tsx`)
- `app/manga.tsx` → Mangas (`src/screens/MangasScreen.tsx`)
- `app/games.tsx` → Jeux vidéo (`src/screens/GamesScreen.tsx`)
- `app/movies.tsx` → Films (écran intégré avec cartes + modales)
- `app/books.tsx` → Livres (écran intégré avec cartes + modales)
- `app/podcast.tsx` → Podcasts / Livres audio (`src/screens/PodcastsScreen.tsx`)
- `app/note.tsx` → Bloc‑notes (`src/screens/NotesScreen.tsx`)

Astuce: consultez `docs/ARBORESCENCE.md` pour une vue d’ensemble à jour des fichiers.

---

Made by Qassim-Coding 🎮
