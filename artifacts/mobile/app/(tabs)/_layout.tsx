/**
 * Tab layout — SkinScan only has a single "Home" tab.
 * We use a tabs shell so the scaffold structure is preserved,
 * but navigation to camera / gallery / preview / results
 * happens via Stack screens (defined in _layout.tsx).
 *
 * NativeTabs / SF Symbols / expo-glass-effect are intentionally omitted:
 * SF Symbols are blank on Android and on iOS below iOS 26, so we always
 * use ClassicTabLayout with AntDesign icons which render reliably on all
 * platforms in Expo Go.
 */

import { AntDesign } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.foreground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 4,
          height: isWeb ? 84 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 4,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.card },
              ]}
            />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <AntDesign name="home" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
