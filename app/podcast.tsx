import { Stack } from "expo-router";
import { Platform } from "react-native";
import WebBackButton from "../src/components/WebBackButton";
import PodcastsScreen from "../src/screens/PodcastsScreen";
import { makeHeaderOptions } from "../src/theme";
import { useTheme } from "../src/ThemeContext";

const isWeb = Platform.OS === "web";

export default function PodcastPage() {
  const t = useTheme();
  return (
    <>
      {!isWeb && (
        <Stack.Screen options={{ ...makeHeaderOptions(t), title: "Podcasts & livres audio" }} />
      )}
      {isWeb && <WebBackButton title="Podcasts & livres audio" />}
      <PodcastsScreen />
    </>
  );
}