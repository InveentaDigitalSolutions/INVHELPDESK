// ═══════════════════════════════════════════════════════════════
// PriorityBadge – modern soft-color pill for priority
// ═══════════════════════════════════════════════════════════════
import { theme } from "../theme";
import { TicketPriority, ticketPriorityLabels, ticketPriorityColors } from "@shared/types";

interface PriorityBadgeProps {
    priority: TicketPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
    const solidColor = ticketPriorityColors[priority] ?? theme.colors.textSecondary;
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
            {ticketPriorityLabels[priority]}
        </span>
    );
}
