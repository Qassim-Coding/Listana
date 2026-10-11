import { Stack } from "expo-router";
import { Platform } from "react-native";
import WebBackButton from "../src/components/WebBackButton";
import GamesScreen from "../src/screens/GamesScreen";
import { makeHeaderOptions } from "../src/theme";
import { useTheme } from "../src/ThemeContext";

const isWeb = Platform.OS === "web";

export default function GamesPage() {
  const t = useTheme();
  return (
    <>
      {!isWeb && (
        <Stack.Screen options={{ ...makeHeaderOptions(t), title: "Jeux vidéo" }} />
      )}
      {isWeb && <WebBackButton title="Jeux vidéo" />}
      <GamesScreen />
    </>
  );
}