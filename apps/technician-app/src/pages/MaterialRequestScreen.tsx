// ═══════════════════════════════════════════════════════════════
// MaterialRequestScreen – Request materials for the ticket
// Tracks material name, quantity, unit cost, status
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { MaterialRequestStatus } from "@shared/types";
import {
    addTicketMaterial,
    ApprovalHistoryEntry,
    fetchApprovalHistory,
    fetchTicketMaterials,
    getTicketAssessment,
    submitMaterialApproval,
    TicketMaterialItem,
} from "@shared/workflow/materialApprovalFlow";

interface MaterialItem {
    id?: string;
    name: string;
    quantity: number;
    unitCost: number;
    status: MaterialRequestStatus;
}

// ── Dataverse stubs ────────────────────────────────────────────
async function fetchMaterials(_ticketId: string): Promise<MaterialItem[]> {
    const items = await fetchTicketMaterials(_ticketId);
    return items;
}
async function addMaterial(_ticketId: string, _item: Omit<MaterialItem, "id" | "status">): Promise<MaterialItem> {
    return addTicketMaterial(_ticketId, _item as Omit<TicketMaterialItem, "id" | "status">);
}

const statusLabels: Record<MaterialRequestStatus, string> = {
    [MaterialRequestStatus.Required]: "Requerido",
    [MaterialRequestStatus.PendingApproval]: "Pendiente Aprobación",
    [MaterialRequestStatus.Approved]: "Aprobado",
    [MaterialRequestStatus.Rejected]: "Rechazado",
    [MaterialRequestStatus.Delivered]: "Entregado",
    [MaterialRequestStatus.Consumed]: "Consumido",
};

const statusColors: Record<MaterialRequestStatus, string> = {
    [MaterialRequestStatus.Required]: "#6B7280",
    [MaterialRequestStatus.PendingApproval]: "#F59E0B",
    [MaterialRequestStatus.Approved]: "#2563EB",
    [MaterialRequestStatus.Rejected]: "#EF4444",
    [MaterialRequestStatus.Delivered]: "#10B981",
    [MaterialRequestStatus.Consumed]: "#00643E",
};

export function MaterialRequestScreen() {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [materials, setMaterials] = useState<MaterialItem[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [qty, setQty] = useState(1);
    const [cost, setCost] = useState(0);
    const [saving, setSaving] = useState(false);
    const [assessmentReady, setAssessmentReady] = useState(false);
    const [submittingApproval, setSubmittingApproval] = useState(false);
    const [approvalHistory, setApprovalHistory] = useState<ApprovalHistoryEntry[]>([]);

    const loadWorkflowData = async (id: string) => {
        const [items, assessment, history] = await Promise.all([
            fetchMaterials(id),
            getTicketAssessment(id),
            fetchApprovalHistory(id),
        ]);
        setMaterials(items);
        setAssessmentReady(Boolean(assessment?.needsMaterials));
        setApprovalHistory(history);
    };

    useEffect(() => {
        if (!ticketId) return;
        loadWorkflowData(ticketId);
    }, [ticketId]);

    const totalCost = materials.reduce((acc, m) => acc + m.quantity * m.unitCost, 0);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketId) return;
        setSaving(true);
        try {
            const item = await addMaterial(ticketId, { name, quantity: qty, unitCost: cost });
            setMaterials((prev) => [...prev, item]);
            setName("");
            setQty(1);
            setCost(0);
            setShowForm(false);
        } finally {
            setSaving(false);
        }
    };

    const hasPendingApproval = materials.some((material) => material.status === MaterialRequestStatus.PendingApproval);
    const handleSubmitApproval = async () => {
        if (!ticketId || materials.length === 0 || hasPendingApproval) return;
        setSubmittingApproval(true);
        try {
            await submitMaterialApproval({
                ticketId,
                ticketNumber: (location.state as { ticketNumber?: string } | null)?.ticketNumber ?? ticketId,
                ticketTitle: (location.state as { ticketTitle?: string } | null)?.ticketTitle ?? "Ticket de mantenimiento",
                technicianName: "Técnico de Mantenimiento",
            });
            await loadWorkflowData(ticketId);
        } finally {
            setSubmittingApproval(false);
        }
    };

    const historyLabel = (status: ApprovalHistoryEntry["status"]) => {
        if (status === "submitted") return "Solicitud enviada";
        if (status === "approved") return "Aprobado";
        return "Rechazado";
    };

    const historyColor = (status: ApprovalHistoryEntry["status"]) => {
        if (status === "submitted") return "#92400E";
        if (status === "approved") return "#00643E";
        return "#B91C1C";
    };

    const fmtDateTime = (value: string) =>
        new Date(value).toLocaleDateString("es-HN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

    return (
        <div style={{ padding: 16, maxWidth: 700, margin: "0 auto" }}>
            <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, marginBottom: 12 }}>
                ← Volver
            </button>
            <h2 className="page-title">Solicitud de Materiales</h2>

            {!assessmentReady && (
                <div className="card" style={{ padding: 14, marginBottom: 14, fontSize: 13, color: "#92400E", background: "#FFFBEB" }}>
                    Antes de solicitar materiales, completa la evaluación técnica inicial en el ticket y marca que sí requiere materiales.
                </div>
            )}

            {/* Material list */}
            {materials.length === 0 ? (
                <p style={{ textAlign: "center", color: "#888", padding: 24 }}>No hay materiales solicitados aún.</p>
            ) : (
                <div className="table-shell" style={{ marginBottom: 16 }}>
                    <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #e5e7eb", color: "#888" }}>
                                <th style={{ textAlign: "left", padding: 6 }}>Material</th>
                                <th style={{ textAlign: "center", padding: 6 }}>Cant.</th>
                                <th style={{ textAlign: "right", padding: 6 }}>Costo U.</th>
                                <th style={{ textAlign: "right", padding: 6 }}>Subtotal</th>
                                <th style={{ textAlign: "center", padding: 6 }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materials.map((m, i) => (
                                <tr key={m.id ?? i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: 6 }}>{m.name}</td>
                                    <td style={{ padding: 6, textAlign: "center" }}>{m.quantity}</td>
                                    <td style={{ padding: 6, textAlign: "right" }}>L {m.unitCost.toFixed(2)}</td>
                                    <td style={{ padding: 6, textAlign: "right", fontWeight: 600 }}>L {(m.quantity * m.unitCost).toFixed(2)}</td>
                                    <td style={{ padding: 6, textAlign: "center" }}>
                                        <span style={{ padding: "2px 6px", borderRadius: 99, fontSize: 11, fontWeight: 600, color: "#fff", background: statusColors[m.status] }}>
                                            {statusLabels[m.status]}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ textAlign: "right", fontWeight: 700, fontSize: 14, padding: "8px 6px", borderTop: "2px solid #e5e7eb" }}>
                        Total: L {totalCost.toFixed(2)}
                    </div>
                </div>
            )}

            {/* Add form toggle */}
            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary"
                    disabled={!assessmentReady || hasPendingApproval}
                    style={{ width: "100%" }}
                >
                    {hasPendingApproval ? "Aprobación en proceso" : "Agregar Material"}
                </button>
            ) : (
                <form onSubmit={handleAdd} className="card" style={{ padding: 16 }}>
                    <div style={{ marginBottom: 12 }}>
                        <label style={{ display: "block", marginBottom: 4, fontWeight: 500, fontSize: 14 }}>Nombre del Material *</label>
                        <input required className="input-control" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Tubería PVC 1/2 pulgada" />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                        <div>
                            <label style={{ display: "block", marginBottom: 4, fontWeight: 500, fontSize: 14 }}>Cantidad *</label>
                            <input type="number" min={1} required className="input-control" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: 4, fontWeight: 500, fontSize: 14 }}>Costo Unitario (L)</label>
                            <input type="number" min={0} step={0.01} className="input-control" value={cost} onChange={(e) => setCost(Number(e.target.value))} />
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline" style={{ flex: 1 }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>
                            {saving ? "Guardando…" : "Agregar"}
                        </button>
                    </div>
                </form>
            )}

            <button
                onClick={handleSubmitApproval}
                className="btn btn-secondary"
                disabled={!assessmentReady || materials.length === 0 || hasPendingApproval || submittingApproval}
                style={{ width: "100%", marginTop: 12 }}
            >
                {hasPendingApproval
                    ? "Compra enviada para aprobación"
                    : submittingApproval
                        ? "Enviando aprobación..."
                        : "Enviar solicitud de compra al Supervisor"}
            </button>

            {approvalHistory.length > 0 && (
                <section className="card" style={{ marginTop: 14, padding: 14 }}>
                    <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Historial de Aprobación</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {[...approvalHistory]
                            .sort((a, b) => new Date(b.decidedOn).getTime() - new Date(a.decidedOn).getTime())
                            .map((entry) => (
                                <div key={entry.id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 10 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                        <span style={{ fontWeight: 700, fontSize: 12, color: historyColor(entry.status) }}>
                                            {historyLabel(entry.status)}
                                        </span>
                                        <span style={{ fontSize: 12, color: "#6B7280" }}>{fmtDateTime(entry.decidedOn)}</span>
                                    </div>
                                    <p style={{ margin: "6px 0 0", fontSize: 12, color: "#374151" }}>
                                        Por: {entry.decidedBy}
                                    </p>
                                    {entry.reason && (
                                        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#B91C1C" }}>
                                            Razón: {entry.reason}
                                        </p>
                                    )}
                                </div>
                            ))}
                    </div>
                </section>
            )}
        </div>
    );
}
