import { loadJSON, saveJSON } from "../hooks/useStorage";
import { Game } from "../types/game";

let games: Game[] = [];
let loaded = false;
let loading: Promise<void> | null = null;

export const GAME_STORAGE_KEY = "listana.game.v1";

// Charge la liste sauvegardée (une seule fois).
// À appeler au montage de l'écran Jeux avant d'afficher la liste.
export function initGames(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (!loading) {
    loading = loadJSON<Game[]>(GAME_STORAGE_KEY, []).then((stored) => {
      const storedIds = new Set(stored.map((g) => g.id));
      // Garde les jeux ajoutés en mémoire avant la fin du chargement
      games = [...stored, ...games.filter((g) => !storedIds.has(g.id))];
      loaded = true;
    });
  }
  return loading;
}

// Sauvegarde toujours après le chargement, pour ne jamais écraser
// la liste enregistrée avec une liste vide.
async function persist() {
  await initGames();
  await saveJSON(GAME_STORAGE_KEY, games);
}

export function getGames(): Game[] {
  return games;
}

export function addGame(game: Game) {
  games.push(game);
  void persist();
}

export function updateGame(id: string, changes: Partial<Game>) {
  games = games.map((g) => (g.id === id ? { ...g, ...changes } : g));
  void persist();
}

export function deleteGame(id: string) {
  games = games.filter((g) => g.id !== id);
  void persist();
}

export function filterGamesByStatus(status: Game["status"]): Game[] {
  return games.filter((g) => g.status === status);
}

export function sortGames(by: "platform" | "genre" | "date"): Game[] {
  return [...games].sort((a, b) => {
    if (by === "platform") return a.platform.localeCompare(b.platform);
    if (by === "genre") return a.genre.localeCompare(b.genre);
    if (by === "date")
      return (a.releaseDate ?? "").localeCompare(b.releaseDate ?? "");
    return 0;
  });
}