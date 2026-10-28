import Constants from "expo-constants";

// Source unique : expo.version dans app.json (ex. "2.2.0")
export const APP_VERSION = Constants.expoConfig?.version ?? "2.2.0";

// Affichage : "2.2.0" → "Listana V2.2" (on retire le .0 de patch s'il est à 0)
export const APP_VERSION_LABEL = `Listana V${APP_VERSION.replace(/\.0$/, "")}`;
