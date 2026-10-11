import { Stack } from "expo-router";
import { Platform } from "react-native";
import WebBackButton from "../src/components/WebBackButton";
import MangasScreen from "../src/screens/MangasScreen";
import { makeHeaderOptions } from "../src/theme";
import { useTheme } from "../src/ThemeContext";

const isWeb = Platform.OS === "web";

export default function MangaPage() {
  const t = useTheme();
  return (
    <>
      {!isWeb && (
        <Stack.Screen options={{ ...makeHeaderOptions(t), title: "Mangas" }} />
      )}
      {isWeb && <WebBackButton title="Mangas" />}
      <MangasScreen />
    </>
  );
}