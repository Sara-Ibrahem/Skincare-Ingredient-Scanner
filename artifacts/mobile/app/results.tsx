/**
 * Results Screen
 *
 * Displays the extracted ingredient text from the scanned image.
 *
 * Currently a PLACEHOLDER — OCR is not implemented yet.
 * When OCR integration is added:
 *   1. Call the OCR service with the `uri` param
 *   2. Parse and display the returned text
 *   3. Optionally look up each ingredient in a skincare database
 *
 * The screen receives the image URI via router params and
 * shows a clear "coming soon" state alongside a thumbnail of the scanned image.
 */

import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function ResultsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const { uri } = useLocalSearchParams<{ uri: string }>();

  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 24;

  function handleScanAgain() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Pop back to the home screen
    router.dismissAll();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Scanned image thumbnail */}
        {uri ? (
          <View
            style={[
              styles.thumbnailContainer,
              {
                backgroundColor: colors.muted,
                borderRadius: colors.radius,
                borderColor: colors.border,
              },
            ]}
          >
            <Image
              source={{ uri }}
              style={styles.thumbnail}
              contentFit="cover"
              transition={200}
              testID="results-thumbnail"
            />
            <View
              style={[
                styles.thumbnailOverlay,
                { backgroundColor: colors.foreground + "99" },
              ]}
            >
              <Ionicons name="scan-outline" size={20} color="#fff" />
              <Text style={styles.thumbnailLabel}>Scanned Image</Text>
            </View>
          </View>
        ) : null}

        {/* OCR placeholder — replace with real results once OCR is integrated */}
        <OCRPlaceholder colors={colors} />

        {/* What comes next — informational section */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.card,
              borderRadius: colors.radius,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>
            What happens next?
          </Text>

          <InfoRow
            icon="cpu"
            text="OCR engine scans the label for text"
            colors={colors}
          />
          <InfoRow
            icon="list"
            text="Ingredients are extracted and parsed"
            colors={colors}
          />
          <InfoRow
            icon="alert-circle"
            text="Allergens and harmful compounds are flagged"
            colors={colors}
          />
          <InfoRow
            icon="star"
            text="Each ingredient is rated for safety"
            colors={colors}
          />
        </View>

        {/* Scan again button */}
        <Pressable
          testID="btn-scan-again"
          style={({ pressed }) => [
            styles.scanAgainButton,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={handleScanAgain}
        >
          <Feather
            name="refresh-cw"
            size={18}
            color={colors.primaryForeground}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.scanAgainText, { color: colors.primaryForeground }]}>
            Scan Another Product
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

type ColorTokens = ReturnType<typeof useColors>;

/**
 * Placeholder block shown where real OCR results will eventually appear.
 * Replace this component with actual parsed ingredient list once OCR is integrated.
 */
function OCRPlaceholder({ colors }: { colors: ColorTokens }) {
  return (
    <View
      style={[
        styles.ocrPlaceholder,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.primary + "55",
          borderStyle: "dashed",
        },
      ]}
    >
      {/* Icon */}
      <View
        style={[
          styles.ocrIconCircle,
          { backgroundColor: colors.accent },
        ]}
      >
        <Ionicons name="text-outline" size={32} color={colors.primary} />
      </View>

      <Text style={[styles.ocrHeading, { color: colors.foreground }]}>
        OCR Extraction
      </Text>
      <Text style={[styles.ocrSubheading, { color: colors.primary }]}>
        Coming Soon
      </Text>
      <Text style={[styles.ocrDescription, { color: colors.mutedForeground }]}>
        The ingredient extraction module will automatically read and parse the
        text from your scanned label. The results will appear here once
        implemented.
      </Text>

      {/* Skeleton ingredient lines — to visualise future output */}
      <View style={styles.skeletonContainer}>
        {[80, 60, 95, 70, 55].map((width, i) => (
          <View
            key={i}
            style={[
              styles.skeletonLine,
              {
                width: `${width}%` as any,
                backgroundColor: colors.muted,
                borderRadius: 4,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  text,
  colors,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  text: string;
  colors: ColorTokens;
}) {
  return (
    <View style={styles.infoRow}>
      <View
        style={[styles.infoIconWrap, { backgroundColor: colors.accent }]}
      >
        <Feather name={icon} size={14} color={colors.primary} />
      </View>
      <Text style={[styles.infoText, { color: colors.foreground }]}>{text}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  thumbnailContainer: {
    height: 180,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 6,
  },
  thumbnailLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },

  // OCR placeholder
  ocrPlaceholder: {
    borderWidth: 2,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  ocrIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  ocrHeading: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
    textAlign: "center",
  },
  ocrSubheading: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  ocrDescription: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  skeletonContainer: {
    width: "100%",
    gap: 8,
    alignItems: "flex-start",
  },
  skeletonLine: {
    height: 12,
  },

  // Info card
  infoCard: {
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  infoText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },

  // Scan again
  scanAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    shadowColor: "#4a7c59",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  scanAgainText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
