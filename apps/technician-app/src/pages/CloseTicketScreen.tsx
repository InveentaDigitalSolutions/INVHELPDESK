// ═══════════════════════════════════════════════════════════════
// CloseTicketScreen – Technician fills resolution notes and
// before/after evidence before closing the ticket
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { closeTechnicianTicket } from "../utils/mockTechnicianData";

// ── Dataverse stubs ────────────────────────────────────────────
async function closeTicket(
    _ticketId: string,
    _data: { resolutionNotes: string; afterEvidence: File[] },
): Promise<void> {
    await closeTechnicianTicket(_ticketId);
}

export function CloseTicketScreen() {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const [resolutionNotes, setResolutionNotes] = useState("");
    const [afterEvidence, setAfterEvidence] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketId) return;
        setSubmitting(true);
        try {
            await closeTicket(ticketId, { resolutionNotes, afterEvidence });
            navigate("/");
        } catch (err) {
            console.error(err);
            alert("Error al cerrar el ticket.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ padding: 16, maxWidth: 700, margin: "0 auto" }}>
            <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, marginBottom: 12 }}>
                ← Volver
            </button>
            <h2 className="page-title" style={{ marginBottom: 8 }}>Cerrar Ticket</h2>
            <p style={{ color: "#888", fontSize: 13, margin: `0 0 20px` }}>
                Documenta la resolución antes de cerrar. El solicitante recibirá una encuesta de satisfacción.
            </p>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", marginBottom: 4, fontWeight: 500, fontSize: 14 }}>
                        Notas de Resolución *
                    </label>
                    <textarea
                        required
                        className="input-control"
                        style={{ minHeight: 120 }}
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="Describe el trabajo realizado, las acciones tomadas y el resultado…"
                        maxLength={4000}
                    />
                </div>

                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: "block", marginBottom: 4, fontWeight: 500, fontSize: 14 }}>
                        Evidencia Después (opcional)
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setAfterEvidence(Array.from(e.target.files ?? []))}
                        style={{ fontSize: 14 }}
                    />
                    {afterEvidence.length > 0 && (
                        <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                            {afterEvidence.length} archivo(s) seleccionados
                        </div>
                    )}
                </div>

                {/* Checklist */}
                <div className="card" style={{ padding: 14, marginBottom: 24, fontSize: 14 }}>
                    <h4 style={{ margin: `0 0 8px`, fontSize: 14, color: "#888" }}>Verificación antes de cerrar:</h4>
                    <ul style={{ margin: 0, paddingLeft: 20, color: "#555", lineHeight: 1.8 }}>
                        <li>Orden de trabajo completada</li>
                        <li>Registro de tiempo finalizado</li>
                        <li>Materiales marcados como consumidos</li>
                        <li>Evidencia fotográfica adjunta</li>
                    </ul>
                </div>

                <button
                    type="submit"
                    disabled={submitting || !resolutionNotes.trim()}
                    className="btn btn-secondary"
                    style={{ width: "100%", opacity: submitting ? 0.6 : 1 }}
                >
                    {submitting ? "Cerrando…" : "Confirmar Cierre"}
                </button>
            </form>
        </div>
    );
}
