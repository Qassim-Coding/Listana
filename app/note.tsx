import { Stack } from "expo-router";
import { Platform } from "react-native";
import WebBackButton from "../src/components/WebBackButton";
import NotesScreen from "../src/screens/NotesScreen";
import { makeHeaderOptions } from "../src/theme";
import { useTheme } from "../src/ThemeContext";

const isWeb = Platform.OS === "web";

export default function NotePage() {
  const t = useTheme();
  return (
    <>
      {!isWeb && <Stack.Screen options={{ ...makeHeaderOptions(t), title: "Bloc-notes" }} />}
      {isWeb && <WebBackButton title="Bloc-notes" />}
      <NotesScreen />
    </>
  );
}