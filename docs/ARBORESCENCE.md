# Arborescence du projet Listana

Version 2 (Expo SDK 54, React 19.1, React Native 0.81, Expo Router 6).

Les dossiers `.expo/`, `dist/`, `node_modules/` et `expo-env.d.ts` sont générés.

```

.

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

|   |-- images/                         # Icônes, favicon, splash

|-- docs/

|   |-- [ARBORESCENCE.md](http://ARBORESCENCE.md)                 # Ce fichier

|   |-- [privacy.md](http://privacy.md)                      # Texte de la politique de confidentialité

|-- scripts/

|   |-- fix-public-paths.cjs            # Préfixe /Listana et routing hash (GitHub Pages)

|-- src/

|   |-- theme.ts                        # Palettes clair/sombre, polices, tailles, en-têtes

|   |-- ThemeContext.tsx                # ThemeProvider, useTheme, useSettings

|   |-- components/

|   |   |-- MediaCard.tsx               # Tuile de catégorie (icône + couleur)

|   |   |-- MediaGrid.tsx               # Grille des catégories

|   |   |-- ResumeSection.tsx           # Section « Reprendre » de l'accueil

|   |   |-- WebBackButton.tsx           # En-tête retour sur le web

|   |   |-- ProgressUpdateModal.tsx     # Mise à jour de progression générique (films)

|   |   |-- AnimeCard.tsx

|   |   |-- AnimeFormModal.tsx          # Ajout et modification d'un animé

|   |   |-- TVShowCard.tsx

|   |   |-- TVShowFormModal.tsx         # Ajout et modification d'une série

|   |   |-- MovieCard.tsx

|   |   |-- MovieFormModal.tsx          # Ajout et modification d'un film (note /5)

|   |   |-- BookCard.tsx

|   |   |-- AddBookModal.tsx            # Ajout et modification d'un livre

|   |   |-- UpdateBookPageModal.tsx     # Mise à jour de la page atteinte

|   |   |-- MangaCard.tsx

|   |   |-- EditMangaModal.tsx          # Ajout et modification d'un manga

|   |   |-- UpdateMangaProgressModal.tsx # Mise à jour tome / chapitre

|   |   |-- GameCard.tsx

|   |   |-- GameFormModal.tsx           # Ajout et modification d'un jeu

|   |   |-- PodcastCard.tsx

|   |   |-- PodcastFormModal.tsx        # Ajout et modification (podcast ou livre audio)

|   |   |-- NoteCard.tsx

|   |   |-- NoteEditorModal.tsx         # Éditeur de note plein écran

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

|   |   |-- [game.store](http://game.store).ts               # Liste persistée (chargement via initGames)

|   |   |-- [manga.store](http://manga.store).ts              # Liste persistée (chargement via initMangas)

|   |   |-- [note.store](http://note.store).ts               # Liste persistée (chargement via initNotes)

|   |   |-- [podcast.store](http://podcast.store).ts            # Liste persistée (chargement via initPodcasts)

|   |-- types/

|   |   |-- anime.ts | book.ts | game.ts | manga.ts | movie.ts | note.ts | podcast.ts | tvshow.ts

|   |-- utils/

|       |-- mangaProgress.ts            # Libellés et calculs de progression manga

|-- app.json                            # Expo : [com.listana.app](http://com.listana.app), hash history, EAS

|-- eas.json                            # Profils development, preview, production

|-- eslint.config.js

|-- package.json

|-- [README.md](http://README.md)

|-- tsconfig.json

```

## Architecture

- **Navigation** : Expo Router, fichiers dans `app/`. L'accueil appelle `router.push` avec la clé définie dans `src/constants/media.ts`.

- **Deux formes d'écran** : `movies.tsx` et `books.tsx` contiennent l'écran complet. Les autres routes sont des ponts vers `src/screens`, avec l'en-tête natif sur mobile et `WebBackButton` sur le web.

- **Thème** : chaque composant lit le thème via `useTheme()` et construit ses styles avec `makeStyles(t)`. Les en-têtes natifs utilisent `makeHeaderOptions(t)`.

- **Taille du texte** : `t.fs(n)` applique le réglage choisi dans les paramètres.

- **Largeur** : seuil desktop à 768 px sur l'accueil et la grille.

## Persistance

`src/hooks/useStorage.ts` ouvre MMKV quand le module natif est disponible et retombe sur AsyncStorage sinon.

| Média | Où | Clé | Survit au redémarrage |

|---|---|---|---|

| Animés | useAnimes | `listana.animes.v1` | Oui |

| Livres | useBooks | `listana.books.v1` | Oui |

| Films | useMovies | `movies` (AsyncStorage) | Oui |

| Séries TV | useTVShows | `tvshows` (AsyncStorage) | Oui |

| Bloc-notes | [note.store](http://note.store) | `listana.note.v1` | Oui |

| Mangas | [manga.store](http://manga.store) | `listana.manga.v1` | Oui |

| Jeux vidéo | [game.store](http://game.store) | `listana.game.v1` | Oui |

| Podcasts | [podcast.store](http://podcast.store) | `listana.podcast.v1` | Oui |

| Paramètres | ThemeContext | `listana.settings.v1` | Oui |

Les stores (mangas, jeux, podcasts, notes) attendent toujours la fin du chargement avant d'écrire, pour ne jamais écraser une liste enregistrée.

## Déploiement

- **Web** : push sur `main` ou `master`, ou lancement manuel, via `.github/workflows/deploy-web.yml`. URL : [https://qassim-coding.github.io/Listana](https://qassim-coding.github.io/Listana)

- **Android / iOS** : EAS Build, identifiant `com.listana.app`.

