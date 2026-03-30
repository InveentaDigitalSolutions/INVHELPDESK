// ═══════════════════════════════════════════════════════════════
// DashboardScreen – Technician's main queue / KPI dashboard
// Shows assigned tickets sorted by priority + SLA urgency
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    TicketStatus,
    TicketPriority,
    ticketStatusLabels,
    ticketPriorityLabels,
} from "@shared/types";
import { fetchTechnicianQueue } from "../utils/mockTechnicianData";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";

// ── Dataverse service stub ─────────────────────────────────────
// Replace with generated service:
//   import { TicketService } from "../../generated/services/TicketService";

interface QueueTicket {
    id: string;
    ticketNumber: string;
    title: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdOn: string;
    locationName: string;
    categoryName: string;
    slaDeadline?: string; // ISO date of nearest SLA breach
}

async function fetchMyQueue(): Promise<QueueTicket[]> {
    return fetchTechnicianQueue();
}

// ── KPI helpers ────────────────────────────────────────────────
function isBreachingSoon(deadline?: string): boolean {
    if (!deadline) return false;
    return new Date(deadline).getTime() - Date.now() < 2 * 60 * 60 * 1000; // <2 h
}

export function DashboardScreen() {
    const navigate = useNavigate();
    const [queue, setQueue] = useState<QueueTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | TicketStatus>("all");
    const [priorityFilter, setPriorityFilter] = useState<"all" | TicketPriority>("all");

    useEffect(() => {
        fetchMyQueue().then((q) => {
            setQueue(q);
            setLoading(false);
        });
    }, []);

    const stats = {
        total: queue.length,
        inProgress: queue.filter((t) => t.status === TicketStatus.InProgress).length,
        urgent: queue.filter((t) => isBreachingSoon(t.slaDeadline)).length,
    };

    const filteredQueue = queue.filter((ticket) => {
        if (statusFilter !== "all" && ticket.status !== statusFilter) return false;
        if (priorityFilter !== "all" && ticket.priority !== priorityFilter) return false;
        if (search) {
            const query = search.toLowerCase();
            return (
                ticket.ticketNumber.toLowerCase().includes(query)
                || ticket.title.toLowerCase().includes(query)
                || ticket.locationName.toLowerCase().includes(query)
                || ticket.categoryName.toLowerCase().includes(query)
            );
        }
        return true;
    });

    return (
        <div style={{ padding: 16, maxWidth: 800, margin: "0 auto" }}>
            {/* Header */}
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h1 className="page-title" style={{ marginBottom: 0 }}>Mi Cola de Trabajo</h1>
            </header>

            {/* KPI cards */}
            <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
                <KpiCard label="Asignados" value={stats.total} color="#00643E" />
                <KpiCard label="En Progreso" value={stats.inProgress} color="#2563EB" />
                <KpiCard label="Urgentes SLA" value={stats.urgent} color="#DC2626" />
            </section>

            <section style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                <input
                    type="search"
                    className="input-control"
                    placeholder="Buscar por ticket, título, ubicación o categoría"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    style={{ flex: "1 1 260px" }}
                />
                <select
                    className="input-control"
                    value={String(statusFilter)}
                    onChange={(event) => setStatusFilter(event.target.value === "all" ? "all" : Number(event.target.value) as TicketStatus)}
                    style={{ flex: "1 1 180px" }}
                >
                    <option value="all">Todos los estados</option>
                    {Object.entries(ticketStatusLabels).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                    ))}
                </select>
                <select
                    className="input-control"
                    value={String(priorityFilter)}
                    onChange={(event) => setPriorityFilter(event.target.value === "all" ? "all" : Number(event.target.value) as TicketPriority)}
                    style={{ flex: "1 1 170px" }}
                >
                    <option value="all">Todas las prioridades</option>
                    {Object.entries(ticketPriorityLabels).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                    ))}
                </select>
                <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                        setSearch("");
                        setStatusFilter("all");
                        setPriorityFilter("all");
                    }}
                    style={{ flex: "0 0 auto", paddingInline: 14 }}
                >
                    Limpiar filtros
                </button>
            </section>

            {/* Queue list */}
            {loading ? (
                <p style={{ textAlign: "center", color: "#888" }}>Cargando cola…</p>
            ) : filteredQueue.length === 0 ? (
                <p style={{ textAlign: "center", color: "#888", padding: 40 }}>
                    No se encontraron tickets con esos filtros.
                </p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {filteredQueue.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => navigate(`/tickets/${t.id}`)}
                            className="card interactive-surface"
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: 14,
                                border: isBreachingSoon(t.slaDeadline) ? "2px solid #DC2626" : "1px solid #e5e7eb",
                                cursor: "pointer",
                                textAlign: "left",
                                width: "100%",
                            }}
                        >
                            <div>
                                <div style={{ fontSize: 13, color: "#888" }}>#{t.ticketNumber}</div>
                                <div style={{ fontWeight: 600, fontSize: 15 }}>{t.title}</div>
                                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                                    {t.categoryName} · {t.locationName}
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                                <PriorityBadge priority={t.priority} />
                                <StatusBadge status={t.status} />
                                {isBreachingSoon(t.slaDeadline) && (
                                    <span style={{ fontSize: 11, color: "#DC2626", fontWeight: 700 }}>⚠️ SLA</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function KpiCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="card" style={{ textAlign: "center", padding: 14 }}>
            <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{label}</div>
        </div>
    );
}
