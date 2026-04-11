/**
 * Root layout — wires up all providers and defines the full navigation stack.
 * Pure Stack navigation — no bottom tabs.
 *
 * Stack screens:
 *   index    → Home screen (no header)
 *   camera   → Camera capture screen
 *   gallery  → Gallery picker screen
 *   preview  → Image preview screen
 *   results  → OCR results screen
 */

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useColors } from "@/hooks/useColors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.foreground,
        headerTitleStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 17,
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {/* Home screen — pure stack, no tabs */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Camera capture screen */}
      <Stack.Screen
        name="camera"
        options={{
          title: "Capture Label",
          headerBackTitle: "Home",
          presentation: "card",
        }}
      />

      {/* Gallery picker screen */}
      <Stack.Screen
        name="gallery"
        options={{
          title: "Choose from Gallery",
          headerBackTitle: "Home",
          presentation: "card",
        }}
      />

      {/* Image preview screen — shows selected/captured image */}
      <Stack.Screen
        name="preview"
        options={{
          title: "Preview",
          headerBackTitle: "Back",
          presentation: "card",
        }}
      />

      {/* Results screen — shows extracted ingredient text */}
      <Stack.Screen
        name="results"
        options={{
          title: "Ingredients",
          headerBackTitle: "Preview",
          presentation: "card",
        }}
      />

      {/* 404 fallback */}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
