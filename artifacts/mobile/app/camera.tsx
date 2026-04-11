/**
 * Camera Screen
 *
 * Opens the device camera and lets the user capture a photo of a skincare
 * product label. On success, navigates to the Preview screen.
 *
 * Uses expo-image-picker (launchCameraAsync) which is Expo Go compatible.
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

export default function CameraScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [isLaunching, setIsLaunching] = useState(false);

  // expo-image-picker permission hook for the camera
  const [permission, requestPermission] =
    ImagePicker.useCameraPermissions();

  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 24;

  async function handleOpenCamera() {
    if (isLaunching) return;

    // If permission hasn't been requested yet, request it
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please allow camera access in Settings to capture a photo.",
          [{ text: "OK" }]
        );
        return;
      }
    }

    setIsLaunching(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: true,        // Lets the user crop
        aspect: [4, 3],             // Landscape crop — suits product labels
        quality: 0.9,               // High quality for OCR accuracy
        exif: false,
      });

      if (!result.canceled && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        // Navigate to the preview screen, passing the image URI
        router.push({ pathname: "/preview", params: { uri: imageUri, source: "camera" } });
      }
    } catch (error) {
      Alert.alert("Error", "Could not open the camera. Please try again.");
    } finally {
      setIsLaunching(false);
    }
  }

  // ─── Permission states ────────────────────────────────────────────────────

  // Still loading permission status
  if (!permission) {
    return (
      <CenteredMessage colors={colors}>
        <ActivityIndicator color={colors.primary} size="large" />
      </CenteredMessage>
    );
  }

  // Permission denied and cannot ask again → show Settings button (native only)
  if (!permission.granted && !permission.canAskAgain && Platform.OS !== "web") {
    return (
      <CenteredMessage colors={colors}>
        <Ionicons
          name="camera-off-outline"
          size={56}
          color={colors.mutedForeground}
          style={{ marginBottom: 16 }}
        />
        <Text style={[styles.permissionTitle, { color: colors.foreground }]}>
          Camera Access Denied
        </Text>
        <Text style={[styles.permissionText, { color: colors.mutedForeground }]}>
          Open Settings and enable camera access to continue.
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
            styles.viewfinder,
            {
              borderColor: colors.primary,
              borderRadius: colors.radius,
            },
          ]}
        >
          {/* Corner decorators */}
          <CornerDecor position="topLeft" color={colors.primary} />
          <CornerDecor position="topRight" color={colors.primary} />
          <CornerDecor position="bottomLeft" color={colors.primary} />
          <CornerDecor position="bottomRight" color={colors.primary} />

          <Ionicons
            name="camera-outline"
            size={72}
            color={colors.mutedForeground}
          />
        </View>

        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          Aim the camera at the ingredients label
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
        <TipRow icon="sun" text="Good lighting improves accuracy" colors={colors} />
        <TipRow icon="maximize" text="Keep label flat and centered" colors={colors} />
        <TipRow icon="zoom-in" text="Hold steady for a sharp image" colors={colors} />
      </View>

      {/* Action button */}
      <View style={[styles.buttonContainer, { paddingBottom: bottomPadding }]}>
        <Pressable
          testID="btn-launch-camera"
          style={({ pressed }) => [
            styles.captureButton,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius,
              opacity: pressed || isLaunching ? 0.8 : 1,
            },
          ]}
          onPress={handleOpenCamera}
          disabled={isLaunching}
        >
          {isLaunching ? (
            <ActivityIndicator color={colors.primaryForeground} size="small" />
          ) : (
            <>
              <Feather
                name="camera"
                size={20}
                color={colors.primaryForeground}
                style={styles.buttonIcon}
              />
              <Text
                style={[
                  styles.captureButtonText,
                  { color: colors.primaryForeground },
                ]}
              >
                {permission.granted ? "Open Camera" : "Allow & Open Camera"}
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

type CornerPosition = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

function CornerDecor({
  position,
  color,
}: {
  position: CornerPosition;
  color: string;
}) {
  const posStyle: Record<CornerPosition, object> = {
    topLeft: { top: 8, left: 8, borderTopWidth: 3, borderLeftWidth: 3 },
    topRight: { top: 8, right: 8, borderTopWidth: 3, borderRightWidth: 3 },
    bottomLeft: { bottom: 8, left: 8, borderBottomWidth: 3, borderLeftWidth: 3 },
    bottomRight: { bottom: 8, right: 8, borderBottomWidth: 3, borderRightWidth: 3 },
  };

  return (
    <View
      style={[
        styles.corner,
        posStyle[position],
        { borderColor: color },
      ]}
    />
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
  viewfinder: {
    width: 220,
    height: 165,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
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
    // Shadow
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
  captureButton: {
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
  captureButtonText: {
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
