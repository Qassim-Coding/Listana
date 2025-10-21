import { Stack } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text } from "react-native";
import WebBackButton from "../src/components/WebBackButton";

const isWeb = Platform.OS === 'web';

export default function PrivacyPage() {
  return (
    <>
      {!isWeb && (
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Confidentialité",
            headerTintColor: "#12AAB8",
            headerTitleStyle: {
              fontFamily: "Poppins_700Bold",
              fontSize: 22,
              color: "#111827",
            },
          }}
        />
      )}
      {isWeb && <WebBackButton title="Confidentialité" />}
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Listana – Politique de confidentialité</Text>
        <Text style={styles.p}>
          Listana enregistre localement vos médias (titres, notes, progression). Aucune donnée n’est
          envoyée à un serveur sans action explicite de votre part.
        </Text>
        <Text style={styles.h2}>Données et stockage</Text>
        <Text style={styles.p}>
          Vos données sont stockées sur votre appareil. Si vous supprimez un élément dans l’app ou
          désinstallez l’app, les données locales correspondantes sont supprimées.
        </Text>
        <Text style={styles.h2}>Tiers et intégrations</Text>
        <Text style={styles.p}>
          À l’avenir, des APIs (cinéma, jeux vidéo, manga/animé, podcasts) pourront enrichir vos fiches
          (affiches, métadonnées). Aucune information personnelle ne sera transmise à ces services.
        </Text>
        <Text style={styles.h2}>Permissions</Text>
        <Text style={styles.p}>
          L’accès réseau peut être utilisé pour récupérer des métadonnées (optionnel). Aucune autre
          permission sensible n’est requise.
        </Text>
        <Text style={styles.h2}>Contact</Text>
        <Text style={styles.p}>Pour toute question : contact@example.com</Text>
        <Text style={[styles.p, { color: "#6B7280" }]}>Dernière mise à jour : 01/2025</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10 },
  title: { fontSize: 20, fontWeight: "700", color: "#111827" },
  h2: { fontSize: 16, fontWeight: "600", color: "#111827", marginTop: 8 },
  p: { fontSize: 14, color: "#374151" },
});
