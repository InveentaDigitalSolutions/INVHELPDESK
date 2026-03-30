import { TicketStatus, ticketStatusLabels, ticketStatusColors } from "@shared/types";

interface StatusBadgeProps {
    status: TicketStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const solidColor = ticketStatusColors[status] ?? "#6B7280";

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
            {ticketStatusLabels[status]}
        </span>
    );
}
