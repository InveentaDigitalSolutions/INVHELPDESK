// ═══════════════════════════════════════════════════════════════
// StatusBadge – modern soft-color pill for ticket status
// ═══════════════════════════════════════════════════════════════
import { theme } from "../theme";
import { TicketStatus, ticketStatusLabels, ticketStatusColors } from "@shared/types";

interface StatusBadgeProps {
    status: TicketStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const solidColor = ticketStatusColors[status] ?? theme.colors.textSecondary;
    return (
        <span
            className="badge"
            style={{
                backgroundColor: `${solidColor}14`,
                color: solidColor,
                padding: "3px 10px",
                borderRadius: theme.borderRadius.full,
                fontSize: theme.fontSizes.xs,
                fontWeight: theme.fontWeights.semibold,
                border: `1px solid ${solidColor}20`,
            }}
        >
            {ticketStatusLabels[status]}
        </span>
    );
}
