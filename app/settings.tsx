import { Stack } from "expo-router";
import React, { useMemo } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import WebBackButton from "../src/components/WebBackButton";
import { TextSize, Theme, ThemeMode, makeHeaderOptions } from "../src/theme";
import { useSettings } from "../src/ThemeContext";

const isWeb = Platform.OS === "web";

const MODES: { key: ThemeMode; label: string }[] = [
  { key: "system", label: "Système" },
  { key: "light", label: "Clair" },
  { key: "dark", label: "Sombre" },
];

const SIZES: { key: TextSize; label: string }[] = [
  { key: "normal", label: "Normal" },
  { key: "large", label: "Grand" },
  { key: "xlarge", label: "Très grand" },
];

function Segmented<K extends string>({
  options,
  value,
  onChange,
  t,
}: {
  options: { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
  t: Theme;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 4, padding: 4, borderRadius: 16, backgroundColor: t.cardAlt }}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={{
              flex: 1,
              minHeight: 44,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: active ? t.card : "transparent",
              borderWidth: active ? 1 : 0,
              borderColor: t.border,
            }}
          >
            <Text
              style={{
                fontFamily: active ? t.fonts.bold : t.fonts.regular,
                fontSize: t.fs(14),
                color: active ? t.text : t.textMuted,
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SettingsPage() {
  const { theme: t, settings, setMode, setTextSize } = useSettings();
  const styles = useMemo(() => makeStyles(t), [t]);

  return (
    <>
      {!isWeb && <Stack.Screen options={{ ...makeHeaderOptions(t), title: "Paramètres" }} />}
      {isWeb && <WebBackButton title="Paramètres" />}
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.section}>Apparence</Text>
        <Segmented options={MODES} value={settings.mode} onChange={setMode} t={t} />

        <Text style={styles.section}>Taille du texte</Text>
        <Segmented options={SIZES} value={settings.textSize} onChange={setTextSize} t={t} />

        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Aperçu</Text>
          <Text style={styles.previewTitle}>Frieren</Text>
          <Text style={styles.previewMeta}>Épisode 14 / 28</Text>
        </View>
      </ScrollView>
    </>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.bg },
    content: { padding: 20, paddingBottom: 40 },
    section: {
      fontFamily: t.fonts.bold,
      fontSize: t.fs(16),
      color: t.text,
      marginTop: 20,
      marginBottom: 10,
    },
    preview: {
      marginTop: 24,
      padding: 16,
      borderRadius: t.radius.card,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    previewLabel: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted },
    previewTitle: { fontFamily: t.fonts.bold, fontSize: t.fs(18), color: t.text, marginTop: 6 },
    previewMeta: { fontFamily: t.fonts.regular, fontSize: t.fs(14), color: t.textMuted, marginTop: 2 },
  });
}