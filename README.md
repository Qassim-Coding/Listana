# Listana — votre carnet multi-médias

Listana regroupe au même endroit ce que vous regardez, lisez, jouez et écoutez. Vous ajoutez une œuvre, suivez votre progression, reprenez là où vous en étiez et marquez ce qui est terminé.

**Listana V2.0** (`2.0.0` dans `app.json`). Démo web : [qassim-coding.github.io/Listana](https://qassim-coding.github.io/Listana)

## Pourquoi c'est utile

- **Un seul carnet** pour les animés, séries, films, livres, mangas, jeux vidéo, podcasts, livres audio et notes.
- **Reprendre en un coup d'œil** : l'accueil affiche ce qui est en cours, tous médias confondus. Sur Android, le widget **Listana · Reprendre** le montre aussi depuis l'écran d'accueil.
- **Une progression adaptée au média** : épisodes et saisons, minutes, pages, tomes ou chapitres.
- **Mise à jour rapide** : +1 épisode, ou saisie de la page, du chapitre ou des minutes.
- **Fiches remplies pour vous** : TMDB, Open Library, RAWG, MyAnimeList, Apple Podcasts / Books.

## Fonctionnalités

### Accueil

- Section « Reprendre » : éléments en cours, du plus récent au plus ancien.
- Grille de catégories (icône et couleur par média).
- Lien Confidentialité et mention **Listana V2.0** (lue depuis `app.json`).
- Accès aux paramètres.

### Paramètres

- Apparence : système, clair ou sombre.
- Taille du texte : normal, grand ou très grand.
- À propos : liste des sources (TMDB, Open Library, RAWG, MyAnimeList, Apple).

### Par média

- **Animés** : animé ou film/OAV, +1 épisode, statuts automatiques. Recherche TMDB.
- **Séries TV** : saisons et épisodes, +1 avec passage de saison. Recherche TMDB.
- **Films** : minutes, note /5, avis. Recherche TMDB.
- **Livres** : pages optionnelles, statut calculé à partir de la page. Recherche Open Library. On peut encore changer la page après « Terminé », et marquer un livre « Abandonné » (il quitte « En cours » sans perdre la page).
- **Mangas** : tome ou chapitre, +1 / +5 / +10. Recherche MyAnimeList (API officielle).
- **Jeux vidéo** : plateforme, genre, « où j'en suis ». Recherche RAWG.
- **Podcasts et livres audio** : filtre par type, +1. Recherche Apple (iTunes). Lien « Écouter sur Apple Podcasts / Books » à côté de la pochette.
- **Bloc-notes** : libre, liste à cocher, ou liée à une œuvre, avec repères.

Partout : barre « Filtrer ma liste », filtres d'état colorés, tri, modification, duplication (selon le média), suppression avec confirmation.

Les cartes et les puces de filtre partagent 4 couleurs d'état : bleu (en cours), orange (à voir / lire / jouer / écouter), vert (terminé), rouge (abandonné).

Les fenêtres d'ajout et de modification utilisent un `BottomSheet` commun (fond plein écran, clavier, marge au-dessus de la barre de navigation Android). Les boutons Dupliquer / Supprimer sont dans `SheetActions` (48 px, icône, surbrillance).

### Widget Android

- Nom : **Listana · Reprendre**. À poser depuis le sélecteur de widgets du téléphone.
- Liste les œuvres en cours (1 à 4 lignes selon la hauteur). État vide : « Rien en cours pour l'instant ».
- Un appui sur **Reprendre** ouvre l'accueil. Un appui sur une ligne ouvre l'écran de ce média.
- Thème clair / sombre selon le téléphone. Couleurs d'état identiques à l'app.
- Se met à jour au retour sur l'accueil, quand on quitte l'app, au redimensionnement, et toutes les 30 minutes.
- Android seulement, sur un **build natif** (EAS / `npx expo run:android`). Invisible dans Expo Go et sur le web.

## Où sont enregistrées les données

Tout reste sur l'appareil. Aucun compte.

`src/hooks/useStorage.ts` : MMKV (build natif / EAS) ou AsyncStorage (Expo Go, web).

Les seuls appels réseau sont les recherches. Elles envoient le texte tapé ; la bibliothèque ne quitte pas l'appareil.

Détail des clés : [docs/ARBORESCENCE.md](docs/ARBORESCENCE.md). Texte dans l'app : [docs/privacy.md](docs/privacy.md) et `app/privacy.tsx`.

## Version

Une seule source : `"version": "2.0.0"` dans `app.json` (et la même dans `package.json`).  
`src/constants/version.ts` affiche **Listana V2.0**. Pour passer à V2.1 : mets `2.1.0` dans ces deux fichiers.

## Démarrer

```bash
npm install
npx expo start
```

### Clés de recherche (optionnel)

Fichier `.env.local` à la racine :

```bash
EXPO_PUBLIC_TMDB_TOKEN=votre_jeton_tmdb
EXPO_PUBLIC_RAWG_KEY=votre_cle_rawg
EXPO_PUBLIC_MAL_CLIENT_ID=votre_client_id_mal
```

- TMDB : [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
- RAWG : [rawg.io/apidocs](https://rawg.io/apidocs)
- MyAnimeList : identifiant client API sur [myanimelist.net](https://myanimelist.net/apiconfig)

Open Library et Apple (iTunes Search) n'ont pas besoin de clé. Sans `.env.local`, l'app fonctionne ; les champs TMDB, RAWG et MAL sont masqués ou inutilisables. Relance `expo start` après un changement de `.env.local`.

Les variables `EXPO_PUBLIC_*` sont dans le bundle livré : lecture seule seulement, jamais un vrai secret.

MyAnimeList est souvent **bloqué par le navigateur** (CORS). La recherche manga se teste sur **téléphone** (build EAS), pas sur le web.

### Autres commandes

```bash
npm run web
npm run android
npm run ios
npm run lint
npx tsc --noEmit
npm run export:web
npm run preview:web
```

## Design

- Thème clair / sombre : `src/theme.ts`, `src/ThemeContext.tsx`.
- Une couleur par média. Poppins 400 / 600 / 700. Ionicons.
- Couleurs d'état partagées : `src/constants/statusColors.ts`.
- Zones tactiles ≥ 44 px (boutons d'action des fenêtres : 48 px).
- Icône : quatre tuiles sur fond `#0E1733`. Splash : `#F4F5F8` / `#0B0C10`.

## Pile technique

Expo SDK 54, Expo Router 6, React 19.1, React Native 0.81, TypeScript.

## Publication

- **Web** : push `main` / `master` → `.github/workflows/deploy-web.yml`. La démo est publique : on n'y met volontairement **aucune clé**, car les variables `EXPO_PUBLIC_*` y seraient lisibles par tous. Sur la démo, seules les recherches Open Library et Apple fonctionnent.
- **Mobile** : EAS Build, `com.listana.app`. Un correctif JS n'apparaît sur un APK Samsung qu'après un **nouveau build** preview / production.

## Nouveautés de la V2.0

**Interface**

- Thème clair / sombre, taille de texte, accueil « Reprendre ».
- Nouvelle icône / favicon. Mention Listana V2.0 en bas de l'accueil.
- `BottomSheet` commun à toutes les fenêtres (fond plein écran, clavier, barre Android).
- Boutons Dupliquer / Supprimer via `SheetActions`.
- Barre « Filtrer ma liste » et puces d'état colorées.
- Widget Android **Listana · Reprendre** (écran d'accueil).

**Données**

- TMDB (films, séries, animés), Open Library (livres), RAWG (jeux).
- MyAnimeList officiel pour les mangas (plus Jikan).
- Apple iTunes pour podcasts et livres audio, avec lien « Écouter sur… ».
- Notes : listes et notes liées à une œuvre.

**Corrections**

- Livres : on peut encore changer la page (et donc le statut) après « Terminé ».
- Livres : statut « Abandonné » (le livre quitte « En cours », la page est conservée).
- Mangas, jeux, podcasts persistés. +1 épisode, saisons, filtres, suppression, retour web.

## Ensuite

- Autres sources seulement après vérification des conditions (app concurrente, usage commercial, images, CORS).
- Gestes sur les cartes, retours haptiques.

---

Made by Qassim-Coding
