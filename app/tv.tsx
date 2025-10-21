import { Stack } from "expo-router";
import { Platform } from "react-native";
import WebBackButton from "../src/components/WebBackButton";
import TVShowsScreen from "../src/screens/TVShowsScreen";

const isWeb = Platform.OS === 'web';

export default function TVPage() {
  return (
    <>
      {!isWeb && (
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Séries TV",
            headerTintColor: "#12AAB8",
            headerTitleStyle: {
              fontFamily: "Poppins_700Bold",
              fontSize: 22,
              color: "#111827",
            },
          }}
        />
      )}
      {isWeb && <WebBackButton title="Séries TV" />}
      <TVShowsScreen />
    </>
  );
}
