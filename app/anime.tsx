import { Stack } from "expo-router";
import { Platform } from "react-native";
import WebBackButton from "../src/components/WebBackButton";
import AnimesScreen from "../src/screens/AnimesScreen";
import { makeHeaderOptions } from "../src/theme";
import { useTheme } from "../src/ThemeContext";

const isWeb = Platform.OS === "web";

export default function AnimesPage() {
  const t = useTheme();
  return (
    <>
      {!isWeb && (
        <Stack.Screen options={{ ...makeHeaderOptions(t), title: "Animés" }} />
      )}
      {isWeb && <WebBackButton title="Animés" />}
      <AnimesScreen />
    </>
  );
}