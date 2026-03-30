// ═══════════════════════════════════════════════════════════════
// WorkOrderScreen – Create / edit work order for a ticket
// Diagnosis, root cause, solution, estimated cost, evidence
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTechnicianWorkOrder, saveTechnicianWorkOrder } from "../utils/mockTechnicianData";

// ── Dataverse stubs ────────────────────────────────────────────
interface WorkOrder {
    id?: string;
    diagnosis: string;
    rootCause: string;
    solution: string;
    estimatedCost: number;
    actualCost: number;
    beforeEvidence: File[];
    afterEvidence: File[];
}

async function fetchWorkOrder(_ticketId: string): Promise<WorkOrder | null> {
    const workOrder = await fetchTechnicianWorkOrder(_ticketId);
    if (!workOrder) return null;
    return {
        ...workOrder,
        beforeEvidence: [],
        afterEvidence: [],
    };
}

async function saveWorkOrder(_ticketId: string, _wo: WorkOrder): Promise<void> {
    await saveTechnicianWorkOrder(_ticketId, {
        id: _wo.id,
        diagnosis: _wo.diagnosis,
        rootCause: _wo.rootCause,
        solution: _wo.solution,
        estimatedCost: _wo.estimatedCost,
        actualCost: _wo.actualCost,
    });
}

const EMPTY: WorkOrder = {
    diagnosis: "",
    rootCause: "",
    solution: "",
    estimatedCost: 0,
    actualCost: 0,
    beforeEvidence: [],
    afterEvidence: [],
};

export function WorkOrderScreen() {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const [form, setForm] = useState<WorkOrder>(EMPTY);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!ticketId) return;
        fetchWorkOrder(ticketId).then((wo) => {
            if (wo) setForm(wo);
        });
    }, [ticketId]);

    const set = <K extends keyof WorkOrder>(k: K, v: WorkOrder[K]) =>
        setForm((f) => ({ ...f, [k]: v }));

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketId) return;
        setSaving(true);
        try {
            await saveWorkOrder(ticketId, form);
            navigate(-1);
        } catch (err) {
            console.error(err);
            alert("Error al guardar la orden de trabajo.");
        } finally {
            setSaving(false);
        }
    };

    const label: React.CSSProperties = { display: "block", marginBottom: 4, fontWeight: 500, fontSize: 14 };
    const gap: React.CSSProperties = { marginBottom: 16 };

    return (
        <div style={{ padding: 16, maxWidth: 700, margin: "0 auto" }}>
            <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, marginBottom: 12 }}>
                ← Volver
            </button>
            <h2 className="page-title">Orden de Trabajo</h2>

            <form onSubmit={handleSave}>
                <div style={gap}>
                    <label style={label}>Diagnóstico *</label>
                    <textarea className="input-control" style={{ minHeight: 80 }} required value={form.diagnosis} onChange={(e) => set("diagnosis", e.target.value)} placeholder="Descripción del diagnóstico técnico…" />
                </div>

                <div style={gap}>
                    <label style={label}>Causa Raíz *</label>
                    <textarea className="input-control" style={{ minHeight: 60 }} required value={form.rootCause} onChange={(e) => set("rootCause", e.target.value)} placeholder="¿Qué originó la falla?" />
                </div>

                <div style={gap}>
                    <label style={label}>Solución Aplicada</label>
                    <textarea className="input-control" style={{ minHeight: 60 }} value={form.solution} onChange={(e) => set("solution", e.target.value)} placeholder="Solución implementada o propuesta…" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, ...gap }}>
                    <div>
                        <label style={label}>Costo Estimado (L)</label>
                        <input type="number" min={0} step={0.01} className="input-control" value={form.estimatedCost} onChange={(e) => set("estimatedCost", Number(e.target.value))} />
                    </div>
                    <div>
                        <label style={label}>Costo Real (L)</label>
                        <input type="number" min={0} step={0.01} className="input-control" value={form.actualCost} onChange={(e) => set("actualCost", Number(e.target.value))} />
                    </div>
                </div>

                {/* Cost variance indicator */}
                {form.estimatedCost > 0 && (
                    <div style={{ fontSize: 13, marginBottom: 16, color: Math.abs(form.actualCost - form.estimatedCost) / form.estimatedCost > 0.15 ? "#DC2626" : "#888" }}>
                        Variación: {((form.actualCost - form.estimatedCost) / form.estimatedCost * 100).toFixed(1)}%
                        {Math.abs(form.actualCost - form.estimatedCost) / form.estimatedCost > 0.15 && " ⚠️ Requiere aprobación"}
                    </div>
                )}

                {/* Evidence uploads */}
                <div style={gap}>
                    <label style={label}>📷 Evidencia Antes</label>
                    <input type="file" accept="image/*" multiple onChange={(e) => set("beforeEvidence", Array.from(e.target.files ?? []))} />
                </div>
                <div style={gap}>
                    <label style={label}>📷 Evidencia Después</label>
                    <input type="file" accept="image/*" multiple onChange={(e) => set("afterEvidence", Array.from(e.target.files ?? []))} />
                </div>

                <button
                    type="submit"
                    disabled={saving || !form.diagnosis || !form.rootCause}
                    className="btn btn-primary"
                    style={{ width: "100%", opacity: saving ? 0.6 : 1 }}
                >
                    {saving ? "Guardando…" : "Guardar Orden de Trabajo"}
                </button>
            </form>
        </div>
    );
}
