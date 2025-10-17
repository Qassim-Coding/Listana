export type GameStatus = "toPlay" | "playing" | "completed" | "abandoned";
export type GameGenre = "RPG" | "FPS" | "indé" | "rétro" | "mobile";
export type GamePlatform = "PC" | "Nintendo" | "PS5" | "Xbox" | "Mobile";

export interface Game {
  id: string;
  title: string;
  genre: GameGenre;
  platform: GamePlatform;
  status: GameStatus;
  releaseDate?: string;
  notes?: string;
  lastCheckpoint?: string;
}