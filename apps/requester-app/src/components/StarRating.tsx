// ═══════════════════════════════════════════════════════════════
// StarRating – modern interactive 5-star selector
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { theme } from "../theme";

interface StarRatingProps {
    value: number;
    onChange: (v: number) => void;
    label?: string;
    max?: number;
}

export function StarRating({ value, onChange, label, max = 5 }: StarRatingProps) {
    const [hovered, setHovered] = useState(0);

    return (
        <div className="ui-surface" style={{
            marginBottom: theme.spacing.lg,
            padding: "16px",
        }}>
            {label && (
                <label
                    style={{
                        display: "block",
                        marginBottom: "10px",
                        fontSize: theme.fontSizes.sm,
                        fontWeight: theme.fontWeights.semibold,
                        color: theme.colors.text,
                    }}
                >
                    {label}
                </label>
            )}
            <div style={{ display: "flex", gap: "6px" }}>
                {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
                    const filled = star <= (hovered || value);
                    return (
                        <button
                            key={star}
                            type="button"
                            onClick={() => onChange(star)}
                            onMouseEnter={() => setHovered(star)}
                            onMouseLeave={() => setHovered(0)}
                            aria-label={`${star} estrellas`}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: 32,
                                lineHeight: 1,
                                padding: "4px",
                                color: filled ? theme.colors.secondary : theme.colors.border,
                                transition: `color ${theme.transitions.fast}, transform 250ms cubic-bezier(0.34,1.56,0.64,1)`,
                                transform: filled ? "scale(1.2)" : "scale(1)",
                                filter: filled ? "drop-shadow(0 2px 4px rgba(198,153,46,0.35))" : "none",
                            }}
                        >
                            ★
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
