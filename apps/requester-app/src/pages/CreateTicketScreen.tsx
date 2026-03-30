// ═══════════════════════════════════════════════════════════════
// CreateTicketScreen – modern multi-step wizard
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header, LoadingSpinner } from "../components";
import { useAppContext } from "../hooks/useAppContext";
import { theme } from "../theme";
import { TicketPriority, ticketPriorityLabels } from "@shared/types";

// ── Dataverse service stubs ────────────────────────────────────
interface PickerOption { id: string; name: string; }

async function fetchCategories(): Promise<PickerOption[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [
        { id: "cat-01", name: "Plomería" },
        { id: "cat-02", name: "Electricidad" },
        { id: "cat-03", name: "HVAC" },
        { id: "cat-04", name: "Cerrajería" },
        { id: "cat-05", name: "Obra Civil" },
        { id: "cat-06", name: "Jardinería" },
        { id: "cat-07", name: "Limpieza" },
    ];
}

async function fetchSubcategories(categoryId: string): Promise<PickerOption[]> {
    await new Promise((r) => setTimeout(r, 200));
    const map: Record<string, PickerOption[]> = {
        "cat-01": [
            { id: "sub-01", name: "Fugas" },
            { id: "sub-02", name: "Drenajes tapados" },
            { id: "sub-03", name: "Grifería" },
        ],
        "cat-02": [
            { id: "sub-04", name: "Iluminación" },
            { id: "sub-05", name: "Tomacorrientes" },
            { id: "sub-06", name: "Tableros eléctricos" },
        ],
        "cat-03": [
            { id: "sub-07", name: "Aire Acondicionado" },
            { id: "sub-08", name: "Ventilación" },
            { id: "sub-09", name: "Calefacción" },
        ],
        "cat-05": [
            { id: "sub-10", name: "Techos" },
            { id: "sub-11", name: "Pisos" },
            { id: "sub-12", name: "Paredes" },
        ],
    };
    return map[categoryId] ?? [];
}

async function fetchLocations(): Promise<PickerOption[]> {
    await new Promise((r) => setTimeout(r, 250));
    return [
        { id: "loc-01", name: "Edificio Académico" },
        { id: "loc-02", name: "Centro de Conferencias" },
        { id: "loc-03", name: "Residencias Estudiantiles" },
        { id: "loc-04", name: "Laboratorio de Ciencias" },
        { id: "loc-05", name: "Cafetería Central" },
        { id: "loc-06", name: "Edificio Administrativo" },
        { id: "loc-07", name: "Biblioteca" },
        { id: "loc-08", name: "Gimnasio" },
        { id: "loc-09", name: "Áreas Verdes" },
    ];
}
async function submitTicket(_payload: Record<string, unknown>): Promise<{ id: string }> {
    return { id: "new-ticket-id" };
}

// ── Form state ─────────────────────────────────────────────────
interface FormState {
    title: string;
    description: string;
    categoryId: string;
    subcategoryId: string;
    locationId: string;
    priority: TicketPriority;
    evidence: File[];
}

const INITIAL: FormState = {
    title: "",
    description: "",
    categoryId: "",
    subcategoryId: "",
    locationId: "",
    priority: TicketPriority.Medium,
    evidence: [],
};

// ── SVG icons ──────────────────────────────────────────────────
const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const UploadIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const XIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export function CreateTicketScreen() {
    const { context, selectedArea } = useAppContext();
    const navigate = useNavigate();

    const [form, setForm] = useState<FormState>(INITIAL);
    const [categories, setCategories] = useState<PickerOption[]>([]);
    const [subcategories, setSubcategories] = useState<PickerOption[]>([]);
    const [locations, setLocations] = useState<PickerOption[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        fetchCategories().then(setCategories);
        fetchLocations().then(setLocations);
    }, []);

    useEffect(() => {
        if (form.categoryId) {
            fetchSubcategories(form.categoryId).then(setSubcategories);
            setForm((f) => ({ ...f, subcategoryId: "" }));
        } else {
            setSubcategories([]);
        }
    }, [form.categoryId]);

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        set("evidence", [...form.evidence, ...files].slice(0, 5));
    };

    const removeFile = (idx: number) => {
        set("evidence", form.evidence.filter((_, i) => i !== idx));
    };

    const handleSubmit = async () => {
        if (!context) return;
        setSubmitting(true);
        try {
            const result = await submitTicket({
                cr_title: form.title,
                cr_description: form.description,
                "cr_Category@odata.bind": `/cr_categories(${form.categoryId})`,
                "cr_Subcategory@odata.bind": form.subcategoryId
                    ? `/cr_subcategories(${form.subcategoryId})`
                    : undefined,
                "cr_Location@odata.bind": `/cr_locations(${form.locationId})`,
                cr_priority: form.priority,
                cr_reported_by: context.user.objectId,
                cr_service_area: selectedArea,
            });
            navigate(`/tickets/${result.id}`);
        } catch (err) {
            console.error("Error creating ticket:", err);
            alert("Error al crear el ticket. Intente nuevamente.");
        } finally {
            setSubmitting(false);
        }
    };

    const canProceedStep0 = form.title.length >= 5 && form.categoryId;
    const canProceedStep1 = form.locationId;
    const canSubmit = canProceedStep0 && canProceedStep1;

    // ── Shared styles ────────────────────────────────────────────
    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "12px 14px",
        fontSize: theme.fontSizes.sm,
        fontFamily: "inherit",
        border: `1.5px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.md,
        boxSizing: "border-box",
        background: theme.colors.surface,
        color: theme.colors.text,
        transition: `border-color ${theme.transitions.normal}, box-shadow ${theme.transitions.normal}`,
        outline: "none",
    };

    const labelStyle: React.CSSProperties = {
        display: "block",
        marginBottom: "6px",
        fontSize: theme.fontSizes.sm,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.text,
    };

    const fieldGap: React.CSSProperties = { marginBottom: "20px" };

    const stepLabels = ["Detalles", "Ubicación", "Revisar"];

    return (
        <div className="page-wrapper">
            <Header title="Nuevo Ticket" showBack />
            <div className="create-ticket-layout">
                <button className="desktop-back-btn" onClick={() => navigate(-1)}>← Volver</button>
                <h2 className="desktop-page-title">Nuevo Ticket</h2>

                {/* ── Step progress bar ───────────────────────────── */}
                <div className="step-bar create-ticket-stepper" style={{ padding: "20px 24px 8px" }}>
                    <div style={{ position: "relative", maxWidth: 360, margin: "0 auto" }}>
                        <div
                            style={{
                                position: "absolute",
                                left: 14,
                                right: 14,
                                top: 14,
                                height: 2,
                                background: theme.colors.border,
                                borderRadius: 999,
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    width: `${(step / (stepLabels.length - 1)) * 100}%`,
                                    background: theme.colors.primary,
                                    borderRadius: 999,
                                    transition: `width ${theme.transitions.smooth}`,
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
                            {stepLabels.map((label, i) => (
                                <div key={label} style={{ width: 88, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                                    <div style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: theme.fontSizes.xs,
                                        fontWeight: theme.fontWeights.bold,
                                        background: i <= step ? theme.colors.primary : theme.colors.border,
                                        color: i <= step ? "#fff" : theme.colors.textTertiary,
                                        transition: `all ${theme.transitions.smooth}`,
                                        boxShadow: i === step ? theme.shadows.glow : "none",
                                    }}>
                                        {i < step ? <CheckIcon /> : i + 1}
                                    </div>
                                    <span style={{
                                        fontSize: "0.65rem",
                                        fontWeight: i === step ? theme.fontWeights.semibold : theme.fontWeights.medium,
                                        color: i <= step ? theme.colors.primary : theme.colors.textTertiary,
                                        whiteSpace: "nowrap",
                                        textAlign: "center",
                                    }}>
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <form
                    className="create-ticket-form"
                    style={{ padding: "8px 24px 0" }}
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (step < 2) setStep(step + 1);
                        else handleSubmit();
                    }}
                >
                    {/* ── Step 0: Details ───────────────────────────── */}
                    {step === 0 && (
                        <div className="fade-in-up">
                            <div style={fieldGap}>
                                <label style={labelStyle}>Título <span style={{ color: theme.colors.error }}>*</span></label>
                                <input
                                    style={inputStyle}
                                    placeholder="Ej: Fuga de agua en baño planta baja"
                                    value={form.title}
                                    onChange={(e) => set("title", e.target.value)}
                                    maxLength={200}
                                    required
                                    onFocus={(e) => { e.currentTarget.style.borderColor = theme.colors.primary; e.currentTarget.style.boxShadow = theme.shadows.glow; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = theme.colors.border; e.currentTarget.style.boxShadow = "none"; }}
                                />
                                <span style={{ fontSize: "0.7rem", color: theme.colors.textTertiary, marginTop: 2 }}>
                                    {form.title.length}/200
                                </span>
                            </div>

                            <div style={fieldGap}>
                                <label style={labelStyle}>Descripción</label>
                                <textarea
                                    style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                                    placeholder="Describe el problema con el mayor detalle posible…"
                                    value={form.description}
                                    onChange={(e) => set("description", e.target.value)}
                                    maxLength={2000}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = theme.colors.primary; e.currentTarget.style.boxShadow = theme.shadows.glow; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = theme.colors.border; e.currentTarget.style.boxShadow = "none"; }}
                                />
                            </div>

                            <div style={fieldGap}>
                                <label style={labelStyle}>Categoría <span style={{ color: theme.colors.error }}>*</span></label>
                                <select style={inputStyle} value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} required>
                                    <option value="">— Seleccionar —</option>
                                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            {subcategories.length > 0 && (
                                <div style={fieldGap}>
                                    <label style={labelStyle}>Subcategoría</label>
                                    <select style={inputStyle} value={form.subcategoryId} onChange={(e) => set("subcategoryId", e.target.value)}>
                                        <option value="">— Seleccionar —</option>
                                        {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <div style={fieldGap}>
                                <label style={labelStyle}>Prioridad</label>
                                <select style={inputStyle} value={form.priority} onChange={(e) => set("priority", Number(e.target.value) as TicketPriority)}>
                                    {Object.entries(ticketPriorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>

                            <div style={fieldGap}>
                                <label style={labelStyle}>Evidencia fotográfica (máx 5)</label>
                                <label
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "20px",
                                        border: `2px dashed ${theme.colors.border}`,
                                        borderRadius: theme.borderRadius.lg,
                                        cursor: "pointer",
                                        color: theme.colors.textSecondary,
                                        fontSize: theme.fontSizes.sm,
                                        transition: `border-color ${theme.transitions.normal}`,
                                        background: theme.colors.background,
                                    }}
                                >
                                    <UploadIcon />
                                    <span>Toca para adjuntar archivos</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        style={{ display: "none" }}
                                    />
                                </label>
                                {form.evidence.length > 0 && (
                                    <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                                        {form.evidence.map((f, i) => (
                                            <span
                                                key={i}
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    fontSize: theme.fontSizes.xs,
                                                    background: theme.colors.primaryGhost,
                                                    color: theme.colors.primary,
                                                    padding: "4px 10px",
                                                    borderRadius: theme.borderRadius.full,
                                                    fontWeight: theme.fontWeights.medium,
                                                }}
                                            >
                                                {f.name.slice(0, 18)}
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(i)}
                                                    style={{
                                                        background: "none",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        color: theme.colors.primary,
                                                        padding: 0,
                                                        display: "flex",
                                                    }}
                                                >
                                                    <XIcon />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={!canProceedStep0}
                                style={{ width: "100%", padding: "14px", borderRadius: theme.borderRadius.lg }}
                            >
                                Siguiente
                            </button>
                        </div>
                    )}

                    {/* ── Step 1: Location ──────────────────────────── */}
                    {step === 1 && (
                        <div className="fade-in-up">
                            <div style={fieldGap}>
                                <label style={labelStyle}>Ubicación <span style={{ color: theme.colors.error }}>*</span></label>
                                <select style={inputStyle} value={form.locationId} onChange={(e) => set("locationId", e.target.value)} required>
                                    <option value="">— Seleccionar ubicación —</option>
                                    {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>

                            <div style={{ display: "flex", gap: "10px" }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setStep(0)}
                                    style={{ flex: 1, padding: "14px", borderRadius: theme.borderRadius.lg }}
                                >
                                    Atrás
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={!canProceedStep1}
                                    style={{ flex: 1, padding: "14px", borderRadius: theme.borderRadius.lg }}
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Review ────────────────────────────── */}
                    {step === 2 && (
                        <div className="fade-in-up">
                            <div
                                className="ui-surface"
                                style={{
                                    padding: "20px",
                                    background: theme.gradients.surface,
                                    marginBottom: "20px",
                                }}
                            >
                                <h3 style={{
                                    margin: "0 0 16px",
                                    fontSize: theme.fontSizes.lg,
                                    fontWeight: theme.fontWeights.semibold,
                                    color: theme.colors.text,
                                }}>
                                    Resumen del Ticket
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    <ReviewRow label="Título" value={form.title} />
                                    <ReviewRow label="Descripción" value={form.description || "—"} />
                                    <ReviewRow
                                        label="Categoría"
                                        value={
                                            (categories.find((c) => c.id === form.categoryId)?.name ?? "—") +
                                            (form.subcategoryId ? ` / ${subcategories.find((s) => s.id === form.subcategoryId)?.name}` : "")
                                        }
                                    />
                                    <ReviewRow label="Ubicación" value={locations.find((l) => l.id === form.locationId)?.name ?? "—"} />
                                    <ReviewRow label="Prioridad" value={ticketPriorityLabels[form.priority]} />
                                </div>

                                {form.evidence.length > 0 && (
                                    <p style={{ marginTop: "14px", fontSize: theme.fontSizes.xs, color: theme.colors.textSecondary }}>
                                        {form.evidence.length} archivo(s) adjuntos
                                    </p>
                                )}
                            </div>

                            <div style={{ display: "flex", gap: "10px" }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setStep(1)}
                                    style={{ flex: 1, padding: "14px", borderRadius: theme.borderRadius.lg }}
                                >
                                    Atrás
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={!canSubmit || submitting}
                                    style={{ flex: 2, padding: "14px", borderRadius: theme.borderRadius.lg }}
                                >
                                    {submitting ? <LoadingSpinner message="Enviando…" /> : "Enviar Ticket"}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

// ── Review row helper ──────────────────────────────────────────
function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "8px 0",
            borderBottom: `1px solid ${theme.colors.borderLight}`,
            fontSize: theme.fontSizes.sm,
        }}>
            <span style={{ color: theme.colors.textSecondary, fontWeight: theme.fontWeights.medium }}>{label}</span>
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
