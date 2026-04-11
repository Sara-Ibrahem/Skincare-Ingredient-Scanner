/**
 * Home Screen
 *
 * Entry point of the SkinScan app.
 * Displays the app logo, title, a brief description, and two action buttons:
 *   1. "Use Camera" → navigates to the camera capture screen
 *   2. "Open Gallery" → navigates to the gallery picker screen
 *
 * Navigation is pure Stack — no bottom tabs.
 */

import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();

  function handleCamera() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/camera");
  }

  function handleGallery() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/gallery");
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Background gradient for atmosphere */}
      <LinearGradient
        colors={[colors.accent, colors.background]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App logo — PNG image, no vector icons needed */}
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Title & subtitle */}
        <Text style={[styles.title, { color: colors.foreground }]}>
          SkinScan
        </Text>
        <Text style={[styles.subtitle, { color: colors.primary }]}>
          Ingredient Extractor
        </Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>
          Capture or upload a photo of a skincare product label to automatically
          extract and display its ingredients.
        </Text>

        {/* Step guide */}
        <View
          style={[
            styles.stepsCard,
            {
              backgroundColor: colors.card,
              borderRadius: colors.radius,
              borderColor: colors.border,
            },
          ]}
        >
          <StepRow
            number="1"
            icon="camera"
            label="Capture the label"
            colors={colors}
          />
          <Divider colors={colors} />
          <StepRow
            number="2"
            icon="eye"
            label="Preview & confirm"
            colors={colors}
          />
          <Divider colors={colors} />
          <StepRow
            number="3"
            icon="list"
            label="View extracted ingredients"
            colors={colors}
          />
        </View>

        {/* Primary CTA — Camera */}
        <Pressable
          testID="btn-camera"
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={handleCamera}
        >
          <Feather
            name="camera"
            size={20}
            color={colors.primaryForeground}
            style={styles.buttonIcon}
          />
          <Text
            style={[styles.primaryButtonText, { color: colors.primaryForeground }]}
          >
            Use Camera
          </Text>
        </Pressable>

        {/* Secondary CTA — Gallery */}
        <Pressable
          testID="btn-gallery"
          style={({ pressed }) => [
            styles.secondaryButton,
            {
              backgroundColor: colors.secondary,
              borderRadius: colors.radius,
              borderColor: colors.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={handleGallery}
        >
          <Feather
            name="image"
            size={20}
            color={colors.secondaryForeground}
            style={styles.buttonIcon}
          />
          <Text
            style={[
              styles.secondaryButtonText,
              { color: colors.secondaryForeground },
            ]}
          >
            Choose from Gallery
          </Text>
        </Pressable>

        {/* Footer note */}
        <Text style={[styles.footerNote, { color: colors.mutedForeground }]}>
          No data is stored or uploaded. Everything stays on your device.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

type ColorTokens = ReturnType<typeof useColors>;

function StepRow({
  number,
  icon,
  label,
  colors,
}: {
  number: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  colors: ColorTokens;
}) {
  return (
    <View style={styles.stepRow}>
      <View
        style={[
          styles.stepBadge,
          { backgroundColor: colors.accent },
        ]}
      >
        <Text style={[styles.stepNumber, { color: colors.accentForeground }]}>
          {number}
        </Text>
      </View>
      <Feather
        name={icon}
        size={18}
        color={colors.primary}
        style={styles.stepIcon}
      />
      <Text style={[styles.stepLabel, { color: colors.foreground }]}>
        {label}
      </Text>
    </View>
  );
}

function Divider({ colors }: { colors: ColorTokens }) {
  return (
    <View style={[styles.divider, { backgroundColor: colors.border }]} />
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: "center",
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  stepsCard: {
    width: "100%",
    borderWidth: 1,
    padding: 4,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  stepNumber: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  stepIcon: {
    marginRight: 10,
  },
  stepLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: "#4a7c59",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 10,
  },
  primaryButtonText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  footerNote: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18,
  },
});
