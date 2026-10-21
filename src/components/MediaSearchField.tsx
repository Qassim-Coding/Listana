import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SearchResult } from "../api/tmdb";
import { Theme } from "../theme";
import { useTheme } from "../ThemeContext";

// Un résultat peut avoir une ligne en plus sous le titre (ex. l'auteur d'un livre)
type Item = SearchResult & { subtitle?: string };

type Props<R extends Item> = {
  placeholder: string;
  search: (query: string) => Promise<R[]>;
  onPick: (result: R) => void;
  color: string;
  credit?: string;
};

export default function MediaSearchField<R extends Item>({ placeholder, search, onPick, color, credit }: Props<R>) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<R[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Recherche automatique 450 ms après la dernière frappe
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setError(null);
      setSearched(false);
      return;
    }
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await search(q);
        if (active) {
          setResults(r);
          setSearched(true);
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Recherche impossible");
      } finally {
        if (active) setLoading(false);
      }
    }, 450);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, search]);

  function pick(r: R) {
    onPick(r);
    setQuery("");
    setResults([]);
    setSearched(false);
  }

  return (
    <View>
      <View style={[styles.field, { borderColor: query ? color : t.border }]}>
        <Ionicons name="search-outline" size={18} color={query ? color : t.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor={t.textMuted}
          accessibilityLabel={placeholder}
          autoCorrect={false}
          style={styles.input}
        />
        {loading && <ActivityIndicator size="small" color={color} />}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {searched && !loading && results.length === 0 && !error && (
        <Text style={styles.empty}>Aucun résultat. Tu peux remplir à la main.</Text>
      )}

      {results.length > 0 && (
        <View style={styles.results}>
          {results.map((r) => {
            const meta = [r.subtitle, r.year].filter(Boolean).join(" · ");
            return (
              <Pressable
                key={`${r.id}-${r.title}`}
                onPress={() => pick(r)}
                accessibilityRole="button"
                accessibilityLabel={`${r.title}${meta ? `, ${meta}` : ""}`}
                style={({ pressed }) => [styles.row, pressed && { backgroundColor: t.cardAlt }]}
              >
                {r.posterUrl ? (
                  <Image source={{ uri: r.posterUrl }} style={styles.poster} />
                ) : (
                  <View style={[styles.poster, styles.posterEmpty, { backgroundColor: color + "33" }]}>
                    <Text style={[styles.posterLetter, { color }]}>{r.title.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.rowTitle} numberOfLines={2}>
                    {r.title}
                  </Text>
                  {meta ? (
                    <Text style={styles.rowYear} numberOfLines={1}>
                      {meta}
                    </Text>
                  ) : null}
                </View>
                <Ionicons name="add-circle-outline" size={24} color={color} />
              </Pressable>
            );
          })}
          {credit ? <Text style={styles.credit}>{credit}</Text> : null}
        </View>
      )}
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    field: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      minHeight: 48,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: 1,
      backgroundColor: t.bg,
    },
    input: { flex: 1, fontFamily: t.fonts.regular, fontSize: t.fs(15), color: t.text, paddingVertical: 10 },
    error: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.scheme === "dark" ? "#FF7A7A" : "#C62828", marginTop: 6 },
    empty: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted, marginTop: 6 },
    results: {
      marginTop: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.bg,
      overflow: "hidden",
    },
    row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 10, paddingVertical: 8, minHeight: 64 },
    poster: { width: 40, height: 60, borderRadius: 8 },
    posterEmpty: { alignItems: "center", justifyContent: "center" },
    posterLetter: { fontFamily: t.fonts.bold, fontSize: t.fs(16) },
    rowTitle: { fontFamily: t.fonts.semibold, fontSize: t.fs(14), color: t.text },
    rowYear: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted, marginTop: 2 },
    credit: { fontFamily: t.fonts.regular, fontSize: t.fs(10), color: t.textMuted, padding: 8, textAlign: "right" },
  });
}