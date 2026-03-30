// ═══════════════════════════════════════════════════════════════
// SurveyScreen – 3-dimension satisfaction survey after ticket
// closure  (satisfaction, resolution_quality, technician_rating)
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header, StarRating } from "../components";
import { useAppContext } from "../hooks/useAppContext";
import { theme } from "../theme";

// ── Dataverse service stub ─────────────────────────────────────
async function submitSurvey(_payload: Record<string, unknown>): Promise<void> { }

interface SurveyForm {
    satisfaction: number;
    resolutionQuality: number;
    technicianRating: number;
    comments: string;
}

const INITIAL: SurveyForm = { satisfaction: 0, resolutionQuality: 0, technicianRating: 0, comments: "" };

// ── SVG icons ──────────────────────────────────────────────────
const CheckCircle = () => (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={theme.colors.success} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" />
    </svg>
);

const SendIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

export function SurveyScreen() {
    const { ticketId } = useParams<{ ticketId: string }>();
    const { context } = useAppContext();
    const navigate = useNavigate();

    const [form, setForm] = useState<SurveyForm>(INITIAL);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [focused, setFocused] = useState(false);

    const canSubmit = form.satisfaction > 0 && form.resolutionQuality > 0 && form.technicianRating > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit || !context || !ticketId) return;
        setSubmitting(true);
        try {
            await submitSurvey({
                "cr_Ticket@odata.bind": `/cr_tickets(${ticketId})`,
                cr_respondent: context.user.objectId,
                cr_satisfaction_rating: form.satisfaction,
                cr_resolution_quality: form.resolutionQuality,
                cr_technician_professionalism: form.technicianRating,
                cr_additional_comments: form.comments || undefined,
            });
            setSubmitted(true);
        } catch (err) {
            console.error("Error submitting survey:", err);
            alert("Error al enviar la encuesta. Intente nuevamente.");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Thank-you state ──────────────────────────────────────────
    if (submitted) {
        return (
            <div className="page-wrapper">
                <Header title="Encuesta" showBack />
                <h2 className="desktop-page-title" style={{ textAlign: 'center' }}>Encuesta Completada</h2>
                <div
                    className="fade-in-up"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "48px 24px",
                        gap: "16px",
                        textAlign: "center",
                    }}
                >
                    {/* Gradient hero circle */}
                    <div style={{
                        width: 96,
                        height: 96,
                        borderRadius: "50%",
                        background: theme.colors.successGhost,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 0 0 12px ${theme.colors.success}10`,
                    }}>
                        <CheckCircle />
                    </div>
                    <h2 style={{
                        margin: 0,
                        color: theme.colors.text,
                        fontWeight: theme.fontWeights.bold,
                        fontSize: theme.fontSizes.xl,
                    }}>
                        ¡Gracias por tus comentarios!
                    </h2>
                    <p style={{
                        color: theme.colors.textSecondary,
                        fontSize: theme.fontSizes.sm,
                        maxWidth: 300,
                        lineHeight: 1.6,
                        margin: 0,
                    }}>
                        Tu evaluación nos ayuda a mejorar el servicio de mantenimiento de Zamorano.
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/")}
                        style={{
                            padding: "14px 40px",
                            borderRadius: theme.borderRadius.lg,
                            marginTop: "8px",
                        }}
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    // ── Survey form ──────────────────────────────────────────────
    return (
        <div className="page-wrapper">
            <Header title="Encuesta de Satisfacción" showBack />
            <button className="desktop-back-btn" onClick={() => navigate(-1)}>← Volver</button>
            <h2 className="desktop-page-title">Encuesta de Satisfacción</h2>

            <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
                {/* Intro card */}
                <div
                    className="fade-in-up"
                    style={{
                        background: theme.colors.primaryGhost,
                        border: `1px solid ${theme.colors.primary}20`,
                        borderRadius: theme.borderRadius.lg,
                        padding: "16px",
                        marginBottom: "24px",
                    }}
                >
                    <p style={{
                        margin: 0,
                        color: theme.colors.primaryDark,
                        fontSize: theme.fontSizes.sm,
                        fontWeight: theme.fontWeights.medium,
                        lineHeight: 1.6,
                    }}>
                        Tu opinión es muy importante. Califica tu experiencia en cada dimensión.
                    </p>
                </div>

                <StarRating
                    label="1. Satisfacción General"
                    value={form.satisfaction}
                    onChange={(v) => setForm((f) => ({ ...f, satisfaction: v }))}
                />

                <StarRating
                    label="2. Calidad de la Resolución"
                    value={form.resolutionQuality}
                    onChange={(v) => setForm((f) => ({ ...f, resolutionQuality: v }))}
                />

                <StarRating
                    label="3. Profesionalismo del Técnico"
                    value={form.technicianRating}
                    onChange={(v) => setForm((f) => ({ ...f, technicianRating: v }))}
                />

                {/* Comments field */}
                <div className="fade-in-up" style={{ marginBottom: "24px" }}>
                    <label style={{
                        display: "block",
                        marginBottom: "6px",
                        fontSize: theme.fontSizes.sm,
                        fontWeight: theme.fontWeights.semibold,
                        color: theme.colors.text,
                    }}>
                        Comentarios Adicionales
                        <span style={{ fontWeight: theme.fontWeights.normal, color: theme.colors.textTertiary, marginLeft: 4 }}>(opcional)</span>
                    </label>
                    <textarea
                        value={form.comments}
                        onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder="¿Hay algo más que quieras compartir?"
                        maxLength={1000}
                        style={{
                            width: "100%",
                            minHeight: 100,
                            padding: "12px 14px",
                            fontSize: theme.fontSizes.sm,
                            border: `1.5px solid ${focused ? theme.colors.primary : theme.colors.border}`,
                            borderRadius: theme.borderRadius.md,
                            resize: "vertical",
                            boxSizing: "border-box",
                            fontFamily: "inherit",
                            lineHeight: 1.6,
                            transition: theme.transitions.normal,
                            boxShadow: focused ? theme.shadows.glow : "none",
                            outline: "none",
                            background: theme.colors.surface,
                        }}
                    />
                    <div style={{
                        textAlign: "right",
                        fontSize: theme.fontSizes.xs,
                        color: theme.colors.textTertiary,
                        marginTop: "4px",
                    }}>
                        {form.comments.length} / 1000
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!canSubmit || submitting}
                    style={{
                        width: "100%",
                        padding: "16px",
                        fontSize: theme.fontSizes.md,
                        fontWeight: theme.fontWeights.semibold,
                        borderRadius: theme.borderRadius.lg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                    }}
                >
                    {submitting ? "Enviando…" : (<><SendIcon /> Enviar Encuesta</>)}
                </button>
            </form>
        </div>
    );
}
