# Arborescence du projet Listana

Version 2 (Expo SDK 54, React 19.1, React Native 0.81, Expo Router 6).

Les dossiers `.expo/`, `dist/`, `node_modules/` et le fichier `expo-env.d.ts` sont générés. `.env.local` est présent en local et ignoré par Git.

```
.
|-- .env.local                          # EXPO_PUBLIC_TMDB_TOKEN, EXPO_PUBLIC_RAWG_KEY (non versionné)
|-- .github/
|   |-- workflows/
|       |-- deploy-web.yml              # Build web puis déploiement GitHub Pages
|-- .vscode/
|-- app/                                # Routes Expo Router
|   |-- +not-found.tsx                  # 404 : redirection vers l'accueil
|   |-- _layout.tsx                     # Stack racine, Poppins, ThemeProvider
|   |-- index.tsx                       # Accueil : Reprendre, catégories, paramètres
|   |-- settings.tsx                    # Paramètres : thème et taille du texte
|   |-- anime.tsx                       # Pont vers AnimesScreen
|   |-- books.tsx                       # Écran Livres complet
|   |-- games.tsx                       # Pont vers GamesScreen
|   |-- manga.tsx                       # Pont vers MangasScreen
|   |-- movies.tsx                      # Écran Films complet
|   |-- note.tsx                        # Pont vers NotesScreen
|   |-- podcast.tsx                     # Pont vers PodcastsScreen
|   |-- privacy.tsx                     # Politique de confidentialité
|   |-- tv.tsx                          # Pont vers TVShowsScreen
|-- assets/
|   |-- images/
|       |-- icon.png                    # Icône app (1024 px, fond #0E1733 opaque)
|       |-- favicon.png                 # Favicon web (256 px)
|       |-- splash-icon.png             # Écran de lancement (fond transparent)
|       |-- android-icon-foreground.png # Icône adaptative Android (transparent, zone sûre)
|       |-- android-icon-background.png # Modèle Expo, non référencé
|       |-- android-icon-monochrome.png # Modèle Expo, non référencé
|-- docs/
|   |-- ARBORESCENCE.md                 # Ce fichier
|   |-- privacy.md                      # Texte de la politique de confidentialité
|-- scripts/
|   |-- fix-public-paths.cjs            # Préfixe /Listana et routing hash (GitHub Pages)
|-- src/
|   |-- theme.ts                        # Palettes clair/sombre, polices, tailles, en-têtes
|   |-- ThemeContext.tsx                # ThemeProvider, useTheme, useSettings
|   |-- api/
|   |   |-- tmdb.ts                     # Recherche et détails films / séries / animés (TMDB)
|   |   |-- openLibrary.ts              # Recherche de livres et couvertures (sans clé)
|   |-- components/
|   |   |-- MediaCard.tsx               # Tuile de catégorie (icône + couleur)
|   |   |-- MediaGrid.tsx               # Grille des catégories
|   |   |-- ResumeSection.tsx           # Section « Reprendre » de l'accueil
|   |   |-- WebBackButton.tsx           # En-tête retour sur le web
|   |   |-- DateField.tsx               # Sélecteur de date (calendrier, format AAAA-MM-JJ)
|   |   |-- MediaSearchField.tsx        # Champ de recherche (TMDB, Open Library, RAWG)
|   |   |-- ProgressUpdateModal.tsx     # Mise à jour de progression générique (films)
|   |   |-- AnimeCard.tsx
|   |   |-- AnimeFormModal.tsx          # Ajout et modification d'un animé (recherche TMDB)
|   |   |-- TVShowCard.tsx
|   |   |-- TVShowFormModal.tsx         # Ajout et modification d'une série (recherche TMDB)
|   |   |-- MovieCard.tsx
|   |   |-- MovieFormModal.tsx          # Ajout et modification d'un film (TMDB, note /5)
|   |   |-- BookCard.tsx
|   |   |-- AddBookModal.tsx            # Ajout et modification d'un livre (recherche Open Library)
|   |   |-- UpdateBookPageModal.tsx     # Mise à jour de la page atteinte
|   |   |-- MangaCard.tsx
|   |   |-- EditMangaModal.tsx          # Ajout et modification d'un manga
|   |   |-- UpdateMangaProgressModal.tsx # Mise à jour tome / chapitre
|   |   |-- GameCard.tsx
|   |   |-- GameFormModal.tsx           # Ajout et modification d'un jeu (recherche RAWG)
|   |   |-- PodcastCard.tsx
|   |   |-- PodcastFormModal.tsx        # Ajout et modification (podcast ou livre audio)
|   |   |-- NoteCard.tsx
|   |   |-- NoteEditorModal.tsx         # Éditeur de note plein écran (libre, liste, œuvre)
|   |   |-- NewNoteSheet.tsx            # Choix du type de note ou de l'œuvre à lier
|   |-- constants/
|   |   |-- media.ts                    # Clés et libellés des catégories
|   |-- hooks/
|   |   |-- useStorage.ts               # MMKV si disponible, sinon AsyncStorage
|   |   |-- useResumeItems.ts           # Agrège les éléments en cours pour l'accueil
|   |   |-- useAnimes.ts
|   |   |-- useBooks.ts                 # Statut dérivé de la page atteinte
|   |   |-- useMovies.ts
|   |   |-- useTVShows.ts
|   |-- screens/
|   |   |-- AnimesScreen.tsx
|   |   |-- GamesScreen.tsx
|   |   |-- MangasScreen.tsx
|   |   |-- NotesScreen.tsx
|   |   |-- PodcastsScreen.tsx
|   |   |-- TVShowsScreen.tsx
|   |-- storage/
|   |   |-- game.store.ts               # Liste persistée (chargement via initGames)
|   |   |-- manga.store.ts              # Liste persistée (chargement via initMangas)
|   |   |-- note.store.ts               # Liste persistée (chargement via initNotes)
|   |   |-- podcast.store.ts            # Liste persistée (chargement via initPodcasts)
|   |-- types/
|   |   |-- anime.ts | book.ts | game.ts | manga.ts | movie.ts | podcast.ts | tvshow.ts
|   |   |-- note.ts                     # Note, NoteKind, ChecklistItem, NoteWork, NoteMark
|   |-- utils/
|       |-- mangaProgress.ts            # Libellés et calculs de progression manga
|       |-- libraryWorks.ts             # Liste des œuvres de tous les médias (notes liées)
|-- app.json                            # Expo : com.listana.app, icônes, hash history, EAS
|-- eas.json                            # Profils development, preview, production
|-- eslint.config.js
|-- package.json
|-- README.md
|-- tsconfig.json
```

## Architecture

- **Navigation** : Expo Router, fichiers dans `app/`. L'accueil appelle `router.push` avec la clé définie dans `src/constants/media.ts`.
- **Deux formes d'écran** : `movies.tsx` et `books.tsx` contiennent l'écran complet. Les autres routes sont des ponts vers `src/screens`, avec l'en-tête natif sur mobile et `WebBackButton` sur le web.
- **Thème** : chaque composant lit le thème via `useTheme()` et construit ses styles avec `makeStyles(t)`. Les en-têtes natifs utilisent `makeHeaderOptions(t)`.
- **Taille du texte** : `t.fs(n)` applique le réglage choisi dans les paramètres.
- **Largeur** : seuil desktop à 768 px sur l'accueil et la grille.
- **Notes** : trois types (`free`, `list`, `work`). Une note `work` est liée à une œuvre de n'importe quel média via `libraryWorks.ts`, et peut porter des repères (`NoteMark` : « p. 134 », « Ép. 14 »…).

## Intégrations API

Les jetons optionnels sont lus dans `.env.local` (ignoré par Git). Sans jeton, le champ de recherche correspondant n'est pas affiché : les formulaires restent utilisables en saisie manuelle. `MediaSearchField` lance la recherche 450 ms après la dernière frappe, jusqu'à 8 résultats.

**TMDB** (`src/api/tmdb.ts`, jeton `EXPO_PUBLIC_TMDB_TOKEN`) — films, séries et animés, langue `fr-FR`. Les formulaires appellent `getMovieDetails` / `getTVDetails` pour remplir titre, année, durée, saisons et affiche. Les éléments créés portent `source: "tmdb"` et `tmdbId`.

**Open Library** (`src/api/openLibrary.ts`) — livres, sans clé. Le formulaire remplit titre, auteur, année, nombre de pages et couverture. Les éléments créés portent `source: "openlibrary"` et `olKey`.

**RAWG** — jeux vidéo, clé `EXPO_PUBLIC_RAWG_KEY`. Recherche de titres et jaquettes. Mentionnée dans Paramètres → À propos.

Le workflow `deploy-web.yml` ne transmet ni `EXPO_PUBLIC_TMDB_TOKEN` ni `EXPO_PUBLIC_RAWG_KEY` : la démo GitHub Pages n'a pas ces recherches tant que ces secrets n'y sont pas ajoutés.

## Persistance

`src/hooks/useStorage.ts` ouvre MMKV quand le module natif est disponible et retombe sur AsyncStorage sinon.

| Média | Où | Clé | Survit au redémarrage |
|---|---|---|---|
| Animés | `useAnimes` | `listana.animes.v1` | Oui |
| Livres | `useBooks` | `listana.books.v1` | Oui |
| Films | `useMovies` | `movies` (AsyncStorage) | Oui |
| Séries TV | `useTVShows` | `tvshows` (AsyncStorage) | Oui |
| Bloc-notes | `note.store` | `listana.note.v1` | Oui |
| Mangas | `manga.store` | `listana.manga.v1` | Oui |
| Jeux vidéo | `game.store` | `listana.game.v1` | Oui |
| Podcasts | `podcast.store` | `listana.podcast.v1` | Oui |
| Paramètres | `ThemeContext` | `listana.settings.v1` | Oui |

Les stores (mangas, jeux, podcasts, notes) attendent la fin du chargement avant d'écrire, pour ne jamais écraser une liste enregistrée. `useResumeItems` et `libraryWorks.ts` relisent directement ces clés pour agréger tous les médias.

## Icônes

`app.json` déclare quatre images, toutes dans `assets/images/` :

| Rôle | Fichier | Remarque |
|---|---|---|
| `icon` | `icon.png` | Opaque, fond `#0E1733` (iOS refuse la transparence) |
| `web.favicon` | `favicon.png` | 256 px |
| `android.adaptiveIcon.foregroundImage` | `android-icon-foreground.png` | Transparent, contenu réduit à la zone sûre ; `backgroundColor` `#0E1733` |
| `expo-splash-screen` | `splash-icon.png` | Transparent, fond blanc en clair et noir en sombre |

## Déploiement

- **Web** : push sur `main` ou `master`, ou lancement manuel, via `.github/workflows/deploy-web.yml`. URL : [https://qassim-coding.github.io/Listana](https://qassim-coding.github.io/Listana)
- **Android / iOS** : EAS Build, identifiant `com.listana.app`.
