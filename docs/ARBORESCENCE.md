# Arborescence du projet Listana (Version 1.2)

```
.
|-- .expo/
|-- .github/
|   |-- workflows/
|       |-- deploy-web.yml          # CI/CD automatique vers GitHub Pages
|-- .vscode/
|-- app/
|   |-- +not-found.tsx              # Page 404
|   |-- _layout.tsx                 # Layout principal avec fonts Poppins
|   |-- anime.tsx                   # Page Animes
|   |-- books.tsx                   # Page Livres (filtres, cartes, modales)
|   |-- games.tsx                   # Page Jeux vidéo
|   |-- index.tsx                   # Page d'accueil avec MediaGrid
|   |-- manga.tsx                   # Page Mangas
|   |-- movies.tsx                  # Page Films (filtres, cartes, modales)
|   |-- note.tsx                    # Page Bloc-notes
|   |-- podcast.tsx                 # Page Podcasts
|   |-- privacy.tsx                 # Page Politique de confidentialité
|   |-- tv.tsx                      # Page Séries TV
|-- app-example/                    # Exemple Expo (référence)
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
|-- dist/                           # Build web (généré par expo export)
|-- docs/
|   |-- ARBORESCENCE.md            # Ce fichier
|   |-- privacy.md                 # Politique de confidentialité (documentation)
|-- scripts/
|   |-- fix-public-paths.cjs       # Script post-build pour GitHub Pages (History API)
|-- src/
|   |-- components/
|   |   |-- AddAnimeModal.tsx       # ✨ v1.2: KeyboardAvoidingView + ScrollView
|   |   |-- AddBookModal.tsx        # ✨ v1.2: KeyboardAvoidingView + ScrollView
|   |   |-- AddMovieModal.tsx       # ✨ v1.2: KeyboardAvoidingView + ScrollView
|   |   |-- AddTVShowModal.tsx      # ✨ v1.2: KeyboardAvoidingView + ScrollView
|   |   |-- AnimeCard.tsx
|   |   |-- BookCard.tsx
|   |   |-- EditAnimeModal.tsx      # ✨ v1.2: KeyboardAvoidingView + ScrollView
|   |   |-- EditGameModal.tsx       # ✨ v1.2: KeyboardAvoidingView + ScrollView
|   |   |-- EditMangaModal.tsx      # ✨ v1.2: KeyboardAvoidingView + ScrollView
|   |   |-- EditMovieModal.tsx      # ✨ v1.2: KeyboardAvoidingView + ScrollView
|   |   |-- EditNoteModal.tsx       # ✨ v1.2: KeyboardAvoidingView + ScrollView
|   |   |-- EditPodcastModal.tsx    # ✨ v1.2: KeyboardAvoidingView + ScrollView
|   |   |-- EditTVShowModal.tsx     # ✨ v1.2: KeyboardAvoidingView + ScrollView
|   |   |-- GameCard.tsx
|   |   |-- MangaCard.tsx           # ✨ v1.2: Nouveau design (Dernier lu, suppression barre progression)
|   |   |-- MediaCard.tsx           # ✨ v1.2: Fix texte multi-lignes (aspectRatio 1, numberOfLines 2)
|   |   |-- MediaGrid.tsx
|   |   |-- MovieCard.tsx
|   |   |-- NoteCard.tsx
|   |   |-- PodcastCard.tsx
|   |   |-- TVShowCard.tsx
|   |   |-- WebBackButton.tsx       # Bouton retour dédié pour navigateur web
|   |-- constants/
|   |   |-- media.ts                # Configuration des types de médias
|   |-- hooks/
|   |   |-- useAnimes.ts
|   |   |-- useBooks.ts
|   |   |-- useMovies.ts
|   |   |-- useStorage.ts           # Hook générique pour AsyncStorage
|   |   |-- useTVShows.ts
|   |-- screens/
|   |   |-- AnimesScreen.tsx
|   |   |-- GamesScreen.tsx         # ✨ v1.2: Fix traduction "plateforme"
|   |   |-- MangasScreen.tsx        # ✨ v1.2: Ajout bouton supprimer
|   |   |-- NotesScreen.tsx         # ✨ v1.2: Ajout tri par date/modification
|   |   |-- PodcastsScreen.tsx
|   |   |-- TVShowsScreen.tsx
|   |-- storage/
|   |   |-- game.store.ts           # MMKV storage pour jeux
|   |   |-- manga.store.ts          # MMKV storage pour mangas
|   |   |-- note.store.ts           # MMKV storage pour notes
|   |   |-- podcast.store.ts        # MMKV storage pour podcasts
|   |-- types/
|       |-- anime.ts                # Interface Anime
|       |-- book.ts                 # Interface Book
|       |-- game.ts                 # Interface Game
|       |-- manga.ts                # Interface Manga (lastChapter, chapterNumber, volumeNumber)
|       |-- movie.ts                # Interface Movie
|       |-- note.ts                 # Interface Note
|       |-- podcast.ts              # Interface Podcast
|       |-- tvshow.ts               # Interface TVShow
|-- app.json                        # Config Expo (bundle ID: com.listana.app)
|-- eas.json                        # ✨ v1.2: Configuration EAS Build (Android)
|-- eslint.config.js
|-- expo-env.d.ts
|-- package-lock.json
|-- package.json                    # Dépendances (Expo SDK 52, React 19, React Native 0.81)
|-- README.md                       # ✨ v1.2: Documenté toutes les améliorations
|-- tsconfig.json
```

## Points notables

### Architecture
- **Expo Router v6** : Navigation basée sur les fichiers dans `app/`
- **Storage local** : MMKV pour persistance sans permissions réseau
- **Design responsive** : `useWindowDimensions` pour mobile/tablette/desktop
- **Multi-plateforme** : Web (GitHub Pages) + Android/iOS (EAS Build)

### Version 1.2 - Améliorations UX/UI
- ✅ **Tous les modaux** (9 fichiers) : `KeyboardAvoidingView` + `ScrollView` → clavier ne cache plus les champs
- ✅ **MangaCard** : Nouveau design "Dernier lu" sans barre de progression
- ✅ **MediaCard** : Fix texte multi-lignes (aspectRatio 1, numberOfLines 2, fontSize 12)
- ✅ **MangasScreen** : Bouton supprimer ajouté
- ✅ **NotesScreen** : Tri par date de création ou modification
- ✅ **GamesScreen** : Traduction "Trier par plateforme"
- ✅ **Emojis** : Fix encodage UTF-8 (🗑️ icône corbeille)

### Déploiement
- **Web** : GitHub Actions → `deploy-web.yml` → GitHub Pages
- **Script post-build** : `fix-public-paths.cjs` intercepte History API pour routing
- **Android** : EAS Build avec profil `preview` (APK) et `production` (AAB)
- **Bundle ID** : `com.listana.app`

### Navigation
- `app/index.tsx` : Accueil avec `MediaGrid`, navigation via `router.push`
- `app/anime.tsx`, `app/tv.tsx`, `app/manga.tsx`, `app/games.tsx`, `app/podcast.tsx`, `app/note.tsx` : Ponts vers `src/screens`
- `app/movies.tsx` et `app/books.tsx` : Écrans complets avec filtres intégrés
- `app/privacy.tsx` : Politique de confidentialité accessible depuis l'accueil

### Thème
- **Header** : Titre noir (`#111827`) + flèche retour bleue (`#12AAB8`)
- **Fonts** : Poppins (300, 400, 500, 600, 700) via `@expo-google-fonts`
- **Cards** : Blanc avec bordure grise, hover effect sur web
- **Modales** : ScrollView + KeyboardAvoidingView pour meilleure accessibilité mobile
```

## Navigation (rappel)
- `app/index.tsx` : accueil et grille `MediaGrid`, navigation via `router.push`.
- `app/anime.tsx`, `app/tv.tsx`, `app/manga.tsx`, `app/games.tsx`, `app/podcast.tsx`, `app/note.tsx` : ponts vers les écrans dédiés de `src/screens`.
- `app/movies.tsx` et `app/books.tsx` : écrans complets avec filtres, cartes et modales intégrées.
- `app/privacy.tsx` : écran Politique de confidentialité accessible depuis la page d’accueil.
