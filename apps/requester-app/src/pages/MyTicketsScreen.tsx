// ═══════════════════════════════════════════════════════════════
// MyTicketsScreen – modern filterable ticket list with search
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { Header, TicketCard, LoadingSpinner } from "../components";
import type { TicketCardData } from "../components";
import { useAppContext } from "../hooks/useAppContext";
import { theme } from "../theme";
import { TicketStatus, TicketPriority } from "@shared/types";

// ── Dataverse service stub (mock data for development) ─────────
async function fetchMyTickets(_userId: string): Promise<TicketCardData[]> {
    await new Promise((r) => setTimeout(r, 500));
    return MOCK_ALL_TICKETS;
}

const MOCK_ALL_TICKETS: TicketCardData[] = [
    {
        id: "t-001",
        ticketNumber: "TK-2026-001",
        title: "Fuga de agua en baño planta baja, Edificio Académico",
        status: TicketStatus.InProgress,
        priority: TicketPriority.High,
        createdOn: "2026-02-28T14:30:00Z",
        location: "Edificio Académico",
        category: "Plomería",
    },
    {
        id: "t-002",
        ticketNumber: "TK-2026-002",
        title: "Aire acondicionado no funciona en Sala de Conferencias B",
        status: TicketStatus.Assigned,
        priority: TicketPriority.Medium,
        createdOn: "2026-02-27T09:15:00Z",
        location: "Centro de Conferencias",
        category: "HVAC",
    },
    {
        id: "t-003",
        ticketNumber: "TK-2026-003",
        title: "Luminarias fundidas en pasillo segundo piso",
        status: TicketStatus.New,
        priority: TicketPriority.Low,
        createdOn: "2026-03-01T08:00:00Z",
        location: "Residencias Estudiantiles",
        category: "Electricidad",
    },
    {
        id: "t-004",
        ticketNumber: "TK-2026-004",
        title: "Puerta principal de laboratorio no cierra correctamente",
        status: TicketStatus.Closed,
        priority: TicketPriority.Medium,
        createdOn: "2026-02-20T10:45:00Z",
        location: "Laboratorio de Ciencias",
        category: "Cerrajería",
    },
    {
        id: "t-005",
        ticketNumber: "TK-2026-005",
        title: "Goteras en techo de cafetería",
        status: TicketStatus.OnHold,
        priority: TicketPriority.Critical,
        createdOn: "2026-02-25T16:20:00Z",
        location: "Cafetería Central",
        category: "Obra Civil",
    },
    {
        id: "t-006",
        ticketNumber: "TK-2026-006",
        title: "Piso roto en entrada principal",
        status: TicketStatus.Resolved,
        priority: TicketPriority.Low,
        createdOn: "2026-02-15T11:00:00Z",
        location: "Edificio Administrativo",
        category: "Obra Civil",
    },
    {
        id: "t-007",
        ticketNumber: "TK-2026-007",
        title: "Corto circuito en tomacorriente oficina 204",
        status: TicketStatus.InDiagnosis,
        priority: TicketPriority.High,
        createdOn: "2026-03-01T13:45:00Z",
        location: "Edificio Administrativo",
        category: "Electricidad",
    },
];

// ── Filter options ─────────────────────────────────────────────
type FilterKey = "all" | "open" | "closed";

const filterLabels: Record<FilterKey, string> = {
    all: "Todos",
    open: "Abiertos",
    closed: "Cerrados",
};

function matchesFilter(status: TicketStatus, filter: FilterKey): boolean {
    if (filter === "all") return true;
    if (filter === "open")
        return status !== TicketStatus.Closed && status !== TicketStatus.Cancelled;
    return status === TicketStatus.Closed || status === TicketStatus.Cancelled;
}

// ── SVG icons ──────────────────────────────────────────────────
const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.colors.textTertiary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const EmptySearchIcon = () => (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={theme.colors.textTertiary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="8" y1="8" x2="14" y2="14" /><line x1="14" y1="8" x2="8" y2="14" />
    </svg>
);

export function MyTicketsScreen() {
    const { context } = useAppContext();
    const [tickets, setTickets] = useState<TicketCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterKey>("all");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!context) return;
        fetchMyTickets(context.user.objectId).then((t) => {
            setTickets(t);
            setLoading(false);
        });
    }, [context]);

    const filtered = tickets.filter((t) => {
        if (!matchesFilter(t.status, filter)) return false;
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            return (
                t.title.toLowerCase().includes(q) ||
                t.ticketNumber.toLowerCase().includes(q) ||
                (t.category ?? "").toLowerCase().includes(q)
            );
        }
        return true;
    });

    return (
        <div className="page-wrapper">
            <Header title="Mis Tickets" />
            <h2 className="desktop-page-title">Mis Tickets</h2>

            {/* Search + filters */}
            <section style={{ padding: "20px 20px 12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* Search input with icon */}
                <div style={{ position: "relative" }}>
                    <div style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                        display: "flex",
                    }}>
                        <SearchIcon />
                    </div>
                    <input
                        type="search"
                        placeholder="Buscar por título, número o categoría…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "12px 14px 12px 42px",
                            fontSize: theme.fontSizes.sm,
                            fontFamily: "inherit",
                            border: `1.5px solid ${theme.colors.border}`,
                            borderRadius: theme.borderRadius.lg,
                            background: theme.colors.surface,
                            color: theme.colors.text,
                            boxSizing: "border-box",
                            transition: `border-color ${theme.transitions.normal}, box-shadow ${theme.transitions.normal}`,
                            outline: "none",
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = theme.colors.primary;
                            e.currentTarget.style.boxShadow = theme.shadows.glow;
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = theme.colors.border;
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    />
                </div>

                {/* Filter chips */}
                <div className="filter-chips" style={{ display: "flex", gap: "8px" }}>
                    {(Object.keys(filterLabels) as FilterKey[]).map((key) => {
                        const active = filter === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                style={{
                                    flex: 1,
                                    padding: "8px 12px",
                                    fontSize: theme.fontSizes.xs,
                                    fontWeight: active ? theme.fontWeights.semibold : theme.fontWeights.medium,
                                    fontFamily: "inherit",
                                    background: active ? theme.colors.primaryGhost : "transparent",
                                    color: active ? theme.colors.primary : theme.colors.textSecondary,
                                    border: active ? `1.5px solid ${theme.colors.primary}30` : `1.5px solid ${theme.colors.border}`,
                                    borderRadius: theme.borderRadius.full,
                                    cursor: "pointer",
                                    transition: `all ${theme.transitions.normal}`,
                                }}
                            >
                                {filterLabels[key]}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Ticket list */}
            <section style={{ padding: "0 20px" }}>
                {loading ? (
                    <LoadingSpinner />
                ) : filtered.length === 0 ? (
                    <div
                        className="fade-in-up empty-state ui-surface-dashed"
                        style={{
                            textAlign: "center",
                            padding: "48px 20px",
                        }}
                    >
                        <EmptySearchIcon />
                        <p style={{
                            margin: "16px 0 4px",
                            fontSize: theme.fontSizes.md,
                            fontWeight: theme.fontWeights.semibold,
                            color: theme.colors.text,
                        }}>
                            {tickets.length === 0 ? "Sin tickets registrados" : "Sin resultados"}
                        </p>
                        <p style={{
                            margin: 0,
                            fontSize: theme.fontSizes.sm,
                            color: theme.colors.textSecondary,
                        }}>
                            {tickets.length === 0
                                ? "Crea tu primer ticket desde la pantalla de inicio."
                                : "Intenta cambiar el filtro o la búsqueda."}
                        </p>
                    </div>
                ) : (
                    <div className="ticket-list">
                        {filtered.map((t, i) => (
                            <div key={t.id} className="fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                                <TicketCard ticket={t} />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Count pill */}
            {!loading && tickets.length > 0 && (
                <div
                    style={{
                        textAlign: "center",
                        fontSize: theme.fontSizes.xs,
                        color: theme.colors.textTertiary,
                        fontWeight: theme.fontWeights.medium,
                        padding: "16px",
                    }}
                >
                    Mostrando {filtered.length} de {tickets.length} tickets
                </div>
            )}
        </div>
    );
}
