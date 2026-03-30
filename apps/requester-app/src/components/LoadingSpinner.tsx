// ═══════════════════════════════════════════════════════════════
// LoadingSpinner – modern animated loader with pulse ring
// ═══════════════════════════════════════════════════════════════
import { theme } from "../theme";

export function LoadingSpinner({ message = "Cargando…" }: { message?: string }) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: theme.spacing.xxl,
                gap: "14px",
                color: theme.colors.textSecondary,
            }}
        >
            <div style={{ position: "relative", width: 40, height: 40 }}>
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        border: `3px solid ${theme.colors.borderLight}`,
                        borderTopColor: theme.colors.primary,
                        borderRadius: "50%",
                        animation: "spin 0.75s linear infinite",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        inset: "6px",
                        border: `2px solid transparent`,
                        borderBottomColor: theme.colors.secondary,
                        borderRadius: "50%",
                        animation: "spin 1.2s linear infinite reverse",
                    }}
                />
            </div>
            <span style={{ fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium }}>{message}</span>
        </div>
    );
}
