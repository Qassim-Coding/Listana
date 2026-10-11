export type ThemeMode = "system" | "light" | "dark";
export type TextSize = "normal" | "large" | "xlarge";

const dark = {
  bg: "#0B0C10",
  card: "#14161B",
  cardAlt: "#1E2129",
  border: "#23262F",
  text: "#F3F4F7",
  textMuted: "#9096A3",
  accent: "#C6F432",
  onAccent: "#0B0C10",
  track: "#252932",
  overlay: "rgba(11,12,16,0.8)",
  media: {
    anime: "#7AA2FF",
    tv: "#FF9F6B",
    movie: "#FF6B8B",
    book: "#FFD166",
    manga: "#B69CFF",
    game: "#5EE0A0",
    podcast: "#5CD6E6",
    notes: "#C9CCD6",
  },
};

const light: typeof dark = {
  bg: "#F4F5F8",
  card: "#FFFFFF",
  cardAlt: "#EBEDF2",
  border: "#E2E5EB",
  text: "#14151A",
  textMuted: "#5E6372",
  accent: "#C6F432",
  onAccent: "#14151A",
  track: "#E4E7EE",
  overlay: "rgba(255,255,255,0.9)",
  media: {
    anime: "#3B6FE0",
    tv: "#D9682B",
    movie: "#D63A62",
    book: "#B07D0A",
    manga: "#7B5CE0",
    game: "#1E9E64",
    podcast: "#1592A6",
    notes: "#6B7080",
  },
};

const TEXT_SCALE: Record<TextSize, number> = {
  normal: 1,
  large: 1.15,
  xlarge: 1.3,
};

export function buildTheme(scheme: "light" | "dark", textSize: TextSize = "normal") {
  const scale = TEXT_SCALE[textSize];
  return {
    ...(scheme === "dark" ? dark : light),
    scheme,
    radius: { card: 22, pill: 999, tile: 20 },
    fonts: {
      regular: "Poppins_400Regular",
      semibold: "Poppins_600SemiBold",
      bold: "Poppins_700Bold",
    },
    // Taille de police ajustée selon le réglage "Taille du texte"
    fs: (size: number) => Math.round(size * scale),
  };
}

export type Theme = ReturnType<typeof buildTheme>;

export function makeHeaderOptions(t: Theme) {
  return {
    headerShown: true,
    headerStyle: { backgroundColor: t.bg },
    headerShadowVisible: false,
    headerTintColor: t.text,
    headerTitleStyle: {
      fontFamily: t.fonts.bold,
      fontSize: t.fs(22),
      color: t.text,
    },
  };
}

// Compatibilité pour les fichiers pas encore refaits
export const theme = buildTheme("dark");
export const headerOptions = makeHeaderOptions(theme);