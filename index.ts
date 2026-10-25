// Point d'entrée de l'app (remplace "expo-router/entry" dans package.json → "main")
// 1. Lance l'app normalement avec Expo Router
import "expo-router/entry";
// 2. Branche les widgets Android (ce fichier ne fait rien sur le web et iOS)
import "./src/widgets/register";
