// ═══════════════════════════════════════════════════════════════
// QueueManagement – Supervisor can view all tickets, assign /
// reassign technicians, change priority, bulk actions
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    TicketStatus,
    TicketPriority,
    ticketStatusLabels,
    ticketStatusColors,
    ticketPriorityLabels,
    ticketPriorityColors,
} from "@shared/types";
import {
    CategorySkillMapping,
    fetchCategorySkillMappings,
    fetchTechnicianSkills,
    getRequiredSkillForCategory,
    normalizeText,
    technicianAssignScore,
    technicianSkillLevel,
    TechnicianSkillProfile,
} from "../utils/skillsData";

interface QueueItem {
    id: string;
    ticketNumber: string;
    title: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdOn: string;
    categoryName: string;
    locationName: string;
    assignedTo?: string;
    slaDeadline?: string;
}

// ── Dataverse stubs ────────────────────────────────────────────
async function fetchAllTickets(): Promise<QueueItem[]> {
    return [];
}
async function assignTicket(_ticketId: string, _techId: string): Promise<void> { }
async function bulkAssign(_ticketIds: string[], _techId: string): Promise<void> { }

export function QueueManagement() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<QueueItem[]>([]);
    const [technicians, setTechnicians] = useState<TechnicianSkillProfile[]>([]);
    const [categorySkillMappings, setCategorySkillMappings] = useState<CategorySkillMapping[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [statusFilter, setStatusFilter] = useState<"all" | TicketStatus>("all");
    const [priorityFilter, setPriorityFilter] = useState<"all" | TicketPriority>("all");
    const [search, setSearch] = useState("");
    const [assignModal, setAssignModal] = useState<string | null>(null); // ticketId or "bulk"
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([fetchAllTickets(), fetchTechnicianSkills(), fetchCategorySkillMappings()]).then(([t, techs, mappings]) => {
            setTickets(t);
            setTechnicians(techs);
            setCategorySkillMappings(mappings);
            setLoading(false);
        });
    }, []);

    const filtered = tickets.filter((t) => {
        if (statusFilter !== "all" && t.status !== statusFilter) return false;
        if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            return t.title.toLowerCase().includes(q) || t.ticketNumber.toLowerCase().includes(q);
        }
        return true;
    });

    const toggleSelect = (id: string) => {
        setSelected((prev) => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
    };

    const selectAll = () => {
        if (selected.size === filtered.length) setSelected(new Set());
        else setSelected(new Set(filtered.map((t) => t.id)));
    };

    const handleAssign = async (techId: string) => {
        if (assignModal === "bulk") {
            await bulkAssign([...selected], techId);
        } else if (assignModal) {
            await assignTicket(assignModal, techId);
        }
        setAssignModal(null);
        setSelected(new Set());
        // Reload
        const t = await fetchAllTickets();
        setTickets(t);
    };

    const fmt = (d: string) => new Date(d).toLocaleDateString("es-HN", { day: "2-digit", month: "short" });
    const selectedTicket = assignModal && assignModal !== "bulk"
        ? tickets.find((ticket) => ticket.id === assignModal)
        : null;
    const requiredSkill = selectedTicket
        ? getRequiredSkillForCategory(selectedTicket.categoryName, categorySkillMappings)
        : null;
    const technicianWorkload = new Map(
        technicians.map((tech) => [
            tech.id,
            tickets.filter((ticket) => normalizeText(ticket.assignedTo ?? "") === normalizeText(tech.name)).length,
        ]),
    );
    const recommendedTechnicians = [...technicians].sort(
        (a, b) =>
            technicianAssignScore(b, requiredSkill, technicianWorkload.get(b.id) ?? 0)
            - technicianAssignScore(a, requiredSkill, technicianWorkload.get(a.id) ?? 0),
    );

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h1 className="page-title" style={{ marginBottom: 0 }}>Gestión de Cola</h1>
                {selected.size > 0 && (
                    <button
                        onClick={() => setAssignModal("bulk")}
                        className="btn btn-primary"
                    >
                        Asignar {selected.size} seleccionados
                    </button>
                )}
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                <input
                    type="search"
                    placeholder="Buscar…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-control"
                    style={{ minWidth: 200 }}
                />
                <select
                    value={String(statusFilter)}
                    onChange={(e) => setStatusFilter(e.target.value === "all" ? "all" : Number(e.target.value) as TicketStatus)}
                    className="input-control"
                >
                    <option value="all">Todos los estados</option>
                    {Object.entries(ticketStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select
                    value={String(priorityFilter)}
                    onChange={(e) => setPriorityFilter(e.target.value === "all" ? "all" : Number(e.target.value) as TicketPriority)}
                    className="input-control"
                >
                    <option value="all">Todas las prioridades</option>
                    {Object.entries(ticketPriorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <p style={{ textAlign: "center", color: "#888", padding: 40 }}>Cargando…</p>
            ) : filtered.length === 0 ? (
                <p style={{ textAlign: "center", color: "#888", padding: 40 }}>No se encontraron tickets.</p>
            ) : (
                <div className="table-shell" style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                                <th style={{ padding: 10 }}>
                                    <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={selectAll} />
                                </th>
                                <th style={{ textAlign: "left", padding: 10 }}>#</th>
                                <th style={{ textAlign: "left", padding: 10 }}>Título</th>
                                <th style={{ textAlign: "center", padding: 10 }}>Prioridad</th>
                                <th style={{ textAlign: "center", padding: 10 }}>Estado</th>
                                <th style={{ textAlign: "left", padding: 10 }}>Categoría</th>
                                <th style={{ textAlign: "left", padding: 10 }}>Ubicación</th>
                                <th style={{ textAlign: "left", padding: 10 }}>Asignado</th>
                                <th style={{ textAlign: "center", padding: 10 }}>Fecha</th>
                                <th style={{ textAlign: "center", padding: 10 }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((t) => {
                                const slaWarn = t.slaDeadline && new Date(t.slaDeadline).getTime() < Date.now();
                                return (
                                    <tr key={t.id} style={{ borderBottom: "1px solid #f3f4f6", background: slaWarn ? "#FEF2F2" : undefined }}>
                                        <td style={{ padding: 10, textAlign: "center" }}>
                                            <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleSelect(t.id)} />
                                        </td>
                                        <td style={{ padding: 10 }}>
                                            <button onClick={() => navigate(`/tickets/${t.id}`)} style={{ background: "none", border: "none", cursor: "pointer", color: "#2563EB", fontWeight: 600 }}>
                                                {t.ticketNumber}
                                            </button>
                                        </td>
                                        <td style={{ padding: 10 }}>{t.title}</td>
                                        <td style={{ padding: 10, textAlign: "center" }}>
                                            <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600, color: "#fff", background: ticketPriorityColors[t.priority] }}>
                                                {ticketPriorityLabels[t.priority]}
                                            </span>
                                        </td>
                                        <td style={{ padding: 10, textAlign: "center" }}>
                                            <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600, color: "#fff", background: ticketStatusColors[t.status] }}>
                                                {ticketStatusLabels[t.status]}
                                            </span>
                                        </td>
                                        <td style={{ padding: 10 }}>{t.categoryName}</td>
                                        <td style={{ padding: 10 }}>{t.locationName}</td>
                                        <td style={{ padding: 10 }}>{t.assignedTo ?? "—"}</td>
                                        <td style={{ padding: 10, textAlign: "center" }}>{fmt(t.createdOn)}</td>
                                        <td style={{ padding: 10, textAlign: "center" }}>
                                            <button
                                                onClick={() => setAssignModal(t.id)}
                                                className="btn btn-outline"
                                                style={{ padding: "6px 10px", fontSize: 12 }}
                                            >
                                                Asignar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Assign modal */}
            {assignModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div className="card" style={{ padding: 24, minWidth: 320, maxWidth: 400 }}>
                        <h3 style={{ margin: `0 0 16px`, fontSize: 16 }}>Asignar Técnico</h3>
                        {requiredSkill && (
                            <p style={{ margin: "-8px 0 12px", fontSize: 12, color: "#6B7280" }}>
                                Habilidad requerida para esta categoría: <strong>{requiredSkill}</strong>
                            </p>
                        )}
                        {technicians.length === 0 ? (
                            <p style={{ color: "#888", fontSize: 13 }}>No hay técnicos disponibles.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {recommendedTechnicians.map((tech, index) => {
                                    const matchedLevel = technicianSkillLevel(tech, requiredSkill);
                                    const activeTickets = technicianWorkload.get(tech.id) ?? 0;
                                    const isRecommended = index === 0 && matchedLevel > 0;

                                    return (
                                        <button
                                            key={tech.id}
                                            onClick={() => handleAssign(tech.id)}
                                            className="btn btn-outline"
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "flex-start",
                                                fontSize: 14,
                                            }}
                                        >
                                            <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                                                <span>{tech.name}</span>
                                                <span style={{ fontSize: 11, color: "#6B7280" }}>
                                                    {Object.entries(tech.skills).map(([skill, level]) => `${skill} (${level}/5)`).join(" · ") || "Sin habilidades registradas"}
                                                </span>
                                                {requiredSkill && (
                                                    <span style={{ fontSize: 11, color: matchedLevel > 0 ? "#00643E" : "#B91C1C", fontWeight: 600 }}>
                                                        {matchedLevel > 0 ? `Match ${requiredSkill} (${matchedLevel}/5)` : `Sin match en ${requiredSkill}`}
                                                    </span>
                                                )}
                                            </span>
                                            <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                                                <span style={{ fontSize: 12, color: "#888" }}>{activeTickets} activos</span>
                                                {isRecommended && (
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#00643E" }}>Recomendado</span>
                                                )}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        <button
                            onClick={() => setAssignModal(null)}
                            className="btn btn-outline"
                            style={{ marginTop: 12, width: "100%" }}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
