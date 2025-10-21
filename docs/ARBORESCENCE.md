# Arborescence du projet Listana (mise à jour)

```
.
|-- .expo/
|-- .github/
|   |-- workflows/
|       |-- deploy-web.yml
|-- .vscode/
|-- app/
|   |-- +not-found.tsx
|   |-- _layout.tsx
|   |-- anime.tsx
|   |-- books.tsx
|   |-- games.tsx
|   |-- index.tsx
|   |-- manga.tsx
|   |-- movies.tsx
|   |-- note.tsx
|   |-- podcast.tsx
|   |-- privacy.tsx
|   |-- tv.tsx
|-- app-example/
|-- assets/
|   |-- images/
|       |-- android-icon-background.png
|       |-- android-icon-foreground.png
|       |-- android-icon-monochrome.png
|       |-- favicon.png
|       |-- icon.png
|       |-- Listana_Favicon_V1.png
|       |-- partial-react-logo.png
|       |-- react-logo.png
|       |-- react-logo@2x.png
|       |-- react-logo@3x.png
|       |-- splash-icon.png
|-- dist/
|-- docs/
|   |-- ARBORESCENCE.md
|   |-- privacy.md
|-- scripts/
|   |-- fix-public-paths.cjs
|-- src/
|   |-- components/
|   |   |-- AddAnimeModal.tsx
|   |   |-- AddBookModal.tsx
|   |   |-- AddMovieModal.tsx
|   |   |-- AddTVShowModal.tsx
|   |   |-- AnimeCard.tsx
|   |   |-- BookCard.tsx
|   |   |-- EditAnimeModal.tsx
|   |   |-- EditGameModal.tsx
|   |   |-- EditMangaModal.tsx
|   |   |-- EditMovieModal.tsx
|   |   |-- EditNoteModal.tsx
|   |   |-- EditPodcastModal.tsx
|   |   |-- EditTVShowModal.tsx
|   |   |-- GameCard.tsx
|   |   |-- MangaCard.tsx
|   |   |-- MediaCard.tsx
|   |   |-- MediaGrid.tsx
|   |   |-- MovieCard.tsx
|   |   |-- NoteCard.tsx
|   |   |-- PodcastCard.tsx
|   |   |-- TVShowCard.tsx
|   |   |-- WebBackButton.tsx
|   |-- constants/
|   |   |-- media.ts
|   |-- hooks/
|   |   |-- useAnimes.ts
|   |   |-- useBooks.ts
|   |   |-- useMovies.ts
|   |   |-- useStorage.ts
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
|       |-- anime.ts
|       |-- book.ts
|       |-- game.ts
|       |-- manga.ts
|       |-- movie.ts
|       |-- note.ts
|       |-- podcast.ts
|       |-- tvshow.ts
|-- app.json
|-- eslint.config.js
|-- expo-env.d.ts
|-- package-lock.json
|-- package.json
|-- README.md
|-- tsconfig.json
```

## Points notables
- Les écrans `app/*.tsx` partagent un header uniforme : titre noir (`#111827`) couplé à une flèche de retour bleue (`#12AAB8`).
- `MediaGrid` et `MediaCard` gèrent désormais le survol web, tandis que `WebBackButton` sert de bouton retour dédié sur navigateur.
- Le workflow GitHub Actions `deploy-web.yml` automatise l’export Expo vers GitHub Pages et applique le script `scripts/fix-public-paths.cjs`.
- La politique de confidentialité est disponible dans l’app (`app/privacy.tsx`) et en documentation (`docs/privacy.md`).

## Navigation (rappel)
- `app/index.tsx` : accueil et grille `MediaGrid`, navigation via `router.push`.
- `app/anime.tsx`, `app/tv.tsx`, `app/manga.tsx`, `app/games.tsx`, `app/podcast.tsx`, `app/note.tsx` : ponts vers les écrans dédiés de `src/screens`.
- `app/movies.tsx` et `app/books.tsx` : écrans complets avec filtres, cartes et modales intégrées.
- `app/privacy.tsx` : écran Politique de confidentialité accessible depuis la page d’accueil.
