import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

// Charge MMKV uniquement si le module natif est disponible (dev build/EAS)
let mmkv: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MMKV } = require("react-native-mmkv");
  mmkv = new MMKV();
} catch {
  mmkv = null;
}

// Fonctions utilitaires
export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = mmkv
      ? mmkv.getString(key)
      : await AsyncStorage.getItem(key);

    if (!raw) return fallback;

    const decoded = mmkv ? raw : decodeURIComponent(raw);
    return JSON.parse(decoded) as T;
  } catch {
    return fallback;
  }
}

export async function saveJSON<T>(key: string, value: T) {
  try {
    const json = JSON.stringify(value);
    const encoded = mmkv ? json : encodeURIComponent(json);

    if (mmkv) mmkv.set(key, encoded);
    else await AsyncStorage.setItem(key, encoded);
  } catch {}
}

// Hook React
export function useStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    loadJSON<T>(key, defaultValue).then(setValue);
  }, [key]);

  const save = async (newValue: T) => {
    setValue(newValue);
    await saveJSON<T>(key, newValue);
  };

  return [value, save] as const;
}