import { router } from "expo-router";
import React from "react";
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions } from "react-native";
import MediaGrid from "../src/components/MediaGrid";
import { MEDIA } from "../src/constants/media";

const isWeb = Platform.OS === 'web';

export default function Home() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; // Tablette/Desktop

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
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: isDesktop ? 48 : 24,
            paddingTop: isDesktop ? 48 : 32,
            paddingBottom: isDesktop ? 48 : 32,
            maxWidth: isDesktop ? 1400 : undefined,
            alignSelf: isDesktop ? 'center' : undefined,
            width: isDesktop ? '100%' : undefined,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { 
          fontSize: isDesktop ? 40 : 32,
          marginBottom: isDesktop ? 32 : 24,
        }]}>Listana</Text>
        <Text style={[styles.subtitle, {
          fontSize: isDesktop ? 18 : 16,
          marginBottom: isDesktop ? 40 : 28,
        }]}>
          Suivez vos différents médias, sans jamais vous perdre ! 🤓
        </Text>

        {/* Grille des médias */}
        <MediaGrid items={items} onPick={onPick} />
        <Text onPress={() => router.push('/privacy')} style={[styles.linkText, {
          marginTop: isDesktop ? 24 : 16,
          fontSize: isDesktop ? 15 : 14,
        }]}>Confidentialité</Text>
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
    // Styles dynamiques déplacés dans le JSX
  },
  title: {
    fontWeight: "800",
    textAlign: "center",
    color: "#12AAB8",
    letterSpacing: 0.5,
    fontFamily: "Poppins_700Bold",
  },
  subtitle: {
    textAlign: "center",
    color: "#0E5A90",
    fontStyle: "italic",
    fontFamily: "Poppins_400Regular",
  },
  linkText: {
    color: "#0E5A90",
    textDecorationLine: "underline",
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
    // @ts-ignore - web-only
    cursor: isWeb ? 'pointer' : undefined,
  },
});
