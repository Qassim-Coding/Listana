import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useMemo } from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import WebBackButton from "../src/components/WebBackButton";
import { Theme, makeHeaderOptions } from "../src/theme";
import { useTheme } from "../src/ThemeContext";

const isWeb = Platform.OS === "web";

// À remplir avec l'adresse de contact que tu veux rendre publique
const CONTACT_EMAIL = "";
const UPDATED = "octobre 2026";
const TMDB_PRIVACY_URL = "https://www.themoviedb.org/privacy-policy";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const SUMMARY: { icon: IconName; text: string }[] = [
  { icon: "phone-portrait-outline", text: "Tout reste sur ton appareil" },
  { icon: "person-remove-outline", text: "Pas de compte, pas de pub, pas de suivi" },
  { icon: "search-outline", text: "Seules tes recherches passent par TMDB" },
];

const SECTIONS: { icon: IconName; title: string; body: string[] }[] = [
  {
    icon: "server-outline",
    title: "Données et stockage",
    body: [
      "Tes titres, ta progression, tes notes, tes avis et tes réglages sont enregistrés uniquement dans la mémoire de ton appareil (ou de ton navigateur sur la version web).",
      "Listana n’a ni compte ni serveur : personne d’autre que toi n’y a accès. Supprimer un élément l’efface ; désinstaller l’app, ou vider les données du site sur le web, efface tout.",
    ],
  },
  {
    icon: "film-outline",
    title: "Recherche de films, séries et animés",
    body: [
      "Quand tu cherches une œuvre, le texte de ta recherche est envoyé à TMDB (The Movie Database) pour trouver les résultats, et les affiches sont chargées depuis leurs serveurs. Comme pour n’importe quel site, TMDB reçoit alors ton adresse IP.",
      "Rien d’autre n’est transmis : ni ta bibliothèque, ni tes notes, ni tes avis.",
      "This product uses the TMDB API but is not endorsed or certified by TMDB.",
    ],
  },
  {
    icon: "share-social-outline",
    title: "Partage",
    body: [
      "Le bouton Partager d’une liste n’envoie rien de lui-même : il ouvre le menu de partage de ton appareil, et c’est toi qui choisis l’app et le destinataire.",
    ],
  },
  {
    icon: "key-outline",
    title: "Permissions",
    body: [
      "Listana utilise uniquement l’accès à Internet, pour la recherche et les affiches. Pas de localisation, de contacts, de caméra ni de micro.",
    ],
  },
  {
    icon: "eye-off-outline",
    title: "Publicité et statistiques",
    body: [
      "Listana n’intègre aucun outil de publicité, de mesure d’audience ou de suivi.",
      "Si d’autres sources sont ajoutées plus tard (livres, mangas, jeux), cette page sera mise à jour avant.",
    ],
  },
];

export default function PrivacyPage() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);

  return (
    <>
      {!isWeb && <Stack.Screen options={{ ...makeHeaderOptions(t), title: "Confidentialité" }} />}
      {isWeb && <WebBackButton title="Confidentialité" />}
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.inner}>
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons name="shield-checkmark" size={30} color={t.onAccent} />
            </View>
            <Text style={styles.heroTitle}>Tes données restent chez toi</Text>
            <Text style={styles.heroText}>
              Listana est une app personnelle, sans compte et sans serveur. Voici exactement ce qui se passe avec tes données.
            </Text>
          </View>

          <View style={styles.summary}>
            {SUMMARY.map((s) => (
              <View key={s.text} style={styles.summaryRow}>
                <View style={styles.summaryIcon}>
                  <Ionicons name={s.icon} size={18} color={t.text} />
                </View>
                <Text style={styles.summaryText}>{s.text}</Text>
              </View>
            ))}
          </View>

          {SECTIONS.map((s) => (
            <View key={s.title} style={styles.card}>
              <View style={styles.cardHead}>
                <Ionicons name={s.icon} size={20} color={t.textMuted} />
                <Text style={styles.cardTitle}>{s.title}</Text>
              </View>
              {s.body.map((p, i) => (
                <Text key={i} style={[styles.cardText, p.startsWith("This product") && styles.notice]}>
                  {p}
                </Text>
              ))}
              {s.title.startsWith("Recherche") && (
                <Pressable
                  onPress={() => Linking.openURL(TMDB_PRIVACY_URL)}
                  accessibilityRole="link"
                  style={styles.linkBtn}
                >
                  <Text style={styles.linkText}>Politique de confidentialité de TMDB</Text>
                  <Ionicons name="open-outline" size={16} color={t.text} />
                </Pressable>
              )}
            </View>
          ))}

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Ionicons name="mail-outline" size={20} color={t.textMuted} />
              <Text style={styles.cardTitle}>Contact</Text>
            </View>
            {CONTACT_EMAIL ? (
              <Pressable
                onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
                accessibilityRole="link"
                style={styles.linkBtn}
              >
                <Text style={styles.linkText}>{CONTACT_EMAIL}</Text>
                <Ionicons name="open-outline" size={16} color={t.text} />
              </Pressable>
            ) : (
              <Text style={styles.cardText}>Pour toute question, passe par la page GitHub du projet.</Text>
            )}
          </View>

          <Text style={styles.updated}>Dernière mise à jour : {UPDATED}</Text>
        </View>
      </ScrollView>
    </>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.bg },
    content: { padding: 16, paddingBottom: 48 },
    inner: { width: "100%", maxWidth: 680, alignSelf: "center", gap: 12 },
    hero: {
      padding: 20,
      borderRadius: t.radius.card,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    heroIcon: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: t.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    heroTitle: { fontFamily: t.fonts.bold, fontSize: t.fs(24), lineHeight: t.fs(30), color: t.text, marginTop: 16 },
    heroText: { fontFamily: t.fonts.regular, fontSize: t.fs(14), lineHeight: t.fs(21), color: t.textMuted, marginTop: 6 },
    summary: {
      padding: 6,
      borderRadius: t.radius.card,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    summaryRow: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52, paddingHorizontal: 10 },
    summaryIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: t.cardAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    summaryText: { flex: 1, fontFamily: t.fonts.semibold, fontSize: t.fs(14), color: t.text },
    card: {
      padding: 18,
      borderRadius: t.radius.card,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    cardHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
    cardTitle: { flex: 1, fontFamily: t.fonts.bold, fontSize: t.fs(16), color: t.text },
    cardText: { fontFamily: t.fonts.regular, fontSize: t.fs(14), lineHeight: t.fs(21), color: t.textMuted, marginTop: 6 },
    notice: { fontSize: t.fs(12), fontStyle: "italic" },
    linkBtn: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 8,
      minHeight: 44,
      marginTop: 10,
      paddingHorizontal: 14,
      borderRadius: 22,
      backgroundColor: t.cardAlt,
    },
    linkText: { fontFamily: t.fonts.semibold, fontSize: t.fs(13), color: t.text },
    updated: { fontFamily: t.fonts.regular, fontSize: t.fs(12), color: t.textMuted, textAlign: "center", marginTop: 8 },
  });
}