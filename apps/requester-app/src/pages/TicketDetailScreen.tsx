// ═══════════════════════════════════════════════════════════════
// TicketDetailScreen – modern detail view with glass card,
// timeline, status badge, and action buttons
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header, StatusBadge, PriorityBadge, LoadingSpinner } from "../components";
import { theme } from "../theme";
import { TicketStatus, TicketPriority } from "@shared/types";

// ── Dataverse service stub ─────────────────────────────────────
interface TicketDetail {
    id: string;
    ticketNumber: string;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdOn: string;
    modifiedOn: string;
    categoryName: string;
    subcategoryName?: string;
    locationName: string;
    assignedTechnicianName?: string;
    eta?: string;
    onHoldReason?: string;
    resolutionNotes?: string;
    closedOn?: string;
    surveyCompleted: boolean;
}

interface TimelineEvent {
    id: string;
    date: string;
    type: "status_change" | "assignment" | "comment" | "material" | "work_order";
    description: string;
    actor?: string;
}

const MOCK_TICKETS: Record<string, TicketDetail> = {
    "t-001": {
        id: "t-001",
        ticketNumber: "TK-2026-001",
        title: "Fuga de agua en baño planta baja, Edificio Académico",
        description: "Se detectó una fuga de agua significativa debajo del lavamanos del baño de hombres en la planta baja del Edificio Académico. El agua se está acumulando en el piso y puede representar un riesgo de resbalones.",
        status: TicketStatus.InProgress,
        priority: TicketPriority.High,
        createdOn: "2026-02-28T14:30:00Z",
        modifiedOn: "2026-03-01T10:00:00Z",
        categoryName: "Plomería",
        subcategoryName: "Fugas",
        locationName: "Edificio Académico – Planta Baja",
        assignedTechnicianName: "Carlos Méndez",
        eta: "2026-03-02T16:00:00Z",
        surveyCompleted: false,
    },
    "t-002": {
        id: "t-002",
        ticketNumber: "TK-2026-002",
        title: "Aire acondicionado no funciona en Sala de Conferencias B",
        description: "El sistema de aire acondicionado de la Sala de Conferencias B no enciende. La temperatura interior es elevada y afecta las actividades programadas.",
        status: TicketStatus.Assigned,
        priority: TicketPriority.Medium,
        createdOn: "2026-02-27T09:15:00Z",
        modifiedOn: "2026-02-28T08:00:00Z",
        categoryName: "HVAC",
        subcategoryName: "Aire Acondicionado",
        locationName: "Centro de Conferencias – Sala B",
        assignedTechnicianName: "María López",
        surveyCompleted: false,
    },
    "t-003": {
        id: "t-003",
        ticketNumber: "TK-2026-003",
        title: "Luminarias fundidas en pasillo segundo piso",
        description: "Tres luminarias del pasillo principal del segundo piso de Residencias Estudiantiles están fundidas, dejando el área con poca iluminación durante la noche.",
        status: TicketStatus.New,
        priority: TicketPriority.Low,
        createdOn: "2026-03-01T08:00:00Z",
        modifiedOn: "2026-03-01T08:00:00Z",
        categoryName: "Electricidad",
        subcategoryName: "Iluminación",
        locationName: "Residencias Estudiantiles – 2do Piso",
        surveyCompleted: false,
    },
    "t-004": {
        id: "t-004",
        ticketNumber: "TK-2026-004",
        title: "Puerta principal de laboratorio no cierra correctamente",
        description: "La puerta principal del Laboratorio de Ciencias no cierra completamente, lo que compromete la seguridad del equipo. El mecanismo de la cerradura parece dañado.",
        status: TicketStatus.Closed,
        priority: TicketPriority.Medium,
        createdOn: "2026-02-20T10:45:00Z",
        modifiedOn: "2026-02-24T15:30:00Z",
        categoryName: "Cerrajería",
        locationName: "Laboratorio de Ciencias",
        assignedTechnicianName: "José Ramírez",
        resolutionNotes: "Se reemplazó el mecanismo de la cerradura y se ajustaron las bisagras. Puerta funciona correctamente.",
        closedOn: "2026-02-24T15:30:00Z",
        surveyCompleted: false,
    },
    "t-005": {
        id: "t-005",
        ticketNumber: "TK-2026-005",
        title: "Goteras en techo de cafetería",
        description: "Se observan múltiples goteras en el techo de la cafetería central durante las lluvias. El agua cae directamente sobre el área de mesas y puede dañar el mobiliario.",
        status: TicketStatus.OnHold,
        priority: TicketPriority.Critical,
        createdOn: "2026-02-25T16:20:00Z",
        modifiedOn: "2026-02-28T09:00:00Z",
        categoryName: "Obra Civil",
        subcategoryName: "Techos",
        locationName: "Cafetería Central",
        assignedTechnicianName: "Carlos Méndez",
        onHoldReason: "Esperando materiales de impermeabilización. Proveedor confirma entrega para el 3 de marzo.",
        surveyCompleted: false,
    },
};

const MOCK_TIMELINES: Record<string, TimelineEvent[]> = {
    "t-001": [
        { id: "e1", date: "2026-02-28T14:30:00Z", type: "status_change", description: "Ticket creado – Estado: Nuevo", actor: "Solicitante" },
        { id: "e2", date: "2026-02-28T16:00:00Z", type: "assignment", description: "Asignado a Carlos Méndez", actor: "Supervisor" },
        { id: "e3", date: "2026-03-01T08:30:00Z", type: "status_change", description: "Estado cambiado a: En Progreso", actor: "Carlos Méndez" },
        { id: "e4", date: "2026-03-01T09:00:00Z", type: "comment", description: "Técnico: Tubería identificada, se procede a reparar", actor: "Carlos Méndez" },
        { id: "e5", date: "2026-03-01T09:30:00Z", type: "material", description: "Material solicitado: Tubería PVC 1/2\"", actor: "Carlos Méndez" },
    ],
    "t-004": [
        { id: "e1", date: "2026-02-20T10:45:00Z", type: "status_change", description: "Ticket creado – Estado: Nuevo", actor: "Solicitante" },
        { id: "e2", date: "2026-02-20T14:00:00Z", type: "assignment", description: "Asignado a José Ramírez", actor: "Supervisor" },
        { id: "e3", date: "2026-02-21T08:00:00Z", type: "status_change", description: "Estado cambiado a: En Diagnóstico", actor: "José Ramírez" },
        { id: "e4", date: "2026-02-22T10:00:00Z", type: "work_order", description: "Orden de trabajo generada: Reemplazo de cerradura", actor: "José Ramírez" },
        { id: "e5", date: "2026-02-24T14:00:00Z", type: "status_change", description: "Estado cambiado a: Resuelto", actor: "José Ramírez" },
        { id: "e6", date: "2026-02-24T15:30:00Z", type: "status_change", description: "Ticket cerrado", actor: "Sistema" },
    ],
    "t-005": [
        { id: "e1", date: "2026-02-25T16:20:00Z", type: "status_change", description: "Ticket creado – Estado: Nuevo", actor: "Solicitante" },
        { id: "e2", date: "2026-02-26T08:00:00Z", type: "assignment", description: "Asignado a Carlos Méndez", actor: "Supervisor" },
        { id: "e3", date: "2026-02-27T10:00:00Z", type: "status_change", description: "Estado cambiado a: En Diagnóstico", actor: "Carlos Méndez" },
        { id: "e4", date: "2026-02-28T09:00:00Z", type: "status_change", description: "Estado cambiado a: En Espera", actor: "Carlos Méndez" },
        { id: "e5", date: "2026-02-28T09:00:00Z", type: "comment", description: "Esperando materiales de impermeabilización", actor: "Carlos Méndez" },
    ],
};

async function fetchTicketDetail(id: string): Promise<TicketDetail | null> {
    await new Promise((r) => setTimeout(r, 400));
    return MOCK_TICKETS[id] ?? null;
}
async function fetchTimeline(ticketId: string): Promise<TimelineEvent[]> {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_TIMELINES[ticketId] ?? [];
}
async function cancelTicket(_id: string): Promise<void> { }

function buildFallbackTimeline(ticket: TicketDetail): TimelineEvent[] {
    const events: TimelineEvent[] = [
        {
            id: `${ticket.id}-created`,
            date: ticket.createdOn,
            type: "status_change",
            description: "Ticket creado – Estado: Nuevo",
            actor: "Solicitante",
        },
    ];

    if (ticket.assignedTechnicianName) {
        events.push({
            id: `${ticket.id}-assigned`,
            date: ticket.modifiedOn,
            type: "assignment",
            description: `Asignado a ${ticket.assignedTechnicianName}`,
            actor: "Supervisor",
        });
    }

    if (ticket.status !== TicketStatus.New) {
        events.push({
            id: `${ticket.id}-status-current`,
            date: ticket.modifiedOn,
            type: "status_change",
            description: `Estado actualizado: ${ticket.status}`,
            actor: ticket.assignedTechnicianName ?? "Sistema",
        });
    }

    if (ticket.onHoldReason) {
        events.push({
            id: `${ticket.id}-hold-note`,
            date: ticket.modifiedOn,
            type: "comment",
            description: `En espera: ${ticket.onHoldReason}`,
            actor: ticket.assignedTechnicianName ?? "Sistema",
        });
    }

    if (ticket.resolutionNotes) {
        events.push({
            id: `${ticket.id}-resolution`,
            date: ticket.closedOn ?? ticket.modifiedOn,
            type: "work_order",
            description: `Resolución registrada: ${ticket.resolutionNotes}`,
            actor: ticket.assignedTechnicianName ?? "Sistema",
        });
    }

    if (ticket.closedOn) {
        events.push({
            id: `${ticket.id}-closed`,
            date: ticket.closedOn,
            type: "status_change",
            description: "Ticket cerrado",
            actor: "Sistema",
        });
    }

    return events;
}

function normalizeTimeline(ticket: TicketDetail, timeline: TimelineEvent[]): TimelineEvent[] {
    const source = timeline.length > 0 ? timeline : buildFallbackTimeline(ticket);
    return [...source].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// ── SVG Icons ──────────────────────────────────────────────────
const StarIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const AlertIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

const HistoryStatusIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 4v6h-6" />
        <path d="M1 20v-6h6" />
        <path d="M3.5 9a9 9 0 0 1 14.83-3.36L23 10" />
        <path d="M20.5 15a9 9 0 0 1-14.83 3.36L1 14" />
    </svg>
);

const HistoryAssignmentIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21a8 8 0 1 0-16 0" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const HistoryCommentIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const HistoryMaterialIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
    </svg>
);

const HistoryWorkOrderIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
);

const timelineMeta: Record<TimelineEvent["type"], { icon: React.ReactNode; label: string; color: string }> = {
    status_change: { icon: <HistoryStatusIcon />, label: "Estado", color: theme.colors.info },
    assignment: { icon: <HistoryAssignmentIcon />, label: "Asignación", color: theme.colors.primary },
    comment: { icon: <HistoryCommentIcon />, label: "Comentario", color: theme.colors.secondary },
    material: { icon: <HistoryMaterialIcon />, label: "Material", color: theme.colors.warning },
    work_order: { icon: <HistoryWorkOrderIcon />, label: "Orden de trabajo", color: theme.colors.success },
};

export function TicketDetailScreen() {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState<TicketDetail | null>(null);
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!ticketId) return;
        Promise.all([fetchTicketDetail(ticketId), fetchTimeline(ticketId)]).then(
            ([t, tl]) => {
                setTicket(t);
                setTimeline(t ? normalizeTimeline(t, tl) : []);
                setLoading(false);
            },
        );
    }, [ticketId]);

    if (loading) return <LoadingSpinner />;
    if (!ticket) {
        return (
            <div className="page-wrapper">
                <Header title="Ticket" showBack />
                <div className="fade-in-up empty-state" style={{
                    textAlign: "center",
                    padding: "60px 24px",
                    color: theme.colors.textSecondary,
                }}>
                    <AlertIcon />
                    <p style={{ margin: "12px 0 0", fontSize: theme.fontSizes.md, fontWeight: theme.fontWeights.semibold, color: theme.colors.text }}>
                        Ticket no encontrado
                    </p>
                </div>
            </div>
        );
    }

    const canCancel = ticket.status === TicketStatus.New || ticket.status === TicketStatus.Assigned;
    const showSurvey = ticket.status === TicketStatus.Closed && !ticket.surveyCompleted;

    const dateFormat = (d: string) =>
        new Date(d).toLocaleDateString("es-HN", {
            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
        });

    return (
        <div className="page-wrapper">
            <Header title={`#${ticket.ticketNumber}`} showBack />
            <button className="desktop-back-btn" onClick={() => navigate(-1)}>← Volver</button>
            <h2 className="desktop-page-title">{`Ticket #${ticket.ticketNumber}`}</h2>

            {/* ── Summary card ───────────────────────────────── */}
            <section
                className="fade-in-up detail-card ui-surface"
                style={{
                    margin: "20px",
                    padding: "20px",
                    background: theme.gradients.surface,
                }}
            >
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                    <PriorityBadge priority={ticket.priority} />
                    <StatusBadge status={ticket.status} />
                </div>
                <h2 style={{
                    margin: "0 0 8px",
                    fontSize: theme.fontSizes.xl,
                    fontWeight: theme.fontWeights.bold,
                    color: theme.colors.text,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.3,
                }}>
                    {ticket.title}
                </h2>
                <p style={{
                    margin: 0,
                    fontSize: theme.fontSizes.sm,
                    color: theme.colors.textSecondary,
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                }}>
                    {ticket.description}
                </p>
            </section>

            {/* ── Detail rows ────────────────────────────────── */}
            <section style={{ padding: "0 20px" }}>
                <div className="ui-surface" style={{ overflow: "hidden" }}>
                    <DetailRow label="Categoría" value={ticket.subcategoryName ? `${ticket.categoryName} / ${ticket.subcategoryName}` : ticket.categoryName} />
                    <DetailRow label="Ubicación" value={ticket.locationName} />
                    <DetailRow label="Creado" value={dateFormat(ticket.createdOn)} />
                    {ticket.assignedTechnicianName && <DetailRow label="Técnico" value={ticket.assignedTechnicianName} />}
                    {ticket.eta && <DetailRow label="ETA" value={dateFormat(ticket.eta)} />}
                    {ticket.onHoldReason && <DetailRow label="En espera" value={ticket.onHoldReason} />}
                    {ticket.resolutionNotes && <DetailRow label="Resolución" value={ticket.resolutionNotes} />}
                    {ticket.closedOn && <DetailRow label="Cerrado" value={dateFormat(ticket.closedOn)} last />}
                </div>
            </section>

            {/* ── Timeline ───────────────────────────────────── */}
            {timeline.length > 0 && (
                <section style={{ padding: "24px 20px 0" }}>
                    <h3 style={{
                        fontSize: theme.fontSizes.lg,
                        fontWeight: theme.fontWeights.semibold,
                        marginBottom: "16px",
                        color: theme.colors.text,
                    }}>
                        Historial
                    </h3>
                    <div style={{ position: "relative", paddingLeft: "28px" }}>
                        {/* Vertical line */}
                        <div style={{
                            position: "absolute",
                            left: 10,
                            top: 4,
                            bottom: 4,
                            width: 2,
                            background: theme.colors.border,
                            borderRadius: 1,
                        }} />
                        {timeline.map((evt, i) => {
                            const cfg = timelineMeta[evt.type];
                            return (
                                <div
                                    key={evt.id}
                                    className="fade-in-up"
                                    style={{
                                        marginBottom: i < timeline.length - 1 ? "20px" : 0,
                                        position: "relative",
                                    }}
                                >
                                    <span style={{
                                        position: "absolute",
                                        left: -24,
                                        top: 1,
                                        width: 22,
                                        height: 22,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 12,
                                        background: theme.colors.surface,
                                        borderRadius: "50%",
                                        border: `2px solid ${cfg.color}`,
                                        boxShadow: theme.shadows.xs,
                                        fontWeight: 700,
                                        color: cfg.color,
                                    }}>
                                        {cfg.icon}
                                    </span>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                        <span style={{
                                            fontSize: "0.68rem",
                                            fontWeight: theme.fontWeights.semibold,
                                            color: cfg.color,
                                            background: `${cfg.color}1A`,
                                            borderRadius: 999,
                                            padding: "2px 8px",
                                        }}>
                                            {cfg.label}
                                        </span>
                                        <span style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textSecondary }}>
                                            {evt.actor ?? "Sistema"}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium, color: theme.colors.text, marginTop: 4 }}>
                                        {evt.description}
                                    </div>
                                    <div style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textTertiary, marginTop: "2px" }}>
                                        {dateFormat(evt.date)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── Actions ────────────────────────────────────── */}
            {(showSurvey || canCancel) && (
                <section style={{ padding: "24px 20px 0", display: "flex", gap: "10px" }}>
                    {showSurvey && (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/survey/${ticketId}`)}
                            style={{
                                flex: 1,
                                padding: "14px",
                                borderRadius: theme.borderRadius.lg,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                            }}
                        >
                            <StarIcon />
                            Completar Encuesta
                        </button>
                    )}
                    {canCancel && (
                        <button
                            className="btn"
                            onClick={async () => {
                                if (confirm("¿Está seguro de cancelar este ticket?")) {
                                    await cancelTicket(ticket.id);
                                    setTicket({ ...ticket, status: TicketStatus.Cancelled });
                                }
                            }}
                            style={{
                                flex: 1,
                                padding: "14px",
                                borderRadius: theme.borderRadius.lg,
                                border: `1.5px solid ${theme.colors.error}`,
                                color: theme.colors.error,
                                fontFamily: "inherit",
                                background: theme.colors.errorGhost,
                            }}
                        >
                            Cancelar Ticket
                        </button>
                    )}
                </section>
            )}
        </div>
    );
}

// ── Detail row ─────────────────────────────────────────────────
function DetailRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "12px 16px",
                borderBottom: last ? "none" : `1px solid ${theme.colors.borderLight}`,
                fontSize: theme.fontSizes.sm,
            }}
        >
            <span style={{ color: theme.colors.textSecondary, fontWeight: theme.fontWeights.medium }}>
                {label}
            </span>
            <span style={{
                color: theme.colors.text,
                fontWeight: theme.fontWeights.medium,
                textAlign: "right",
                maxWidth: "60%",
                wordBreak: "break-word",
            }}>
                {value}
            </span>
        </div>
    );
}
