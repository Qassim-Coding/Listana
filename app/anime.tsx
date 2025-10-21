import { Stack } from "expo-router";
import { Platform } from "react-native";
import WebBackButton from "../src/components/WebBackButton";
import AnimesScreen from "../src/screens/AnimesScreen";

const isWeb = Platform.OS === 'web';

export default function AnimesPage() {
  return (
    <>
      {!isWeb && (
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Animés",
            headerTintColor: "#12AAB8",
            headerTitleStyle: {
              fontFamily: "Poppins_700Bold",
              fontSize: 22,
              color: "#111827",
            },
          }}
        />
      )}
      {isWeb && <WebBackButton title="Animés" />}
      <AnimesScreen />
    </>
  );
}
