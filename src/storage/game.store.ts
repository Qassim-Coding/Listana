import { Game } from "../types/game";

let games: Game[] = [];

export function getGames(): Game[] {
  return games;
}

export function addGame(game: Game) {
  games.push(game);
}

export function updateGame(id: string, changes: Partial<Game>) {
  games = games.map((g) => (g.id === id ? { ...g, ...changes } : g));
}

export function deleteGame(id: string) {
  games = games.filter((g) => g.id !== id);
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