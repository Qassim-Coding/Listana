# Listana — votre carnet multi-médias

Listana regroupe au même endroit ce que vous regardez, lisez, jouez et écoutez. Vous ajoutez une œuvre, suivez votre progression, reprenez là où vous en étiez et marquez ce qui est terminé.

**Version 2 — refonte complète de l'interface.** Démo web : [qassim-coding.github.io/Listana](https://qassim-coding.github.io/Listana)

## Pourquoi c'est utile

- **Un seul carnet** pour les animés, séries, films, livres, mangas, jeux vidéo, podcasts, livres audio et notes.
- **Reprendre en un coup d'œil** : l'accueil affiche ce qui est en cours, tous médias confondus.
- **Une progression adaptée au média** : épisodes et saisons, minutes, pages, tomes ou chapitres.
- **Mise à jour rapide** : +1 épisode en un geste, ou saisie directe de la page, du chapitre ou des minutes atteints.
- **Fiches remplies pour vous** : TMDB pour les films, séries et animés ; Open Library pour les livres ; RAWG pour les jeux vidéo.

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

- **Animés** : animé ou film/OAV, épisodes, +1 épisode, passage automatique en « En cours » puis « Terminé ». Recherche TMDB, dates de début et de fin.
- **Séries TV** : saisons et épisodes, +1 épisode avec passage automatique à la saison suivante, prochain épisode affiché. Recherche TMDB avec import du nombre de saisons et d'épisodes.
- **Films** : durée, minutes vues, note sur 5 étoiles, avis. Recherche TMDB avec affiche et durée.
- **Livres** : auteur, pages optionnelles, statut calculé à partir de la page atteinte, notes. Recherche Open Library (couverture, auteur, pages).
- **Mangas** : suivi au tome ou au chapitre/scan, mise à jour par saisie directe ou +1 / +5 / +10. Recherche Jikan / MyAnimeList (couverture, auteur, tomes).
- **Jeux vidéo** : plateforme, genre, « où j'en suis », bouton commencer puis terminer. Recherche RAWG (titre, jaquette).
- **Podcasts et livres audio** : filtre par type, +1 épisode ou chapitre.
- **Bloc-notes** : trois types de notes. Note libre, liste à cocher, ou note liée à une œuvre de votre bibliothèque avec des repères (« p. 134 », « Ép. 14 »). Éditeur plein écran, nombre de mots, tri par modification ou création.

Partout : recherche, filtres par statut avec compteurs, tri, modification, duplication (selon le média) et suppression avec confirmation.

## Où sont enregistrées les données

Tout reste sur l'appareil. Aucun compte n'est requis.

`src/hooks/useStorage.ts` utilise MMKV quand le module natif est disponible (build de développement ou EAS), et AsyncStorage sinon (Expo Go, web). Tous les médias et les paramètres sont conservés après un redémarrage.

Les seuls appels réseau sont les recherches TMDB, Open Library, RAWG et Jikan. Elles envoient uniquement le texte tapé dans le champ de recherche ; rien de votre bibliothèque ne quitte l'appareil.

Le détail des clés est dans [docs/ARBORESCENCE.md](docs/ARBORESCENCE.md). Le texte affiché dans l'app est dans [docs/privacy.md](docs/privacy.md).

## Démarrer

```bash
npm install
npx expo start
```

### Recherches TMDB et RAWG (optionnel)

Créez un fichier `.env.local` à la racine :

```bash
EXPO_PUBLIC_TMDB_TOKEN=votre_jeton_tmdb
EXPO_PUBLIC_RAWG_KEY=votre_cle_rawg
```

- TMDB : jeton d'accès en lecture sur [themoviedb.org](https://www.themoviedb.org/settings/api).
- RAWG : clé API sur [rawg.io/apidocs](https://rawg.io/apidocs).

Open Library et Jikan n'ont pas besoin de clé. Sans `.env.local`, l'app fonctionne normalement ; les champs TMDB et RAWG sont simplement masqués. `.env.local` est ignoré par Git. Redémarrez `expo start` après l'avoir créé ou modifié.

Comme toute variable `EXPO_PUBLIC_*`, ces clés sont intégrées au bundle livré aux utilisateurs. C'est acceptable pour des clés en lecture seule, pas pour un vrai secret.

### Autres commandes

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
- Icône et favicon : quatre tuiles (livre, manette, pellicule, casque) sur fond bleu nuit `#0E1733`, déclinées pour iOS, Android (adaptive icon), le web et l'écran de lancement.

## Pile technique

Expo SDK 54, Expo Router 6, React 19.1, React Native 0.81, TypeScript.

## Publication

- **Web** : un push sur `main` ou `master` lance `.github/workflows/deploy-web.yml`. Le script `scripts/fix-public-paths.cjs` préfixe les assets par `/Listana` et force le routing par hash, comme `app.json` (`extra.router.history`). Le workflow ne transmet ni `EXPO_PUBLIC_TMDB_TOKEN` ni `EXPO_PUBLIC_RAWG_KEY` : pour activer ces recherches sur la démo, ajoutez ces secrets au dépôt GitHub et passez-les dans l'étape d'export.
- **Mobile** : EAS Build, identifiant `com.listana.app`. Profils development, preview et production dans `eas.json`.

## Nouveautés de la version 2

**Interface**

- Nouveau design, thème clair/sombre et taille de texte réglable.
- Accueil avec « Reprendre » et catégories colorées.
- Cartes épurées et formulaires avec étiquettes visibles.
- Écrans dédiés de mise à jour de progression (manga, livre, film).
- Nouvelle icône et nouveau favicon.

**Données**

- Recherche TMDB dans les formulaires Films, Séries et Animés.
- Recherche Open Library dans le formulaire Livres.
- Recherche RAWG dans le formulaire Jeux.
- Recherche Jikan / MyAnimeList dans le formulaire Mangas.
- Sélecteur de date avec calendrier pour les dates de début et de fin.
- Notes à cocher et notes liées à une œuvre, avec repères de progression.

**Corrections**

- Mangas, jeux et podcasts n'étaient pas sauvegardés : ils le sont désormais.
- Animés : les statuts enregistrés par l'ancien formulaire d'édition n'apparaissaient pas dans les filtres (converti automatiquement).
- Animés et séries : +1 épisode passe en « En cours ».
- Séries : +1 en fin de saison passe à la saison suivante ; plusieurs taps rapides sont tous comptés.
- Films : statut automatique selon les minutes vues ; date de début enregistrée ; titre obligatoire.
- Jeux, podcasts : suppression ajoutée. Notes : confirmation avant suppression.
- Web : bouton retour fonctionnel en accès direct par URL.

## Ensuite

- Autres API pour remplir les fiches : iTunes (podcasts).
- Balayer une carte pour la marquer terminée, retour haptique, compteurs sur l'accueil.
- Widgets d'écran d'accueil (Android d'abord).

---

Made by Qassim-Coding
