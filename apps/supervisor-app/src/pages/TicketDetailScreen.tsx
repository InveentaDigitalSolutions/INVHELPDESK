// ═══════════════════════════════════════════════════════════════
// TicketDetailScreen (Supervisor) – full ticket view with
// escalation, reassignment, priority change, and audit trail
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    TicketStatus,
    TicketPriority,
    ticketStatusLabels,
    ticketStatusColors,
    ticketPriorityLabels,
    ticketPriorityColors,
} from "@shared/types";

interface FullTicket {
    id: string;
    ticketNumber: string;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdOn: string;
    modifiedOn: string;
    reportedByName: string;
    assignedToName?: string;
    categoryName: string;
    subcategoryName?: string;
    locationName: string;
    eta?: string;
    resolutionNotes?: string;
    workOrderDiagnosis?: string;
    workOrderCost?: number;
    totalTimeMinutes?: number;
    materialsCost?: number;
}

// ── Dataverse stubs ────────────────────────────────────────────
async function fetchTicketFull(_id: string): Promise<FullTicket | null> { return null; }
async function updatePriority(_id: string, _p: TicketPriority): Promise<void> { }
async function escalateTicket(_id: string): Promise<void> { }

export function TicketDetailScreen() {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState<FullTicket | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!ticketId) return;
        fetchTicketFull(ticketId).then((t) => { setTicket(t); setLoading(false); });
    }, [ticketId]);

    if (loading) return <p style={{ padding: 40, textAlign: "center", color: "#888" }}>Cargando…</p>;
    if (!ticket) return <p style={{ padding: 40, textAlign: "center", color: "#888" }}>Ticket no encontrado.</p>;

    const fmt = (d?: string) => d ? new Date(d).toLocaleDateString("es-HN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

    return (
        <div style={{ padding: 24, maxWidth: 900 }}>
            <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, marginBottom: 16 }}>
                ← Volver
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <h2 style={{ margin: 0, fontSize: 20 }}>#{ticket.ticketNumber} — {ticket.title}</h2>
                <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 12, fontWeight: 600, color: "#fff", background: ticketPriorityColors[ticket.priority] }}>
                    {ticketPriorityLabels[ticket.priority]}
                </span>
                <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 12, fontWeight: 600, color: "#fff", background: ticketStatusColors[ticket.status] }}>
                    {ticketStatusLabels[ticket.status]}
                </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginTop: 20 }}>
                {/* Left – details */}
                <div>
                    <Section title="Descripción">
                        <p style={{ margin: 0, fontSize: 14, whiteSpace: "pre-wrap" }}>{ticket.description}</p>
                    </Section>

                    <Section title="Información">
                        <Row label="Reportado por" value={ticket.reportedByName} />
                        <Row label="Categoría" value={ticket.subcategoryName ? `${ticket.categoryName} / ${ticket.subcategoryName}` : ticket.categoryName} />
                        <Row label="Ubicación" value={ticket.locationName} />
                        <Row label="Técnico" value={ticket.assignedToName ?? "Sin asignar"} />
                        <Row label="Creado" value={fmt(ticket.createdOn)} />
                        <Row label="Última actualización" value={fmt(ticket.modifiedOn)} />
                        <Row label="ETA" value={fmt(ticket.eta)} />
                    </Section>

                    {ticket.workOrderDiagnosis && (
                        <Section title="Orden de Trabajo">
                            <p style={{ margin: 0, fontSize: 14 }}>{ticket.workOrderDiagnosis}</p>
                            {ticket.workOrderCost != null && <Row label="Costo estimado" value={`L ${ticket.workOrderCost.toFixed(2)}`} />}
                        </Section>
                    )}

                    {ticket.resolutionNotes && (
                        <Section title="Resolución">
                            <p style={{ margin: 0, fontSize: 14, whiteSpace: "pre-wrap" }}>{ticket.resolutionNotes}</p>
                        </Section>
                    )}
                </div>

                {/* Right – actions & cost summary */}
                <div>
                    <Section title="Acciones">
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <label style={{ fontSize: 13, fontWeight: 500 }}>Cambiar Prioridad</label>
                            <select
                                value={ticket.priority}
                                onChange={async (e) => {
                                    const p = Number(e.target.value) as TicketPriority;
                                    await updatePriority(ticket.id, p);
                                    setTicket({ ...ticket, priority: p });
                                }}
                                className="input-control"
                            >
                                {Object.entries(ticketPriorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>

                            <button
                                onClick={async () => { await escalateTicket(ticket.id); alert("Ticket escalado exitosamente."); }}
                                className="btn btn-danger"
                                style={{ marginTop: 8 }}
                            >
                                Escalar Ticket
                            </button>
                        </div>
                    </Section>

                    <Section title="Resumen de Costos">
                        <Row label="Tiempo invertido" value={ticket.totalTimeMinutes ? `${Math.floor(ticket.totalTimeMinutes / 60)}h ${ticket.totalTimeMinutes % 60}m` : "—"} />
                        <Row label="Costo materiales" value={ticket.materialsCost != null ? `L ${ticket.materialsCost.toFixed(2)}` : "—"} />
                        <Row label="Costo orden trabajo" value={ticket.workOrderCost != null ? `L ${ticket.workOrderCost.toFixed(2)}` : "—"} />
                    </Section>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <h3 style={{ margin: `0 0 10px`, fontSize: 14, color: "#888" }}>{title}</h3>
            {children}
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ color: "#888" }}>{label}</span>
            <span style={{ fontWeight: 500 }}>{value}</span>
        </div>
    );
}
