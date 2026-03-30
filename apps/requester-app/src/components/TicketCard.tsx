// ═══════════════════════════════════════════════════════════════
// TicketCard – modern elevated card for ticket list items
// ═══════════════════════════════════════════════════════════════
import { useNavigate } from "react-router-dom";
import { theme } from "../theme";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import type { TicketPriority, TicketStatus } from "@shared/types";

export interface TicketCardData {
    id: string;
    ticketNumber: string;
    title: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdOn: string;
    location?: string;
    category?: string;
}

interface TicketCardProps {
    ticket: TicketCardData;
}

const ChevronRight = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

export function TicketCard({ ticket }: TicketCardProps) {
    const navigate = useNavigate();

    const dateStr = new Date(ticket.createdOn).toLocaleDateString("es-HN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    return (
        <button
            className="ticket-card ui-surface interactive-surface"
            onClick={() => navigate(`/tickets/${ticket.id}`)}
            style={{
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                fontFamily: "inherit",
            }}
        >
            {/* Row 1 – Number + badges */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                    fontSize: theme.fontSizes.xs,
                    color: theme.colors.textTertiary,
                    fontWeight: theme.fontWeights.medium,
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                }}>
                    #{ticket.ticketNumber}
                </span>
                <div style={{ display: "flex", gap: "6px" }}>
                    <PriorityBadge priority={ticket.priority} />
                    <StatusBadge status={ticket.status} />
                </div>
            </div>

            {/* Row 2 – Title */}
            <span style={{
                fontSize: theme.fontSizes.md,
                fontWeight: theme.fontWeights.semibold,
                color: theme.colors.text,
                lineHeight: 1.3,
            }}>
                {ticket.title}
            </span>

            {/* Row 3 – Meta */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: theme.fontSizes.xs,
                    color: theme.colors.textSecondary,
                }}
            >
                <div style={{ display: "flex", gap: "12px" }}>
                    {ticket.category && <span>{ticket.category}</span>}
                    {ticket.location && (
                        <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                            {ticket.location}
                        </span>
                    )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span>{dateStr}</span>
                    <ChevronRight />
                </div>
            </div>
        </button>
    );
}
