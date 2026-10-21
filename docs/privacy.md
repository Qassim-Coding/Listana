# Listana — Politique de confidentialité

Listana enregistre localement vos médias (titres, notes, progression, réglages). Aucune donnée n’est envoyée à un serveur sans action explicite de votre part. Dernière mise à jour : octobre 2026.

Le texte affiché dans l’app est dans `app/privacy.tsx`.

## Données et stockage

- Vos données sont stockées uniquement sur votre appareil (ou dans le navigateur, version web).
- Listana n’a ni compte ni serveur. Supprimer un élément, désinstaller l’app ou vider les données du site efface les données correspondantes.

## Recherches (seuls appels réseau)

Seul le texte tapé dans le champ de recherche est envoyé. Ni la bibliothèque, ni les notes, ni les avis ne quittent l’appareil. Les serveurs concernés reçoivent aussi l’adresse IP, comme pour n’importe quel site.

| Source | Médias | Clé |
|---|---|---|
| TMDB | Films, séries, animés | `EXPO_PUBLIC_TMDB_TOKEN` |
| RAWG | Jeux vidéo | `EXPO_PUBLIC_RAWG_KEY` |
| Open Library | Livres | Aucune |

Mentions : « This product uses the TMDB API but is not endorsed or certified by TMDB. » et « This product uses the RAWG API but is not endorsed or certified by RAWG. »

## Permissions

- Accès Internet uniquement, pour la recherche et les visuels (affiches, jaquettes, couvertures).
- Pas de localisation, de contacts, de caméra ni de micro.

## Publicité et statistiques

Aucun outil de publicité, de mesure d’audience ou de suivi.

## Contact

Pour toute question, passez par la page GitHub du projet.
