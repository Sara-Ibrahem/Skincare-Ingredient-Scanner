/**
 * Results Screen
 *
 * PRIMARY OCR:  Google ML Kit (react-native-mlkit-ocr) — on-device, offline
 * FALLBACK OCR: Tesseract.js — used if ML Kit is unavailable
 */

import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
const ingredientsData: Record<string, string> = require("../assets/ingredients.json");
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

// ─── OCR: ML Kit (primary) ────────────────────────────────────────────────────
let MlkitOcr: any = null;
try {
  MlkitOcr = require("react-native-mlkit-ocr").default;
} catch {
  // Native module not available — will fall back to Tesseract
}
const INGREDIENT_CORRECTIONS: Record<string, string> = {
  "GLYOOL": "GLYCOL",
  "TETRASOORUM": "TETRASODIUM",
  "AQUA": "WATER",
  "HYALURONATE": "HYALURONIC ACID",
  "EXTRACTL": "EXTRACT",
};

// JSON dosyasını import et (dosya yoluna dikkat)

function cleanAndCorrect(text: string): string {
  let cleaned = text.toUpperCase().trim();
  
  // 1. Önce tam eşleşme kontrolü (En güvenlisi)
  if (ingredientsData[cleaned] !== undefined) {
    return ingredientsData[cleaned];
  }

  // 2. Parçalı eşleşme kontrolü (AQUAAQUAEAU gibi durumlar için)
  for (const key of Object.keys(ingredientsData)) {
    if (cleaned.includes(key) && key.length > 3) {
      // Eğer JSON'daki değer boşsa (""), bu bir çöp kelimedir
      if (ingredientsData[key] === "") return "";
      return ingredientsData[key];
    }
  }

  return cleaned;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type OcrEngine = "mlkit" | "tesseract" | null;
type OcrStatus = "idle" | "loading" | "success" | "error";

interface OcrState {
  status: OcrStatus;
  ingredients: string[];
  rawText: string | null;
  engine: OcrEngine;
  error: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseIngredients(rawText: string): string[] {
  const lower = rawText.toLowerCase();
  const startKeywords = ["ingredients:", "içindekiler:", "inci:", "ingredients :"];
  
  let startIdx = -1;
  for (const kw of startKeywords) {
    const idx = lower.indexOf(kw);
    if (idx !== -1) {
      startIdx = idx + kw.length;
      break;
    }
  }

  // Eğer anahtar kelime yoksa metnin başından başla ama gürültü riskini unutma
  let section = startIdx !== -1 ? rawText.slice(startIdx) : rawText;

  // Durdurma anahtar kelimeleri (Warnings, Directions vb. sızmasın diye)
 // Genişletilmiş durdurma kelimeleri (Bozuk OCR okumalarını da yakalar)
const stopKeywords = [
    "produced by", "warning", "direction", "how to use", "uyarı", "dist. by", "kullanım",
    "external use", "forexternal", "children", "reach out", "veep out", "keep out", "rash", "naturally-derived"
  ];

  let endIdx = section.length;
  for (const kw of stopKeywords) {
    const idx = section.toLowerCase().indexOf(kw);
    if (idx !== -1 && idx < endIdx) endIdx = idx;
  }

  const oneLineSection = section.slice(0, endIdx).replace(/\n/g, ", ");

  return oneLineSection
    .split(/,|•|;|\*/)
    .map(s => cleanAndCorrect(s.replace(/[^a-zA-ZÀ-ÿ0-9\s\-(). ]/g, "")))
    .filter(s => {
      const isHeaderGarbage = s.includes("AQUA") && oneLineSection.toLowerCase().indexOf("ingredients") < 10;
      return s.length > 2 && !isHeaderGarbage && !/^\d+$/.test(s) && s !== "DELETE_ME";
    })
    .slice(0, 50);
}
async function runMlKitOcr(uri: string): Promise<string> {
  if (!MlkitOcr) throw new Error("ML Kit not available");
  const result = await MlkitOcr.detectFromUri(uri);
  return result.map((b: { text: string }) => b.text).join("\n");
}

async function runTesseractOcr(uri: string): Promise<string> {
  const Tesseract = await import("tesseract.js");
  const { data } = await Tesseract.recognize(uri, "eng+tur", { logger: () => {} });
  return data.text;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ResultsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom + 24;

  const [ocr, setOcr] = useState<OcrState>({
    status: "idle",
    ingredients: [],
    rawText: null,
    engine: null,
    error: null,
  });

  useEffect(() => { if (uri) runOcr(uri); }, [uri]);

  async function runOcr(imageUri: string) {
    setOcr({ status: "loading", ingredients: [], rawText: null, engine: null, error: null });

    // 1️⃣ ML Kit (primary)
    if (MlkitOcr) {
      try {
        const text = await runMlKitOcr(imageUri);
        setOcr({ status: "success", ingredients: parseIngredients(text), rawText: text, engine: "mlkit", error: null });
        return;
      } catch (e) {
        console.warn("[OCR] ML Kit failed, trying Tesseract:", e);
      }
    }

    // 2️⃣ Tesseract.js (fallback)
    try {
      const text = await runTesseractOcr(imageUri);
      setOcr({ status: "success", ingredients: parseIngredients(text), rawText: text, engine: "tesseract", error: null });
    } catch (e) {
      setOcr({ status: "error", ingredients: [], rawText: null, engine: null, error: "OCR failed. Please try again with a clearer image." });
    }
  }

  function handleScanAgain() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.dismissAll();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Thumbnail */}
        {uri && (
          <View style={[styles.thumbnailContainer, { backgroundColor: colors.muted, borderRadius: colors.radius, borderColor: colors.border }]}>
            <Image source={{ uri }} style={styles.thumbnail} contentFit="cover" transition={200} />
            <View style={[styles.thumbnailOverlay, { backgroundColor: colors.foreground + "99" }]}>
              <Ionicons name="scan-outline" size={20} color="#fff" />
              <Text style={styles.thumbnailLabel}>Scanned Image</Text>
            </View>
          </View>
        )}

        {/* OCR Area */}
        {ocr.status === "idle" || ocr.status === "loading" ? (
          <OcrLoadingCard colors={colors} />
        ) : ocr.status === "error" ? (
          <OcrErrorCard colors={colors} error={ocr.error!} onRetry={() => uri && runOcr(uri)} />
        ) : (
          <OcrResultCard colors={colors} ingredients={ocr.ingredients} rawText={ocr.rawText!} engine={ocr.engine!} />
        )}

        {/* Info card */}
        {ocr.status !== "success" && (
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]}>What happens next?</Text>
            <InfoRow icon="cpu" text="OCR engine scans the label for text" colors={colors} />
            <InfoRow icon="list" text="Ingredients are extracted and parsed" colors={colors} />
            <InfoRow icon="alert-circle" text="Allergens and harmful compounds are flagged" colors={colors} />
            <InfoRow icon="star" text="Each ingredient is rated for safety" colors={colors} />
          </View>
        )}

        {/* Scan again */}
        <Pressable
          testID="btn-scan-again"
          style={({ pressed }) => [styles.scanAgainButton, { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.85 : 1 }]}
          onPress={handleScanAgain}
        >
          <Feather name="refresh-cw" size={18} color={colors.primaryForeground} style={{ marginRight: 8 }} />
          <Text style={[styles.scanAgainText, { color: colors.primaryForeground }]}>Scan Another Product</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
type ColorTokens = ReturnType<typeof useColors>;

function OcrLoadingCard({ colors }: { colors: ColorTokens }) {
  return (
    <View style={[styles.ocrCard, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.primary + "55", borderStyle: "dashed" }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.accent }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
      <Text style={[styles.ocrHeading, { color: colors.foreground }]}>Extracting Ingredients</Text>
      <Text style={[styles.ocrDesc, { color: colors.mutedForeground }]}>Scanning with Google ML Kit OCR...</Text>
    </View>
  );
}

function OcrErrorCard({ colors, error, onRetry }: { colors: ColorTokens; error: string; onRetry: () => void }) {
  return (
    <View style={[styles.ocrCard, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.destructive + "55", borderStyle: "dashed" }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.accent }]}>
        <Ionicons name="alert-circle-outline" size={32} color={colors.destructive} />
      </View>
      <Text style={[styles.ocrHeading, { color: colors.foreground }]}>Extraction Failed</Text>
      <Text style={[styles.ocrDesc, { color: colors.mutedForeground }]}>{error}</Text>
      <Pressable
        style={({ pressed }) => [styles.retryBtn, { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 }]}
        onPress={onRetry}
      >
        <Feather name="refresh-cw" size={15} color={colors.primaryForeground} style={{ marginRight: 6 }} />
        <Text style={[styles.retryBtnText, { color: colors.primaryForeground }]}>Try Again</Text>
      </Pressable>
    </View>
  );
}

function OcrResultCard({ colors, ingredients, rawText, engine }: { colors: ColorTokens; ingredients: string[]; rawText: string; engine: OcrEngine }) {
  const [showRaw, setShowRaw] = useState(false);
  const engineLabel = engine === "mlkit" ? "Google ML Kit" : "Tesseract.js (Fallback)";

  return (
    <View style={[styles.ocrCard, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.primary + "88" }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.accent }]}>
        <Ionicons name="checkmark-circle-outline" size={32} color={colors.primary} />
      </View>
      <Text style={[styles.ocrHeading, { color: colors.foreground }]}>Ingredients Found</Text>
      <View style={[styles.engineBadge, { backgroundColor: colors.accent }]}>
        <Feather name="cpu" size={11} color={colors.primary} style={{ marginRight: 4 }} />
        <Text style={[styles.engineBadgeText, { color: colors.primary }]}>{engineLabel}</Text>
      </View>

      {ingredients.length > 0 ? (
        <View style={styles.ingredientList}>
          {ingredients.map((item, idx) => (
            <View key={idx} style={[styles.ingredientRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.ingredientText, { color: colors.foreground }]}>{item}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.ocrDesc, { color: colors.mutedForeground }]}>No ingredient list detected. Try a clearer image.</Text>
      )}

      <Pressable style={styles.rawToggle} onPress={() => setShowRaw(v => !v)}>
        <Feather name={showRaw ? "chevron-up" : "chevron-down"} size={14} color={colors.mutedForeground} style={{ marginRight: 4 }} />
        <Text style={[styles.rawToggleText, { color: colors.mutedForeground }]}>{showRaw ? "Hide raw text" : "Show raw OCR text"}</Text>
      </Pressable>
      {showRaw && (
        <View style={[styles.rawBox, { backgroundColor: colors.muted, borderRadius: colors.radius / 2 }]}>
          <Text style={[styles.rawText, { color: colors.mutedForeground }]}>{rawText}</Text>
        </View>
      )}
    </View>
  );
}

function InfoRow({ icon, text, colors }: { icon: React.ComponentProps<typeof Feather>["name"]; text: string; colors: ColorTokens }) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconWrap, { backgroundColor: colors.accent }]}>
        <Feather name={icon} size={14} color={colors.primary} />
      </View>
      <Text style={[styles.infoText, { color: colors.foreground }]}>{text}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  thumbnailContainer: { height: 180, borderWidth: 1, overflow: "hidden", position: "relative", elevation: 2 },
  thumbnail: { width: "100%", height: "100%" },
  thumbnailOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8, gap: 6 },
  thumbnailLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#fff" },
  ocrCard: { borderWidth: 2, padding: 24, alignItems: "center", elevation: 2 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  ocrHeading: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 8, textAlign: "center" },
  ocrDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  engineBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 12 },
  engineBadgeText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  ingredientList: { width: "100%", marginTop: 4 },
  ingredientRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 7, marginRight: 10, flexShrink: 0 },
  ingredientText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 20 },
  rawToggle: { flexDirection: "row", alignItems: "center", marginTop: 16, paddingVertical: 4 },
  rawToggleText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  rawBox: { width: "100%", padding: 12, marginTop: 8 },
  rawText: { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },
  retryBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 20, marginTop: 16 },
  retryBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  infoCard: { borderWidth: 1, padding: 16, elevation: 2 },
  infoTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  infoIconWrap: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 10 },
  infoText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  scanAgainButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, elevation: 4 },
  scanAgainText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
