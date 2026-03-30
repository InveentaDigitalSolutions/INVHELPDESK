// ═══════════════════════════════════════════════════════════════
// ApprovalCenter – Approve/reject material requests & cost
// overruns that exceed 15% variance
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import {
    approvePendingApproval,
    fetchPendingApprovals,
    PendingApprovalItem,
    rejectPendingApproval,
} from "@shared/workflow/materialApprovalFlow";

interface PendingApproval {
    id: string;
    type: "material" | "cost_overrun";
    ticketNumber: string;
    ticketTitle: string;
    technicianName: string;
    description: string;
    amount: number;
    requestedOn: string;
}

// ── Dataverse stubs ────────────────────────────────────────────
function fromWorkflow(item: PendingApprovalItem): PendingApproval {
    return {
        id: item.id,
        type: item.type,
        ticketNumber: item.ticketNumber,
        ticketTitle: item.ticketTitle,
        technicianName: item.technicianName,
        description: item.description,
        amount: item.amount,
        requestedOn: item.requestedOn,
    };
}

export function ApprovalCenter() {
    const [items, setItems] = useState<PendingApproval[]>([]);
    const [loading, setLoading] = useState(true);
    const [rejectModal, setRejectModal] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    useEffect(() => {
        fetchPendingApprovals().then((a) => {
            setItems(a.map(fromWorkflow));
            setLoading(false);
        });
    }, []);

    const handleApprove = async (item: PendingApproval) => {
        await approvePendingApproval(item.id, "Supervisor");
        setItems((prev) => prev.filter((i) => i.id !== item.id));
    };

    const handleReject = async () => {
        if (!rejectModal || !rejectReason.trim()) return;
        const item = items.find((i) => i.id === rejectModal);
        if (!item) return;
        await rejectPendingApproval(item.id, rejectReason.trim(), "Supervisor");
        setItems((prev) => prev.filter((i) => i.id !== rejectModal));
        setRejectModal(null);
        setRejectReason("");
    };

    const fmt = (d: string) => new Date(d).toLocaleDateString("es-HN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

    return (
        <div style={{ padding: 24 }}>
            <h1 className="page-title" style={{ marginBottom: 24 }}>Centro de Aprobaciones</h1>

            {loading ? (
                <p style={{ textAlign: "center", color: "#888", padding: 40 }}>Cargando…</p>
            ) : items.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, color: "#888" }}>
                    <p style={{ marginTop: 12 }}>No hay aprobaciones pendientes.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="card"
                            style={{
                                padding: 16,
                                border: `1px solid ${item.type === "cost_overrun" ? "#FCA5A5" : "#e5e7eb"}`,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <div style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "center" }}>
                                    <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600, color: "#fff", background: item.type === "cost_overrun" ? "#DC2626" : "#F59E0B" }}>
                                        {item.type === "cost_overrun" ? "Exceso de Costo" : "Material"}
                                    </span>
                                    <span style={{ fontSize: 13, color: "#888" }}>#{item.ticketNumber}</span>
                                </div>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{item.description}</div>
                                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                                    Solicitado por {item.technicianName} · {fmt(item.requestedOn)}
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontWeight: 700, fontSize: 16 }}>L {item.amount.toFixed(2)}</div>
                                </div>
                                <div style={{ display: "flex", gap: 6 }}>
                                    <button
                                        onClick={() => handleApprove(item)}
                                        className="btn btn-success"
                                        style={{ fontSize: 13 }}
                                    >
                                        Aprobar
                                    </button>
                                    <button
                                        onClick={() => setRejectModal(item.id)}
                                        className="btn btn-danger-outline"
                                        style={{ fontSize: 13 }}
                                    >
                                        Rechazar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reject modal */}
            {rejectModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div className="card" style={{ padding: 24, minWidth: 360, maxWidth: 420 }}>
                        <h3 style={{ margin: `0 0 12px`, fontSize: 16 }}>Razón del rechazo</h3>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Explique la razón del rechazo…"
                            className="input-control"
                            style={{ minHeight: 80 }}
                        />
                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                            <button onClick={() => { setRejectModal(null); setRejectReason(""); }} className="btn btn-outline" style={{ flex: 1 }}>
                                Cancelar
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason.trim()}
                                className="btn btn-danger"
                                style={{ flex: 1 }}
                            >
                                Confirmar Rechazo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
