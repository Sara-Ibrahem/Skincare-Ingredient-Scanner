/**
 * Preview Screen
 *
 * Displays the captured / selected image in full before the user proceeds
 * to the OCR extraction step.
 *
 * Receives the image URI via router params (uri: string, source: "camera" | "gallery").
 * The user can:
 *   - Go back and retake/reselect the image
 *   - Proceed to the Results screen to trigger extraction
 *
 * Note: OCR is NOT implemented yet. The "Extract Ingredients" button navigates
 * to the Results screen with the URI so it can be processed later.
 */

import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type ImageSource = "camera" | "gallery";

export default function PreviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  // Route params from camera or gallery screens
  const { uri, source } = useLocalSearchParams<{ uri: string; source: ImageSource }>();

  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 24;

  function handleExtract() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Pass the URI to the results screen — OCR will run from there
    router.push({ pathname: "/results", params: { uri } });
  }

  function handleRetake() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }

  // If no URI was provided (e.g. deep-link without params), show an error state
  if (!uri) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={56} color={colors.destructive} />
        <Text style={[styles.errorTitle, { color: colors.foreground }]}>
          No image provided
        </Text>
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          Please go back and capture or select an image.
        </Text>
        <Pressable
          style={[
            styles.backButton,
            { backgroundColor: colors.secondary, borderRadius: colors.radius },
          ]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: colors.secondaryForeground }]}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Source badge */}
      <View style={styles.badgeRow}>
        <View
          style={[
            styles.sourceBadge,
            { backgroundColor: colors.accent, borderRadius: 20 },
          ]}
        >
          <Feather
            name={source === "camera" ? "camera" : "image"}
            size={13}
            color={colors.accentForeground}
            style={{ marginRight: 5 }}
          />
          <Text style={[styles.badgeText, { color: colors.accentForeground }]}>
            {source === "camera" ? "Captured from Camera" : "Selected from Gallery"}
          </Text>
        </View>
      </View>

      {/* Image preview — fills most of the screen */}
      <View
        style={[
          styles.imageContainer,
          {
            backgroundColor: colors.muted,
            borderRadius: colors.radius + 2,
            borderColor: colors.border,
          },
        ]}
      >
        <Image
          source={{ uri }}
          style={styles.previewImage}
          contentFit="contain"
          transition={300}
          testID="preview-image"
        />
      </View>

      {/* Instruction text */}
      <Text style={[styles.instructionText, { color: colors.mutedForeground }]}>
        Review the image. Ensure the ingredients list is visible and in focus before
        proceeding.
      </Text>

      {/* Action buttons */}
      <View
        style={[styles.buttonRow, { paddingBottom: bottomPadding, paddingHorizontal: 24 }]}
      >
        {/* Retake / Re-select */}
        <Pressable
          testID="btn-retake"
          style={({ pressed }) => [
            styles.retakeButton,
            {
              backgroundColor: colors.secondary,
              borderRadius: colors.radius,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
              flex: 1,
              marginRight: 10,
            },
          ]}
          onPress={handleRetake}
        >
          <Feather
            name="arrow-left"
            size={18}
            color={colors.secondaryForeground}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.retakeButtonText, { color: colors.secondaryForeground }]}>
            Retake
          </Text>
        </Pressable>

        {/* Extract ingredients */}
        <Pressable
          testID="btn-extract"
          style={({ pressed }) => [
            styles.extractButton,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius,
              opacity: pressed ? 0.85 : 1,
              flex: 2,
            },
          ]}
          onPress={handleExtract}
        >
          <Feather
            name="search"
            size={18}
            color={colors.primaryForeground}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.extractButtonText, { color: colors.primaryForeground }]}>
            Extract Ingredients
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  badgeRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: "row",
  },
  sourceBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  imageContainer: {
    marginHorizontal: 20,
    flex: 1,
    borderWidth: 1,
    overflow: "hidden",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  previewImage: {
    flex: 1,
    width: "100%",
  },
  instructionText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18,
    marginHorizontal: 28,
    marginTop: 14,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 0,
  },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderWidth: 1,
  },
  retakeButtonText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  extractButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    shadowColor: "#4a7c59",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  extractButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
});
