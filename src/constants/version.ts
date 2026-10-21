import Constants from "expo-constants";

// Source unique : expo.version dans app.json (ex. "2.0.0")
export const APP_VERSION = Constants.expoConfig?.version ?? "2.0.0";

// Affichage : "2.0.0" → "Listana V2.0" (on retire le .0 final s'il est à 0)
export const APP_VERSION_LABEL = `Listana V${APP_VERSION.replace(/\.0$/, "")}`;
