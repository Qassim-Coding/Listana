# Arborescence du projet Listana

**Listana V2.0** (`app.json` / `package.json` : `2.0.0`). Expo SDK 54, React 19.1, React Native 0.81, Expo Router 6.

Les dossiers `.expo/`, `dist/`, `node_modules/` et le fichier `expo-env.d.ts` sont générés. `.env.local` est présent en local et ignoré par Git.

```
.
|-- .env.local                          # EXPO_PUBLIC_TMDB_TOKEN, EXPO_PUBLIC_RAWG_KEY, EXPO_PUBLIC_MAL_CLIENT_ID
|-- .github/
|   |-- workflows/
|       |-- deploy-web.yml              # Build web puis déploiement GitHub Pages
|-- .vscode/
|-- app/                                # Routes Expo Router
|   |-- +not-found.tsx                  # 404 : redirection vers l'accueil
|   |-- _layout.tsx                     # Stack racine, Poppins, ThemeProvider
|   |-- index.tsx                       # Accueil : Reprendre, catégories, Confidentialité, Listana V2.0
|   |-- settings.tsx                    # Apparence, taille du texte, À propos (sources)
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
|       |-- icon.png                    # Icône app (fond #0E1733 opaque)
|       |-- favicon.png                 # Favicon web
|       |-- splash-icon.png             # Écran de lancement (fond transparent)
|       |-- android-icon-foreground.png # Icône adaptative Android (zone sûre)
|-- docs/
|   |-- ARBORESCENCE.md                 # Ce fichier
|   |-- privacy.md                      # Texte de la politique de confidentialité
|-- scripts/
|   |-- fix-public-paths.cjs            # Préfixe /Listana et routing hash (GitHub Pages)
|-- src/
|   |-- theme.ts                        # Palettes clair/sombre, polices, tailles, en-têtes
|   |-- ThemeContext.tsx                # ThemeProvider, useTheme, useSettings
|   |-- api/
|   |   |-- tmdb.ts                     # Films, séries, animés (TMDB)
|   |   |-- openLibrary.ts              # Livres et couvertures (sans clé)
|   |   |-- rawg.ts                     # Jeux vidéo (RAWG)
|   |   |-- mal.ts                      # Mangas (API officielle MyAnimeList)
|   |   |-- itunes.ts                   # Podcasts et livres audio (Apple, sans clé)
|   |-- components/
|   |   |-- BottomSheet.tsx             # Fenêtre du bas commune (fond plein écran, clavier, barre Android)
|   |   |-- SheetActions.tsx            # Boutons Dupliquer / Supprimer (48 px, surbrillance)
|   |   |-- MediaCard.tsx
|   |   |-- MediaGrid.tsx
|   |   |-- ResumeSection.tsx           # Section « Reprendre » de l'accueil
|   |   |-- WebBackButton.tsx
|   |   |-- DateField.tsx
|   |   |-- MediaSearchField.tsx        # Champ de recherche (450 ms, 8 résultats)
|   |   |-- ProgressUpdateModal.tsx     # Progression films
|   |   |-- AnimeCard.tsx
|   |   |-- AnimeFormModal.tsx          # Recherche TMDB
|   |   |-- TVShowCard.tsx
|   |   |-- TVShowFormModal.tsx         # Recherche TMDB
|   |   |-- MovieCard.tsx
|   |   |-- MovieFormModal.tsx          # Recherche TMDB, note /5
|   |   |-- BookCard.tsx                # Crayon de page aussi sur un livre terminé
|   |   |-- AddBookModal.tsx            # Recherche Open Library
|   |   |-- UpdateBookPageModal.tsx     # Page, « Terminé », « Abandonné »
|   |   |-- MangaCard.tsx
|   |   |-- EditMangaModal.tsx          # Recherche MyAnimeList
|   |   |-- UpdateMangaProgressModal.tsx
|   |   |-- GameCard.tsx
|   |   |-- GameFormModal.tsx           # Recherche RAWG
|   |   |-- PodcastCard.tsx             # Lien « Écouter sur Apple… » si pochette Apple
|   |   |-- PodcastFormModal.tsx        # Recherche iTunes (podcast ou livre audio)
|   |   |-- NoteCard.tsx
|   |   |-- NoteEditorModal.tsx
|   |   |-- NewNoteSheet.tsx
|   |-- constants/
|   |   |-- media.ts                    # Clés et libellés des catégories
|   |   |-- version.ts                  # APP_VERSION / APP_VERSION_LABEL depuis app.json
|   |   |-- statusColors.ts             # 4 familles d'états (en cours, prévu, terminé, abandonné)
|   |-- hooks/
|   |   |-- useStorage.ts               # MMKV si disponible, sinon AsyncStorage
|   |   |-- useResumeItems.ts           # Accueil : lit resumeLibrary + rafraîchit le widget
|   |   |-- useAnimes.ts
|   |   |-- useBooks.ts                 # Statut dérivé de la page ; markAbandoned
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
|   |   |-- game.store.ts
|   |   |-- manga.store.ts
|   |   |-- note.store.ts
|   |   |-- podcast.store.ts
|   |-- types/
|   |   |-- anime.ts | book.ts | game.ts | manga.ts | movie.ts | podcast.ts | tvshow.ts
|   |   |-- note.ts
|   |-- utils/
|   |   |-- mangaProgress.ts
|   |   |-- libraryWorks.ts
|   |   |-- resumeLibrary.ts            # Lecture bibliothèque (accueil + widget, sans hook)
|   |-- widgets/
|       |-- ResumeWidget.tsx            # Dessin « Reprendre » (FlexWidget / TextWidget)
|       |-- renderResume.tsx            # Charge la bibliothèque, versions clair / sombre
|       |-- widgetTaskHandler.tsx       # Ajout, redimensionnement, MAJ toutes les 30 min
|       |-- register.ts                 # Web / iOS : no-op
|       |-- register.android.ts         # Branche le handler
|       |-- refresh.ts                  # Web / iOS : no-op
|       |-- refresh.android.ts          # requestWidgetUpdate
|-- app.json                            # version 2.0.0, plugin widget Resume, hash history, EAS
|-- eas.json
|-- eslint.config.js
|-- index.ts                            # Point d'entrée : expo-router + register widgets
|-- package.json                        # version 2.0.0, main = index.ts
|-- README.md
|-- tsconfig.json
```

## Architecture

- **Navigation** : Expo Router, fichiers dans `app/`. L'accueil appelle `router.push` avec la clé de `src/constants/media.ts`.
- **Deux formes d'écran** : `movies.tsx` et `books.tsx` sont complets. Les autres routes sont des ponts vers `src/screens` (en-tête natif sur mobile, `WebBackButton` sur le web).
- **Thème** : `useTheme()` + `makeStyles(t)`. En-têtes : `makeHeaderOptions(t)`. Taille du texte : `t.fs(n)`.
- **Version** : une seule source, `expo.version` dans `app.json` (`2.0.0`). `src/constants/version.ts` affiche **Listana V2.0** en bas de l'accueil.
- **Fenêtres** : tous les formulaires d'ajout, de modification et de progression passent par `BottomSheet` (fond sombre plein écran, remonte avec le clavier, marge au-dessus de la barre de navigation Android). Les boutons Dupliquer / Supprimer sont dans `SheetActions` (48 px, icône, surbrillance).
- **États** : `statusColors.ts` range tous les statuts média dans 4 familles (en cours = bleu, prévu = orange, terminé = vert, abandonné = rouge). Les cartes et les puces de filtre utilisent ces couleurs.
- **Listes** : barre « Filtrer ma liste » sur chaque écran média (notes : « Chercher dans mes notes »).
- **Notes** : `free`, `list`, `work`. Une note `work` se lie à une œuvre via `libraryWorks.ts` et peut porter des `NoteMark`.
- **Livres** : le statut (`planning` / `in_progress` / `done`) est recalculé à partir de la page, sauf `abandoned` (choisi à la main). Le crayon de mise à jour reste visible après « Terminé » ou « Abandonné » : enregistrer une page remet le livre « En cours ».
- **Widget Android** : `Listana · Reprendre` (`react-native-android-widget`, plugin dans `app.json`). Affiche jusqu'à 4 œuvres en cours (selon la hauteur). Un appui sur l'en-tête ouvre l'accueil (`OPEN_APP`) ; un appui sur une ligne ouvre l'écran du média (`listana://…`). Thème clair / sombre selon le téléphone. Mise à jour à l'ajout, au redimensionnement, toutes les 30 min, au retour sur l'accueil, et quand l'app passe en arrière-plan. Android seulement (fichiers `*.android.ts`) : no-op sur web / iOS. Visible uniquement sur un **build natif** (EAS / `npx expo run:android`), pas Expo Go.

## Intégrations API

Jetons optionnels dans `.env.local` (ignoré par Git). Sans jeton, le champ de recherche est masqué ou la saisie manuelle reste possible. `MediaSearchField` attend 450 ms après la dernière frappe, jusqu'à 8 résultats.

| Source | Fichier | Médias | Clé | Notes |
|---|---|---|---|---|
| TMDB | `tmdb.ts` | Films, séries, animés | `EXPO_PUBLIC_TMDB_TOKEN` | `source: "tmdb"`, `tmdbId`. Mention obligatoire dans l'À propos. |
| Open Library | `openLibrary.ts` | Livres | Aucune | `source: "openlibrary"`, `olKey`. |
| RAWG | `rawg.ts` | Jeux | `EXPO_PUBLIC_RAWG_KEY` | Titre, jaquette, mapping plateforme / genre. |
| MyAnimeList | `mal.ts` | Mangas | `EXPO_PUBLIC_MAL_CLIENT_ID` | API officielle, timeout 8 s, cache. `source: "mal"` (anciens `jikan` compatibles via le même `malId`). CORS souvent bloqué sur le web : tester sur téléphone. Citer MAL, pas de logo MAL. Dons ponctuels OK ; abo / app payante / pub = accord écrit. |
| Apple iTunes | `itunes.ts` | Podcasts, livres audio | Aucune | Pays `CH`. `source: "apple"`. Lien **Écouter sur Apple Podcasts / Books** obligatoire à côté de chaque pochette. |

AniList n'est **pas** utilisé : leurs conditions interdisent une app de suivi concurrente.

Le workflow `deploy-web.yml` ne transmet **aucun jeton, et c'est voulu** : la démo GitHub Pages est publique et les variables `EXPO_PUBLIC_*` y seraient lisibles par tous. Sur la démo, seules les recherches Open Library et Apple fonctionnent.

## Persistance

`src/hooks/useStorage.ts` : MMKV si le module natif est là, sinon AsyncStorage.

| Média | Où | Clé |
|---|---|---|
| Animés | `useAnimes` | `listana.animes.v1` |
| Livres | `useBooks` | `listana.books.v1` |
| Films | `useMovies` | `movies` (AsyncStorage) |
| Séries TV | `useTVShows` | `tvshows` (AsyncStorage) |
| Bloc-notes | `note.store` | `listana.note.v1` |
| Mangas | `manga.store` | `listana.manga.v1` |
| Jeux vidéo | `game.store` | `listana.game.v1` |
| Podcasts | `podcast.store` | `listana.podcast.v1` |
| Paramètres | `ThemeContext` | `listana.settings.v1` |

Les stores attendent la fin du chargement avant d'écrire. `resumeLibrary.ts` relit ces clés pour l'accueil et le widget. `libraryWorks.ts` aussi, pour les notes liées à une œuvre.

## Icônes

| Rôle | Fichier | Remarque |
|---|---|---|
| `icon` | `icon.png` | Opaque, fond `#0E1733` |
| `web.favicon` | `favicon.png` | |
| `android.adaptiveIcon.foregroundImage` | `android-icon-foreground.png` | Transparent, `backgroundColor` `#0E1733` |
| `expo-splash-screen` | `splash-icon.png` | Transparent ; fond `#F4F5F8` (clair) / `#0B0C10` (sombre) |

## Déploiement

- **Web** : chaque push sur `main` / `master` republie la démo via `.github/workflows/deploy-web.yml`, sans aucune clé. [qassim-coding.github.io/Listana](https://qassim-coding.github.io/Listana)
- **Android / iOS** : EAS Build, `com.listana.app`. Un changement JS n'apparaît sur un APK qu'après un **nouveau build**.
