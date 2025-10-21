import { router } from "expo-router";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";
import MediaGrid from "../src/components/MediaGrid";
import { MEDIA } from "../src/constants/media";

export default function Home() {
  const onPick = (type: string) => {
    const m = MEDIA.find((x) => x.key === type);
    if (m) {
      router.push(`/${m.key}`);
    } else {
      console.warn(`Type inconnu : ${type}`);
    }
  };

  const items = MEDIA.map((x) => (x.key === "note" ? { ...x, label: "Bloc-Notes,etc." } : x));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Listana</Text>
        <Text style={styles.subtitle}>
          Suivez vos différents médias, sans jamais vous perdre ! 🤓
        </Text>

        {/* Grille des médias */}
        <MediaGrid items={items} onPick={onPick} />
        <Text onPress={() => router.push('/privacy')} style={styles.linkText}>Confidentialité</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    color: "#12AAB8",
    letterSpacing: 0.5,
    marginBottom: 24,
    fontFamily: "Poppins_700Bold",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#0E5A90",
    marginBottom: 28,
    fontStyle: "italic",
    fontFamily: "Poppins_400Regular",
  },
  linkText: {
    color: "#0E5A90",
    textDecorationLine: "underline",
    textAlign: "center",
    marginTop: 16,
    fontFamily: "Poppins_400Regular",
  },
});
