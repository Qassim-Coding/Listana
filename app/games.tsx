import { Stack } from "expo-router";
import { Platform } from "react-native";
import WebBackButton from "../src/components/WebBackButton";
import GamesScreen from "../src/screens/GamesScreen";

const isWeb = Platform.OS === 'web';

export default function GamesPage() {
  return (
    <>
      {!isWeb && (
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Jeux vidéo",
            headerTintColor: "#12AAB8",
            headerTitleStyle: {
              fontFamily: "Poppins_700Bold",
              fontSize: 22,
              color: "#111827",
            },
          }}
        />
      )}
      {isWeb && <WebBackButton title="Jeux vidéo" />}
      <GamesScreen />
    </>
  );
}
