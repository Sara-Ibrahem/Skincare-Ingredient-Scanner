/**
 * Gallery Screen
 *
 * Opens the device photo library and lets the user pick an existing image
 * of a skincare label. On success, navigates to the Preview screen.
 *
 * Uses expo-image-picker (launchImageLibraryAsync) which is Expo Go compatible.
 * Handles permission states: loading, denied, not-asked, granted.
 */

import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function GalleryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [isLaunching, setIsLaunching] = useState(false);

  // expo-image-picker permission hook for the media library
  const [permission, requestPermission] =
    ImagePicker.useMediaLibraryPermissions();

  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 24;

  async function handleOpenGallery() {
    if (isLaunching) return;

    // Request permission if not yet granted
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Photo Library Access Required",
          "Please allow photo library access in Settings to pick an image.",
          [{ text: "OK" }]
        );
        return;
      }
    }

    setIsLaunching(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
        exif: false,
      });

      if (!result.canceled && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        // Navigate to preview screen with the picked image URI
        router.push({ pathname: "/preview", params: { uri: imageUri, source: "gallery" } });
      }
    } catch (error) {
      Alert.alert("Error", "Could not open the photo library. Please try again.");
    } finally {
      setIsLaunching(false);
    }
  }

  // ─── Permission states ────────────────────────────────────────────────────

  if (!permission) {
    return (
      <CenteredMessage colors={colors}>
        <ActivityIndicator color={colors.primary} size="large" />
      </CenteredMessage>
    );
  }

  if (!permission.granted && !permission.canAskAgain && Platform.OS !== "web") {
    return (
      <CenteredMessage colors={colors}>
        <Ionicons
          name="images-outline"
          size={56}
          color={colors.mutedForeground}
          style={{ marginBottom: 16 }}
        />
        <Text style={[styles.permissionTitle, { color: colors.foreground }]}>
          Photo Library Denied
        </Text>
        <Text style={[styles.permissionText, { color: colors.mutedForeground }]}>
          Open Settings and enable photo library access to continue.
        </Text>
      </CenteredMessage>
    );
  }

  // ─── Main UI ─────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Illustration area */}
      <View style={styles.illustrationArea}>
        <View
          style={[
            styles.galleryFrame,
            { backgroundColor: colors.muted, borderRadius: colors.radius + 4 },
          ]}
        >
          {/* Mock photo grid */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={[
                styles.mockPhoto,
                {
                  backgroundColor:
                    i === 2 ? colors.accent : colors.secondary,
                  borderRadius: 8,
                  borderWidth: i === 2 ? 2 : 0,
                  borderColor: colors.primary,
                },
              ]}
            >
              {i === 2 && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </View>
          ))}
        </View>

        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          Select a photo of a skincare label
        </Text>
      </View>

      {/* Tips card */}
      <View
        style={[
          styles.tipsCard,
          {
            backgroundColor: colors.card,
            borderRadius: colors.radius,
            borderColor: colors.border,
            marginHorizontal: 24,
          },
        ]}
      >
        <TipRow icon="zoom-in" text="Choose a close-up, focused photo" colors={colors} />
        <TipRow icon="type" text="Make sure text is clearly readable" colors={colors} />
        <TipRow icon="square" text="Good contrast improves OCR results" colors={colors} />
      </View>

      {/* Action button */}
      <View style={[styles.buttonContainer, { paddingBottom: bottomPadding }]}>
        <Pressable
          testID="btn-open-gallery"
          style={({ pressed }) => [
            styles.galleryButton,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius,
              opacity: pressed || isLaunching ? 0.8 : 1,
            },
          ]}
          onPress={handleOpenGallery}
          disabled={isLaunching}
        >
          {isLaunching ? (
            <ActivityIndicator color={colors.primaryForeground} size="small" />
          ) : (
            <>
              <Feather
                name="image"
                size={20}
                color={colors.primaryForeground}
                style={styles.buttonIcon}
              />
              <Text
                style={[
                  styles.galleryButtonText,
                  { color: colors.primaryForeground },
                ]}
              >
                {permission.granted ? "Browse Photos" : "Allow & Browse Photos"}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

type ColorTokens = ReturnType<typeof useColors>;

function CenteredMessage({
  colors,
  children,
}: {
  colors: ColorTokens;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.container,
        styles.centered,
        { backgroundColor: colors.background, padding: 32 },
      ]}
    >
      {children}
    </View>
  );
}

function TipRow({
  icon,
  text,
  colors,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  text: string;
  colors: ColorTokens;
}) {
  return (
    <View style={styles.tipRow}>
      <Feather name={icon} size={16} color={colors.primary} style={styles.tipIcon} />
      <Text style={[styles.tipText, { color: colors.foreground }]}>{text}</Text>
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
  },
  illustrationArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  galleryFrame: {
    width: 220,
    padding: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
    justifyContent: "center",
  },
  mockPhoto: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  tipsCard: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tipIcon: {
    marginRight: 10,
  },
  tipText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  galleryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    shadowColor: "#4a7c59",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 10,
  },
  galleryButtonText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  permissionTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
});
