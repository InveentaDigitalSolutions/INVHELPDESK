// ═══════════════════════════════════════════════════════════════
// TicketDetailScreen (Technician) – full details + action buttons
// Navigate to work-order, time-log, materials, close screens
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    TicketStatus,
    TicketPriority,
} from "@shared/types";
import { fetchApprovalHistory, getTicketAssessment, saveTicketAssessment } from "@shared/workflow/materialApprovalFlow";
import { fetchTechnicianTicket, setTechnicianTicketStatus } from "../utils/mockTechnicianData";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";

interface FullTicket {
    id: string;
    ticketNumber: string;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdOn: string;
    reportedByName: string;
    categoryName: string;
    subcategoryName?: string;
    locationName: string;
    eta?: string;
    slaFirstResponseDeadline?: string;
    slaDiagnosisDeadline?: string;
    slaResolutionDeadline?: string;
    evidence?: string[];
}

// ── Dataverse stubs ────────────────────────────────────────────
async function fetchTicket(_id: string): Promise<FullTicket | null> {
    return fetchTechnicianTicket(_id);
}

async function persistTicketStatus(id: string, status: TicketStatus): Promise<void> {
    await setTechnicianTicketStatus(id, status);
}

export function TicketDetailScreen() {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState<FullTicket | null>(null);
    const [loading, setLoading] = useState(true);
    const [assessmentNotes, setAssessmentNotes] = useState("");
    const [needsMaterials, setNeedsMaterials] = useState(false);
    const [assessmentSavedAt, setAssessmentSavedAt] = useState<string | null>(null);
    const [savingAssessment, setSavingAssessment] = useState(false);
    const [latestApprovalStatus, setLatestApprovalStatus] = useState<{
        status: "submitted" | "approved" | "rejected";
        decidedBy: string;
        decidedOn: string;
        reason?: string;
    } | null>(null);

    useEffect(() => {
        if (!ticketId) return;
        fetchTicket(ticketId).then((t) => {
            setTicket(t);
            setLoading(false);
        });
        getTicketAssessment(ticketId).then((assessment) => {
            if (!assessment) return;
            setAssessmentNotes(assessment.notes);
            setNeedsMaterials(assessment.needsMaterials);
            setAssessmentSavedAt(assessment.assessedOn);
        });
        fetchApprovalHistory(ticketId).then((history) => {
            if (history.length === 0) {
                setLatestApprovalStatus(null);
                return;
            }
            const latest = [...history].sort(
                (a, b) => new Date(b.decidedOn).getTime() - new Date(a.decidedOn).getTime(),
            )[0];
            if (!latest) {
                setLatestApprovalStatus(null);
                return;
            }
            setLatestApprovalStatus(latest);
        });
    }, [ticketId]);

    if (loading)
        return <p style={{ textAlign: "center", padding: 40, color: "#888" }}>Cargando…</p>;
    if (!ticket)
        return <p style={{ textAlign: "center", padding: 40, color: "#888" }}>Ticket no encontrado.</p>;

    const btnStyle: React.CSSProperties = { flex: 1, textAlign: "center" };

    const canStartWork =
        ticket.status === TicketStatus.Assigned || ticket.status === TicketStatus.OnHold;
    const canClose = ticket.status === TicketStatus.InProgress;

    const handleStart = async () => {
        await persistTicketStatus(ticket.id, TicketStatus.InProgress);
        setTicket({ ...ticket, status: TicketStatus.InProgress });
    };

    const handleSaveAssessment = async () => {
        if (!ticketId || !assessmentNotes.trim()) return;
        setSavingAssessment(true);
        try {
            const assessment = await saveTicketAssessment({
                ticketId,
                notes: assessmentNotes.trim(),
                needsMaterials,
            });
            setAssessmentSavedAt(assessment.assessedOn);
            if (ticket.status === TicketStatus.Assigned) {
                await persistTicketStatus(ticket.id, TicketStatus.InDiagnosis);
                setTicket({ ...ticket, status: TicketStatus.InDiagnosis });
            }
        } finally {
            setSavingAssessment(false);
        }
    };

    const fmt = (d?: string) =>
        d
            ? new Date(d).toLocaleDateString("es-HN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
            : "—";

    const approvalLabel = (status: "submitted" | "approved" | "rejected") => {
        if (status === "submitted") return "Pendiente de aprobación";
        if (status === "approved") return "Compra aprobada";
        return "Compra rechazada";
    };

    const approvalColor = (status: "submitted" | "approved" | "rejected") => {
        if (status === "submitted") return "#92400E";
        if (status === "approved") return "#00643E";
        return "#B91C1C";
    };

    return (
        <div style={{ padding: 16, maxWidth: 700, margin: "0 auto" }}>
            {/* Back */}
            <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, marginBottom: 12 }}>
                ← Volver
            </button>

            {/* Header */}
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
            </div>
            <h2 style={{ margin: `0 0 4px`, fontSize: 20 }}>#{ticket.ticketNumber} – {ticket.title}</h2>
            <p style={{ color: "#888", fontSize: 13, margin: `0 0 16px` }}>
                Reportado por {ticket.reportedByName} · {fmt(ticket.createdOn)}
            </p>

            {/* Description */}
            <section className="card" style={{ padding: 14, marginBottom: 16 }}>
                <h3 style={{ margin: `0 0 4px`, fontSize: 14 }}>Descripción</h3>
                <p style={{ margin: 0, fontSize: 14, whiteSpace: "pre-wrap" }}>{ticket.description}</p>
            </section>

            <section className="card" style={{ padding: 14, marginBottom: 16 }}>
                <h3 style={{ margin: `0 0 10px`, fontSize: 14 }}>Evaluación Técnica Inicial</h3>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>Diagnóstico inicial *</label>
                <textarea
                    className="input-control"
                    style={{ minHeight: 90, marginBottom: 10 }}
                    value={assessmentNotes}
                    onChange={(event) => setAssessmentNotes(event.target.value)}
                    placeholder="Describe hallazgos iniciales y pasos requeridos..."
                />
                <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>¿Necesita compra de materiales?</label>
                    <div style={{ display: "flex", gap: 12 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                            <input type="radio" name="needs-materials" checked={needsMaterials} onChange={() => setNeedsMaterials(true)} />
                            Sí
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                            <input type="radio" name="needs-materials" checked={!needsMaterials} onChange={() => setNeedsMaterials(false)} />
                            No
                        </label>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <button
                        className="btn btn-primary"
                        style={{ minWidth: 190 }}
                        disabled={savingAssessment || !assessmentNotes.trim()}
                        onClick={handleSaveAssessment}
                    >
                        {savingAssessment ? "Guardando..." : "Guardar Evaluación"}
                    </button>
                    {assessmentSavedAt && (
                        <span style={{ fontSize: 12, color: "#6B7280" }}>
                            Última evaluación: {fmt(assessmentSavedAt)}
                        </span>
                    )}
                </div>
            </section>

            {latestApprovalStatus && (
                <section className="card" style={{ padding: 14, marginBottom: 16 }}>
                    <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Estado de Aprobación de Materiales</h3>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: approvalColor(latestApprovalStatus.status) }}>
                        {approvalLabel(latestApprovalStatus.status)}
                    </p>
                    <p style={{ margin: "6px 0 0", fontSize: 12, color: "#6B7280" }}>
                        {latestApprovalStatus.status === "submitted" ? "Enviado por" : "Decidido por"}: {latestApprovalStatus.decidedBy} · {fmt(latestApprovalStatus.decidedOn)}
                    </p>
                    {latestApprovalStatus.reason && (
                        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#B91C1C" }}>
                            Razón de rechazo: {latestApprovalStatus.reason}
                        </p>
                    )}
                </section>
            )}

            {/* Detail rows */}
            <section style={{ marginBottom: 16, fontSize: 14 }}>
                <Row label="Categoría" value={ticket.subcategoryName ? `${ticket.categoryName} / ${ticket.subcategoryName}` : ticket.categoryName} />
                <Row label="Ubicación" value={ticket.locationName} />
                <Row label="ETA" value={fmt(ticket.eta)} />
                <Row label="SLA – Primera Respuesta" value={fmt(ticket.slaFirstResponseDeadline)} warn={isPast(ticket.slaFirstResponseDeadline)} />
                <Row label="SLA – Diagnóstico" value={fmt(ticket.slaDiagnosisDeadline)} warn={isPast(ticket.slaDiagnosisDeadline)} />
                <Row label="SLA – Resolución" value={fmt(ticket.slaResolutionDeadline)} warn={isPast(ticket.slaResolutionDeadline)} />
            </section>

            {/* Evidence images */}
            {ticket.evidence && ticket.evidence.length > 0 && (
                <section style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 14, marginBottom: 8 }}>Evidencia</h3>
                    <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                        {ticket.evidence.map((url, i) => (
                            <img key={i} src={url} alt={`Evidencia ${i + 1}`} style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }} />
                        ))}
                    </div>
                </section>
            )}

            {/* Quick actions */}
            <section style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {canStartWork && (
                    <button className="btn btn-primary" style={btnStyle} onClick={handleStart}>
                        Iniciar Trabajo
                    </button>
                )}
                <button className="btn btn-outline" style={btnStyle} onClick={() => navigate(`/tickets/${ticketId}/work-order`)}>
                    Orden de Trabajo
                </button>
                <button className="btn btn-outline" style={btnStyle} onClick={() => navigate(`/tickets/${ticketId}/time-log`)}>
                    Registro de Tiempo
                </button>
                {needsMaterials && assessmentSavedAt && (
                    <button
                        className="btn btn-outline"
                        style={btnStyle}
                        onClick={() =>
                            navigate(`/tickets/${ticketId}/materials`, {
                                state: {
                                    ticketNumber: ticket.ticketNumber,
                                    ticketTitle: ticket.title,
                                },
                            })
                        }
                    >
                        Materiales y Aprobación
                    </button>
                )}
                {canClose && (
                    <button className="btn btn-secondary" style={btnStyle} onClick={() => navigate(`/tickets/${ticketId}/close`)}>
                        Cerrar Ticket
                    </button>
                )}
            </section>

            {(!assessmentSavedAt || !needsMaterials) && (
                <p style={{ fontSize: 12, color: "#6B7280", marginTop: -4 }}>
                    Para solicitar compra de materiales, primero guarda la evaluación y marca que sí requiere materiales.
                </p>
            )}
        </div>
    );
}

function isPast(d?: string) {
    return d ? new Date(d).getTime() < Date.now() : false;
}

function Row({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ color: "#888" }}>{label}</span>
            <span style={{ fontWeight: 500, color: warn ? "#DC2626" : "#111" }}>{value}</span>
        </div>
    );
}
