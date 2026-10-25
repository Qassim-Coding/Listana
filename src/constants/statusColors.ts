import { Theme } from "../theme";

// Les 4 familles d'états, les mêmes pour tous les médias :
// en cours = bleu clair · à voir / lire / jouer / écouter = orange clair · terminé = vert foncé · abandonné = rouge clair
export type StatusTone = "progress" | "planned" | "done" | "dropped";

// Chaque média a ses propres noms d'états : on les range dans ces 4 familles
const TONE_OF: Record<string, StatusTone> = {
  // En cours
  watching: "progress", // animés, séries, films
  in_progress: "progress", // livres
  reading: "progress", // mangas
  playing: "progress", // jeux
  listening: "progress", // podcasts
  // Pas encore commencé
  planning: "planned", // animés, séries, films, livres
  toRead: "planned", // mangas
  toPlay: "planned", // jeux
  toListen: "planned", // podcasts
  // Terminé
  done: "done",
  completed: "done",
  // Abandonné
  dropped: "dropped",
  abandoned: "dropped",
};

// Couleur de base de chaque famille, un peu plus claire en thème sombre pour rester visible
const BASE: Record<StatusTone, { light: string; dark: string }> = {
  progress: { light: "#3B8FE0", dark: "#6DB3FF" },
  planned: { light: "#E8892B", dark: "#FFB067" },
  done: { light: "#1F7A45", dark: "#3FAE6A" },
  dropped: { light: "#E05252", dark: "#FF8A80" },
};

export type StatusColors = {
  base: string; // couleur pleine
  cardBg: string; // fond très léger de la carte (le texte reste lisible)
  cardBorder: string;
  chipBg: string; // onglet de filtre non sélectionné
  chipBorder: string;
  chipOnBg: string; // onglet sélectionné
  chipOnText: string;
};

export function statusTone(status?: string): StatusTone | undefined {
  return status ? TONE_OF[status] : undefined;
}

// Couleurs d'un état pour le thème actuel (undefined pour « Tous » ou un état inconnu)
export function statusColors(t: Theme, status?: string): StatusColors | undefined {
  const tone = statusTone(status);
  if (!tone) return undefined;
  const dark = t.scheme === "dark";
  const base = dark ? BASE[tone].dark : BASE[tone].light;
  return {
    base,
    cardBg: mix(t.card, base, dark ? 0.14 : 0.1),
    cardBorder: mix(t.border, base, 0.45),
    chipBg: mix(t.card, base, dark ? 0.16 : 0.12),
    chipBorder: mix(t.border, base, 0.55),
    chipOnBg: base,
    chipOnText: readableOn(base),
  };
}

// --- petits calculs de couleur (couleurs au format #RRGGBB) ---

function toRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

// Mélange deux couleurs : ratio 0 = a, ratio 1 = b
function mix(a: string, b: string, ratio: number): string {
  const ca = toRgb(a);
  const cb = toRgb(b);
  const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * ratio));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
}

// Luminosité perçue d'une couleur (0 = noir, 1 = blanc)
function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Texte noir ou blanc sur une couleur : on prend celui qui se lit le mieux
function readableOn(hex: string): string {
  const l = luminance(hex);
  const onBlack = (l + 0.05) / 0.05;
  const onWhite = 1.05 / (l + 0.05);
  return onBlack >= onWhite ? "#0B0C10" : "#FFFFFF";
}
