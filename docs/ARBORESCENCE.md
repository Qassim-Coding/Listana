# Arborescence du projet Listana (à jour)

```
.
├─ app/
│  ├─ _layout.tsx
│  ├─ index.tsx
│  ├─ anime.tsx
│  ├─ books.tsx
│  ├─ games.tsx
│  ├─ manga.tsx
│  ├─ movies.tsx
│  ├─ note.tsx
│  ├─ podcast.tsx
│  └─ tv.tsx
│
├─ src/
│  ├─ components/
│  │  ├─ AddAnimeModal.tsx
│  │  ├─ AddBookModal.tsx
│  │  ├─ AddMovieModal.tsx
│  │  ├─ AddTVShowModal.tsx
│  │  ├─ AnimeCard.tsx
│  │  ├─ BookCard.tsx
│  │  ├─ EditAnimeModal.tsx
│  │  ├─ EditGameModal.tsx
│  │  ├─ EditMangaModal.tsx
│  │  ├─ EditMovieModal.tsx
│  │  ├─ EditNoteModal.tsx
│  │  ├─ EditPodcastModal.tsx
│  │  ├─ EditTVShowModal.tsx
│  │  ├─ GameCard.tsx
│  │  ├─ MangaCard.tsx
│  │  ├─ MediaCard.tsx
│  │  ├─ MediaGrid.tsx
│  │  ├─ MovieCard.tsx
│  │  ├─ NoteCard.tsx
│  │  ├─ PodcastCard.tsx
│  │  └─ TVShowCard.tsx
│  │
│  ├─ screens/
│  │  ├─ AnimesScreen.tsx
│  │  ├─ GamesScreen.tsx
│  │  ├─ MangasScreen.tsx
│  │  ├─ NotesScreen.tsx
│  │  ├─ PodcastsScreen.tsx
│  │  └─ TVShowsScreen.tsx
│  │
│  ├─ hooks/
│  │  ├─ useAnimes.ts
│  │  ├─ useBooks.ts
│  │  ├─ useMovies.ts
│  │  ├─ useStorage.ts
│  │  └─ useTVShows.ts
│  │
│  ├─ constants/
│  │  └─ media.ts
│  │
│  ├─ types/
│  │  ├─ anime.ts
│  │  ├─ book.ts
│  │  ├─ game.ts
│  │  ├─ manga.ts
│  │  ├─ movie.ts
│  │  ├─ note.ts
│  │  ├─ podcast.ts
│  │  └─ tvshow.ts
│  │
│  ├─ storage/
│  │  ├─ game.store.ts
│  │  ├─ manga.store.ts
│  │  ├─ note.store.ts
│  │  └─ podcast.store.ts
│  │
│  
│
├─ assets/
│  └─ images/
│     ├─ android-icon-background.png
│     ├─ android-icon-foreground.png
│     ├─ android-icon-monochrome.png
│     ├─ favicon.png
│     ├─ icon.png
│     ├─ Listana_Favicon_V1.png
│     ├─ partial-react-logo.png
│     ├─ react-logo.png
│     ├─ react-logo@2x.png
│     ├─ react-logo@3x.png
│     └─ splash-icon.png
│
├─ app.json
├─ package.json
├─ tsconfig.json
├─ eslint.config.js
├─ expo-env.d.ts
└─ README.md
```

## Points notables / Mises à jour récentes
- Accueil: la tuile affiche « Podcast / Livre audio » (src/constants/media.ts).
- Podcasts: ajout d’un type `kind` (podcast | audiobook) + filtre de type dans la vue et sélecteur dans la modale d’édition.
- Boutons d’ajout: style harmonisé « ＋ Ajouter … » (fond bleu, texte blanc) sur Animés, Séries TV, Livres et Films.
- Jeux vidéo: écran basé sur `src/screens/GamesScreen.tsx` avec `GameCard` et `EditGameModal`.
- Films/Livres: écrans directement sous `app/movies.tsx` et `app/books.tsx` (avec cartes + modales).

## Navigation (routes → écrans/composants)
- `app/index.tsx` → écran d’accueil (grille `MediaGrid`) qui route selon `MEDIA.key` via `router.push('/<key>')`.
- `app/anime.tsx` → `src/screens/AnimesScreen.tsx`
- `app/tv.tsx` → `src/screens/TVShowsScreen.tsx`
- `app/manga.tsx` → `src/screens/MangasScreen.tsx`
- `app/games.tsx` → `src/screens/GamesScreen.tsx`
- `app/podcast.tsx` → `src/screens/PodcastsScreen.tsx`
- `app/movies.tsx` → écran Movies in‑page utilisant `MovieCard`, `AddMovieModal`, `EditMovieModal` et `useMovies`
- `app/books.tsx` → écran Books in‑page utilisant `BookCard`, `AddBookModal` et `useBooks`
- `app/note.tsx` → `src/screens/NotesScreen.tsx`
