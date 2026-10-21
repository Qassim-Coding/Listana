import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import MediaGrid from "../src/components/MediaGrid";
import ResumeSection from "../src/components/ResumeSection";
import { MEDIA } from "../src/constants/media";
import { useResumeItems } from "../src/hooks/useResumeItems";
import { Theme } from "../src/theme";
import { useTheme } from "../src/ThemeContext";

const isWeb = Platform.OS === "web";

export default function Home() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { items: resumeItems, stats, loading } = useResumeItems();

  const onPick = (type: string) => {
    const m = MEDIA.find((x) => x.key === type);
    if (m) {
      router.push(`/${m.key}`);
    } else {
      console.warn(`Type inconnu : ${type}`);
    }
  };

  const items = MEDIA.map((x) => (x.key === "note" ? { ...x, label: "Bloc-Notes,etc." } : x));
  const summary = `${stats.inProgress} en cours · ${stats.done} terminé${stats.done > 1 ? "s" : ""}`;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: isDesktop ? 48 : 20,
            paddingTop: isDesktop ? 48 : 28,
            maxWidth: isDesktop ? 1100 : undefined,
            alignSelf: isDesktop ? "center" : undefined,
            width: isDesktop ? "100%" : undefined,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>Listana</Text>
            <Text style={[styles.title, { fontSize: t.fs(isDesktop ? 40 : 30) }]}>Ma bibliothèque</Text>
            <Text style={styles.summary}>{loading ? " " : summary}</Text>
          </View>
          <Pressable
            onPress={() => router.push("/settings")}
            accessibilityRole="button"
            accessibilityLabel="Paramètres"
            style={styles.iconBtn}
          >
            <Ionicons name="settings-outline" size={22} color={t.text} />
          </Pressable>
        </View>

        {!loading && <ResumeSection items={resumeItems} total={stats.inProgress} />}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Catégories</Text>
          <Text style={styles.sectionMeta}>{items.length} médias</Text>
        </View>

        <MediaGrid items={items} counts={loading ? undefined : stats.counts} onPick={onPick} />

        <Text onPress={() => router.push("/privacy")} style={styles.linkText}>
          Confidentialité
        </Text>
        <Text style={styles.version}>Listana V2.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    scrollView: { flex: 1 },
    container: { paddingBottom: 32 },
    topRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    kicker: { fontFamily: t.fonts.regular, fontSize: t.fs(13), color: t.textMuted },
    title: { fontFamily: t.fonts.bold, color: t.text, letterSpacing: -0.5 },
    summary: { fontFamily: t.fonts.semibold, fontSize: t.fs(13), color: t.textMuted, marginTop: 2 },
    iconBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginTop: 28,
      marginBottom: 12,
    },
    sectionTitle: { fontFamily: t.fonts.bold, fontSize: t.fs(18), color: t.text },
    sectionMeta: { fontFamily: t.fonts.regular, fontSize: t.fs(13), color: t.textMuted },
    linkText: {
      marginTop: 24,
      fontSize: t.fs(13),
      color: t.textMuted,
      textDecorationLine: "underline",
      textAlign: "center",
      fontFamily: t.fonts.regular,
      // @ts-ignore - web-only
      cursor: isWeb ? "pointer" : undefined,
    },
    version: {
      marginTop: 8,
      fontSize: t.fs(12),
      color: t.textMuted,
      textAlign: "center",
      fontFamily: t.fonts.regular,
    },
  });
}