import { Anime } from "../types/anime";

// Tout le calcul « où j'en suis » d'un animé, au même endroit :
// utilisé par la carte, l'accueil (Reprendre), le widget et le bloc-notes.

const pad = (n: number) => String(n).padStart(2, "0");

// Un animé (série) se suit par saisons, un film / OAV par simple compteur
export function isSeasonal(a: Anime): boolean {
  return a.kind !== "film";
}

// Épisodes d'une saison : pour la saison en cours, la valeur du formulaire ;
// pour une autre saison, la valeur TMDB si on la connaît, sinon la même que la saison en cours
export function episodesOf(a: Anime, season: number): number {
  const current = a.currentSeason || 1;
  if (season === current && a.episodesPerSeason) return a.episodesPerSeason;
  // Ancien animé pas encore converti (sans saison) : son total compte comme une seule saison
  const legacy = a.currentSeason == null ? a.totalEpisodes ?? 0 : 0;
  return a.seasonEpisodes?.[season - 1] || a.episodesPerSeason || legacy || 0;
}

// Saison/épisode à partir d'un numéro d'épisode « absolu » (ex. épisode 30 → saison 2, épisode 4)
export function absoluteToSeason(seasonEpisodes: number[], absolute: number): { season: number; episode: number } {
  let left = Math.max(0, absolute);
  for (let i = 0; i < seasonEpisodes.length; i++) {
    const per = seasonEpisodes[i] || 0;
    if (left <= per || i === seasonEpisodes.length - 1) {
      return { season: i + 1, episode: Math.min(left, per || left) };
    }
    left -= per;
  }
  return { season: 1, episode: left };
}

export type AnimeProgress = {
  label: string; // « Saison 2 / 3 · Ép. 5 / 13 » ou « Épisode 3 / 6 »
  short: string; // « S2 · Ép. 5 / 13 » (accueil, widget, notes)
  pct: number | null; // avancement dans la saison en cours (ou du film / OAV)
  next: string; // « Prochain : S02E06 », vide si rien à suivre
};

export function animeProgress(a: Anime): AnimeProgress {
  const ep = a.currentEpisode ?? 0;
  const done = a.status === "done";

  if (!isSeasonal(a)) {
    const total = a.totalEpisodes;
    const label = `Épisode ${ep}${total ? ` / ${total}` : ""}`;
    return {
      label,
      short: label,
      pct: total ? Math.min(100, Math.round((ep / total) * 100)) : null,
      next: "",
    };
  }

  const season = a.currentSeason || 1;
  const per = episodesOf(a, season);
  const seasonLabel = a.totalSeasons ? `Saison ${season} / ${a.totalSeasons}` : `Saison ${season}`;
  const episodeLabel = per > 0 ? `Ép. ${ep} / ${per}` : `Ép. ${ep}`;

  let next = "";
  if (!done) {
    if (per > 0 && ep >= per) {
      const isLast = !!a.totalSeasons && season >= a.totalSeasons;
      next = isLast ? "" : `Prochain : S${pad(season + 1)}E01`;
    } else {
      next = `Prochain : S${pad(season)}E${pad(ep + 1)}`;
    }
  }

  return {
    label: `${seasonLabel} · ${episodeLabel}`,
    short: `S${season} · ${episodeLabel}`,
    pct: per > 0 ? Math.min(100, Math.round((ep / per) * 100)) : null,
    next,
  };
}
