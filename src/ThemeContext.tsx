import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { loadJSON, saveJSON } from "./hooks/useStorage";
import { TextSize, Theme, ThemeMode, buildTheme } from "./theme";

type Settings = { mode: ThemeMode; textSize: TextSize };

const SETTINGS_KEY = "listana.settings.v1";
const DEFAULTS: Settings = { mode: "dark", textSize: "normal" };

type ThemeContextValue = {
  theme: Theme;
  settings: Settings;
  setMode: (mode: ThemeMode) => void;
  setTextSize: (size: TextSize) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    loadJSON<Settings>(SETTINGS_KEY, DEFAULTS).then((saved) =>
      setSettings({ ...DEFAULTS, ...saved })
    );
  }, []);

  function update(patch: Partial<Settings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    void saveJSON(SETTINGS_KEY, next);
  }

  const scheme =
    settings.mode === "system"
      ? systemScheme === "light"
        ? "light"
        : "dark"
      : settings.mode;

  const theme = useMemo(
    () => buildTheme(scheme, settings.textSize),
    [scheme, settings.textSize]
  );

  return (
    <ThemeContext.Provider
      value={{
        theme,
        settings,
        setMode: (mode) => update({ mode }),
        setTextSize: (textSize) => update({ textSize }),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useSettings(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useSettings doit être utilisé dans ThemeProvider");
  return ctx;
}

export function useTheme(): Theme {
  return useSettings().theme;
}