// ═══════════════════════════════════════════════════════════════
// Requester App – Theme & Design Tokens  (Modern Design v2)
// Zamorano University CI colors
//   Primary green:  #00643E
//   Accent gold:    #C6992E
// ═══════════════════════════════════════════════════════════════

export const theme = {
    colors: {
        // Brand
        primary: "#00643E",
        primaryDark: "#004D2E",
        primaryLight: "#00875A",
        primaryGhost: "rgba(0,100,62,0.08)",
        secondary: "#C6992E",
        secondaryLight: "#DEBA5A",
        secondaryGhost: "rgba(198,153,46,0.10)",

        // Surface
        background: "#F4F6F9",
        surface: "#FFFFFF",
        surfaceElevated: "#FFFFFF",
        border: "#E8ECF0",
        borderLight: "#F0F2F5",

        // Semantic
        error: "#E5484D",
        errorGhost: "rgba(229,72,77,0.08)",
        warning: "#F5A623",
        warningGhost: "rgba(245,166,35,0.08)",
        success: "#30A46C",
        successGhost: "rgba(48,164,108,0.08)",
        info: "#0091FF",
        infoGhost: "rgba(0,145,255,0.08)",

        // Text
        text: "#1A1D21",
        textPrimary: "#1A1D21",
        textSecondary: "#6B7280",
        textTertiary: "#9CA3AF",
        textOnPrimary: "#FFFFFF",
    },

    fontSizes: {
        xs: "0.75rem",
        sm: "0.875rem",
        md: "1rem",
        lg: "1.125rem",
        xl: "1.375rem",
        xxl: "1.75rem",
        hero: "2.25rem",
    },

    fontWeights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },

    spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
    },

    borderRadius: {
        xs: "6px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        full: "999px",
    },

    shadows: {
        xs: "0 1px 2px rgba(0,0,0,0.04)",
        sm: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        md: "0 4px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)",
        lg: "0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
        xl: "0 16px 48px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.05)",
        glow: "0 0 0 3px rgba(0,100,62,0.15)",
        glowGold: "0 0 0 3px rgba(198,153,46,0.15)",
    },

    transitions: {
        fast: "120ms ease",
        normal: "200ms ease",
        smooth: "300ms cubic-bezier(0.4,0,0.2,1)",
        spring: "400ms cubic-bezier(0.34,1.56,0.64,1)",
    },

    gradients: {
        primaryHero: "linear-gradient(135deg, #00643E 0%, #00875A 100%)",
        primarySubtle: "linear-gradient(180deg, rgba(0,100,62,0.04) 0%, transparent 100%)",
        goldAccent: "linear-gradient(135deg, #C6992E 0%, #DEBA5A 100%)",
        surface: "linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)",
    },
} as const;
