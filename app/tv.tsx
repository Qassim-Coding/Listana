import { Stack } from "expo-router";
import TVShowsScreen from "../src/screens/TVShowsScreen";

export default function TVPage() {
  return (
    <>
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
      <TVShowsScreen />
    </>
  );
}
