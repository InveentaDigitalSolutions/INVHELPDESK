import { TicketPriority, ticketPriorityLabels, ticketPriorityColors } from "@shared/types";

interface PriorityBadgeProps {
    priority: TicketPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
    const solidColor = ticketPriorityColors[priority] ?? "#6B7280";

    return (
        <span
            className="badge"
            style={{
                backgroundColor: `${solidColor}14`,
                color: solidColor,
                padding: "3px 10px",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: 600,
                border: `1px solid ${solidColor}20`,
            }}
        >
            {ticketPriorityLabels[priority]}
        </span>
    );
}
