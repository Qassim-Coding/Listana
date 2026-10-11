import { Stack } from "expo-router";
import { Platform } from "react-native";
import WebBackButton from "../src/components/WebBackButton";
import TVShowsScreen from "../src/screens/TVShowsScreen";
import { makeHeaderOptions } from "../src/theme";
import { useTheme } from "../src/ThemeContext";

const isWeb = Platform.OS === "web";

export default function TVShowsPage() {
  const t = useTheme();
  return (
    <>
      {!isWeb && (
        <Stack.Screen options={{ ...makeHeaderOptions(t), title: "Séries TV" }} />
      )}
      {isWeb && <WebBackButton title="Séries TV" />}
      <TVShowsScreen />
    </>
  );
}