// ═══════════════════════════════════════════════════════════════
// OperationsDashboard – real-time KPIs: open tickets, SLA
// compliance, avg resolution time, satisfaction, cost, workload
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import {
    TicketStatus,
    TicketPriority,
    ticketStatusLabels,
    ticketStatusColors,
    ticketPriorityLabels,
} from "@shared/types";

// ── Types ──────────────────────────────────────────────────────
interface DashboardKPIs {
    openTickets: number;
    inProgress: number;
    onHold: number;
    closedToday: number;
    slaCompliancePercent: number;
    avgResolutionHours: number;
    avgSatisfaction: number;
    totalCostMonth: number;
    ticketsByPriority: Record<TicketPriority, number>;
    ticketsByStatus: Record<TicketStatus, number>;
    technicianWorkload: { name: string; active: number; closedToday: number }[];
}

// ── Dataverse stubs ────────────────────────────────────────────
async function fetchDashboard(): Promise<DashboardKPIs> {
    return {
        openTickets: 0,
        inProgress: 0,
        onHold: 0,
        closedToday: 0,
        slaCompliancePercent: 0,
        avgResolutionHours: 0,
        avgSatisfaction: 0,
        totalCostMonth: 0,
        ticketsByPriority: { [TicketPriority.Critical]: 0, [TicketPriority.High]: 0, [TicketPriority.Medium]: 0, [TicketPriority.Low]: 0 },
        ticketsByStatus: {
            [TicketStatus.New]: 0,
            [TicketStatus.Assigned]: 0,
            [TicketStatus.InDiagnosis]: 0,
            [TicketStatus.InProgress]: 0,
            [TicketStatus.OnHold]: 0,
            [TicketStatus.Resolved]: 0,
            [TicketStatus.Closed]: 0,
            [TicketStatus.Cancelled]: 0,
        },
        technicianWorkload: [],
    };
}

export function OperationsDashboard() {
    const [data, setData] = useState<DashboardKPIs | null>(null);

    useEffect(() => {
        fetchDashboard().then(setData);
        const interval = setInterval(() => fetchDashboard().then(setData), 60_000);
        return () => clearInterval(interval);
    }, []);

    if (!data) return <p style={{ padding: 40, textAlign: "center", color: "#888" }}>Cargando dashboard…</p>;

    return (
        <div style={{ padding: 24 }}>
            <h1 className="page-title" style={{ marginBottom: 24 }}>Panel de Operaciones</h1>

            {/* KPI row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
                <KpiCard label="Tickets Abiertos" value={data.openTickets} color="#00643E" />
                <KpiCard label="En Progreso" value={data.inProgress} color="#2563EB" />
                <KpiCard label="En Espera" value={data.onHold} color="#F59E0B" />
                <KpiCard label="Cerrados Hoy" value={data.closedToday} color="#10B981" />
                <KpiCard label="Cumplimiento SLA" value={`${data.slaCompliancePercent}%`} color={data.slaCompliancePercent >= 90 ? "#10B981" : "#DC2626"} />
                <KpiCard label="Resolución Promedio" value={`${data.avgResolutionHours}h`} color="#6B7280" />
                <KpiCard label="Satisfacción" value={`${data.avgSatisfaction.toFixed(1)}/5`} color="#F59E0B" />
                <KpiCard label="Costo Mensual" value={`L ${data.totalCostMonth.toLocaleString()}`} color="#8B5CF6" />
            </div>

            {/* Ticket distribution by status */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ margin: `0 0 12px`, fontSize: 15 }}>Por Estado</h3>
                    {(Object.entries(data.ticketsByStatus) as [string, number][]).map(([key, count]) => {
                        const status = Number(key) as TicketStatus;
                        return (
                            <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: ticketStatusColors[status] }} />
                                    {ticketStatusLabels[status]}
                                </div>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{count}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ margin: `0 0 12px`, fontSize: 15 }}>Por Prioridad</h3>
                    {(Object.entries(data.ticketsByPriority) as [string, number][]).map(([key, count]) => {
                        const prio = Number(key) as TicketPriority;
                        return (
                            <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                                <span style={{ fontSize: 13 }}>{ticketPriorityLabels[prio]}</span>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Technician workload */}
            <div className="card" style={{ padding: 20 }}>
                <h3 style={{ margin: `0 0 12px`, fontSize: 15 }}>Carga de Trabajo por Técnico</h3>
                {data.technicianWorkload.length === 0 ? (
                    <p style={{ color: "#888", fontSize: 13 }}>Sin datos disponibles.</p>
                ) : (
                    <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #e5e7eb", color: "#888" }}>
                                <th style={{ textAlign: "left", padding: 6 }}>Técnico</th>
                                <th style={{ textAlign: "center", padding: 6 }}>Activos</th>
                                <th style={{ textAlign: "center", padding: 6 }}>Cerrados Hoy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.technicianWorkload.map((t) => (
                                <tr key={t.name} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: 6 }}>{t.name}</td>
                                    <td style={{ padding: 6, textAlign: "center", fontWeight: 600 }}>{t.active}</td>
                                    <td style={{ padding: 6, textAlign: "center" }}>{t.closedToday}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function KpiCard({ label, value, color }: { label: string; value: string | number; color: string }) {
    return (
        <div className="card" style={{ padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{label}</div>
        </div>
    );
}
