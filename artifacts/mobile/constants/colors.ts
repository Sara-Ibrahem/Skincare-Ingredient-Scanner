/**
 * Design tokens for SkinScan - Skincare Ingredient Extractor
 *
 * A clean, health-inspired palette using sage green as the primary brand color
 * against crisp white surfaces — approachable, trustworthy, and modern.
 *
 * All components should import colors via the useColors() hook:
 *   import { useColors } from '@/hooks/useColors';
 */

const colors = {
  light: {
    // Legacy aliases
    text: "#1a2e1a",
    tint: "#4a7c59",

    // Core surfaces
    background: "#f8faf8",
    foreground: "#1a2e1a",

    // Cards / elevated surfaces
    card: "#ffffff",
    cardForeground: "#1a2e1a",

    // Primary brand color (sage green)
    primary: "#4a7c59",
    primaryForeground: "#ffffff",

    // Secondary / less-emphasis surfaces
    secondary: "#e8f0ea",
    secondaryForeground: "#2d4a35",

    // Muted / subdued elements
    muted: "#f0f4f0",
    mutedForeground: "#7a9280",

    // Accent highlights (warm teal)
    accent: "#d4ede0",
    accentForeground: "#2d5a3d",

    // Destructive actions
    destructive: "#d94f4f",
    destructiveForeground: "#ffffff",

    // Borders and input outlines
    border: "#dde8de",
    input: "#dde8de",
  },

  // Border radius in px — rounded but not pill-shaped
  radius: 14,
};

export default colors;
