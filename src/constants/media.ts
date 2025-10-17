export const MEDIA = [
  { key: "tv",      label: "Séries TV", emoji: "📺" },
  { key: "books",   label: "Livres",    emoji: "📚" },
  { key: "movies",  label: "Films",     emoji: "🎞️" },
  { key: "games",   label: "Jeux vidéo",emoji: "🎮" },
  { key: "anime",   label: "Animés",    emoji: "🎌" },
  { key: "manga",   label: "Mangas",    emoji: "🍥" },
  { key: "podcast", label: "Podcast / Livre audio",  emoji: "🎙️" },
  { key: "note",   label: "Autres",    emoji: "📝" },
] as const;

export type MediaKey = typeof MEDIA[number]["key"];
