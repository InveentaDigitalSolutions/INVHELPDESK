// ═══════════════════════════════════════════════════════════════
// HomeScreen – Modern requester landing page
// Hero gradient, glass stat cards, animated empty state
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header, TicketCard, LoadingSpinner } from "../components";
import type { TicketCardData } from "../components";
import { useAppContext } from "../hooks/useAppContext";
import { theme } from "../theme";
import { TicketStatus, TicketPriority } from "@shared/types";

// ── Dataverse service stub (mock data for development) ─────────
async function fetchRecentTickets(_userId: string): Promise<TicketCardData[]> {
    await new Promise((r) => setTimeout(r, 600));
    return MOCK_TICKETS.slice(0, 5);
}

const MOCK_TICKETS: TicketCardData[] = [
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
];

// ── SVG icons ──────────────────────────────────────────────────
const WrenchIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
);

const TicketOpenIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={theme.colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const EmptyIcon = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={theme.colors.textTertiary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
);

export function HomeScreen() {
    const { context, loading: ctxLoading } = useAppContext();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<TicketCardData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!context) return;
        fetchRecentTickets(context.user.objectId).then((t) => {
            setTickets(t);
            setLoading(false);
        });
    }, [context]);

    if (ctxLoading) return <LoadingSpinner message="Iniciando…" />;

    const firstName = context?.user.fullName.split(" ")[0] ?? "Usuario";

    const openCount = tickets.filter(
        (t) => t.status !== TicketStatus.Closed && t.status !== TicketStatus.Cancelled,
    ).length;
    const closedCount = tickets.length - openCount;

    return (
        <div className="page-wrapper">
            <Header title="Mesa de Ayuda" />

            {/* ── Hero greeting ──────────────────────────────── */}
            <section className="hero-section" style={{
                background: theme.gradients.primaryHero,
                padding: "28px 24px 36px",
                color: "#fff",
                position: "relative",
                overflow: "hidden",
            }}
            >
                {/* Decorative circle */}
                <div style={{
                    position: "absolute", right: -40, top: -40, width: 160, height: 160,
                    borderRadius: "50%", background: "rgba(255,255,255,0.06)",
                }} />
                <div style={{
                    position: "absolute", right: 40, bottom: -30, width: 80, height: 80,
                    borderRadius: "50%", background: "rgba(255,255,255,0.04)",
                }} />

                <h2 style={{
                    margin: 0,
                    fontSize: theme.fontSizes.xxl,
                    fontWeight: theme.fontWeights.bold,
                    letterSpacing: "-0.02em",
                }}>
                    Hola, {firstName}
                </h2>
                <p style={{
                    margin: "6px 0 0",
                    fontSize: theme.fontSizes.sm,
                    opacity: 0.85,
                    fontWeight: theme.fontWeights.normal,
                }}>
                    ¿Necesitas reportar un problema de mantenimiento?
                </p>

                {/* CTA button */}
                <button
                    className="hero-cta"
                    onClick={() => navigate("/create")}
                    style={{
                        marginTop: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        width: "100%",
                        padding: "14px",
                        fontSize: theme.fontSizes.md,
                        fontWeight: theme.fontWeights.semibold,
                        fontFamily: "inherit",
                        color: theme.colors.primary,
                        background: "#fff",
                        border: "none",
                        borderRadius: theme.borderRadius.lg,
                        cursor: "pointer",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                        transition: `transform ${theme.transitions.fast}, box-shadow ${theme.transitions.normal}`,
                    }}
                    onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
                    onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                    <WrenchIcon />
                    Crear Nuevo Ticket
                </button>
            </section>

            {/* ── Stats row ──────────────────────────────────── */}
            <section
                className="stats-grid"
                style={{
                    padding: "16px 20px 8px",
                    marginTop: "8px",
                }}
            >
                <StatCard
                    icon={<TicketOpenIcon />}
                    value={openCount}
                    label="Abiertos"
                    accentColor={theme.colors.primary}
                    ghost={theme.colors.primaryGhost}
                />
                <StatCard
                    icon={<CheckCircleIcon />}
                    value={closedCount}
                    label="Resueltos"
                    accentColor={theme.colors.success}
                    ghost={theme.colors.successGhost}
                />
            </section>

            {/* ── Recent tickets ──────────────────────────────── */}
            <section style={{ padding: "16px 20px 0" }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "14px",
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: theme.fontSizes.lg,
                        fontWeight: theme.fontWeights.semibold,
                        color: theme.colors.text,
                        letterSpacing: "-0.01em",
                    }}>
                        Tickets Recientes
                    </h3>
                    {tickets.length > 0 && (
                        <button
                            onClick={() => navigate("/tickets")}
                            style={{
                                background: "none",
                                border: "none",
                                color: theme.colors.primary,
                                fontSize: theme.fontSizes.sm,
                                fontWeight: theme.fontWeights.semibold,
                                cursor: "pointer",
                                fontFamily: "inherit",
                                padding: "4px 0",
                            }}
                        >
                            Ver todos →
                        </button>
                    )}
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : tickets.length === 0 ? (
                    <div
                        className="fade-in-up empty-state ui-surface-dashed"
                        style={{
                            textAlign: "center",
                            padding: "40px 20px",
                        }}
                    >
                        <EmptyIcon />
                        <p style={{
                            margin: "14px 0 4px",
                            fontSize: theme.fontSizes.md,
                            fontWeight: theme.fontWeights.semibold,
                            color: theme.colors.text,
                        }}>
                            Sin tickets aún
                        </p>
                        <p style={{
                            margin: 0,
                            fontSize: theme.fontSizes.sm,
                            color: theme.colors.textSecondary,
                        }}>
                            Crea tu primer ticket y da seguimiento en tiempo real.
                        </p>
                    </div>
                ) : (
                    <div className="ticket-list">
                        {tickets.map((t, i) => (
                            <div key={t.id} className="fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                                <TicketCard ticket={t} />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

// ── Stat card sub-component ────────────────────────────────────
function StatCard({ icon, value, label, accentColor, ghost }: {
    icon: React.ReactNode;
    value: number;
    label: string;
    accentColor: string;
    ghost: string;
}) {
    return (
        <div
            className="ui-surface"
            style={{
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
            }}
        >
            <div style={{
                width: 42,
                height: 42,
                borderRadius: theme.borderRadius.md,
                background: ghost,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                {icon}
            </div>
            <div>
                <div style={{
                    fontSize: theme.fontSizes.xxl,
                    fontWeight: theme.fontWeights.bold,
                    color: accentColor,
                    lineHeight: 1,
                }}>
                    {value}
                </div>
                <div style={{
                    fontSize: theme.fontSizes.xs,
                    color: theme.colors.textSecondary,
                    fontWeight: theme.fontWeights.medium,
                    marginTop: "2px",
                }}>
                    {label}
                </div>
            </div>
        </div>
    );
}
