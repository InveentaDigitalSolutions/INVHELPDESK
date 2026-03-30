// ═══════════════════════════════════════════════════════════════
// AnalyticsScreen – In-app analytics dashboard (no external BI)
// SLA, costs, satisfaction, categories and resolution trends
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";

interface AnalyticsData {
    slaByMonth: { month: string; compliance: number }[];
    avgResolutionByCategory: { category: string; hours: number }[];
    costByMonth: { month: string; materials: number; labor: number }[];
    satisfactionTrend: { month: string; avg: number }[];
    topCategories: { name: string; count: number }[];
}

const MOCK_ANALYTICS: AnalyticsData = {
    slaByMonth: [
        { month: "Oct", compliance: 88 },
        { month: "Nov", compliance: 90 },
        { month: "Dic", compliance: 92 },
        { month: "Ene", compliance: 91 },
        { month: "Feb", compliance: 94 },
    ],
    avgResolutionByCategory: [
        { category: "Plomería", hours: 6.2 },
        { category: "Electricidad", hours: 5.1 },
        { category: "HVAC", hours: 8.3 },
        { category: "Obra Civil", hours: 9.6 },
        { category: "Cerrajería", hours: 4.4 },
    ],
    costByMonth: [
        { month: "Oct", materials: 18200, labor: 12900 },
        { month: "Nov", materials: 20500, labor: 14100 },
        { month: "Dic", materials: 19600, labor: 13650 },
        { month: "Ene", materials: 21450, labor: 15200 },
        { month: "Feb", materials: 22700, labor: 15950 },
    ],
    satisfactionTrend: [
        { month: "Oct", avg: 4.2 },
        { month: "Nov", avg: 4.3 },
        { month: "Dic", avg: 4.4 },
        { month: "Ene", avg: 4.5 },
        { month: "Feb", avg: 4.6 },
    ],
    topCategories: [
        { name: "Plomería", count: 36 },
        { name: "Electricidad", count: 31 },
        { name: "HVAC", count: 25 },
        { name: "Obra Civil", count: 18 },
        { name: "Cerrajería", count: 14 },
    ],
};

async function fetchAnalytics(): Promise<AnalyticsData> {
    return MOCK_ANALYTICS;
}

export function AnalyticsScreen() {
    const [data, setData] = useState<AnalyticsData | null>(null);

    useEffect(() => { fetchAnalytics().then(setData); }, []);

    if (!data) return <p style={{ padding: 40, textAlign: "center", color: "#888" }}>Cargando analíticas…</p>;

    const totalTickets = data.topCategories.reduce((sum, item) => sum + item.count, 0);
    const avgSla = data.slaByMonth.reduce((sum, row) => sum + row.compliance, 0) / data.slaByMonth.length;
    const avgSatisfaction = data.satisfactionTrend.reduce((sum, row) => sum + row.avg, 0) / data.satisfactionTrend.length;
    const totalCost = data.costByMonth.reduce((sum, row) => sum + row.materials + row.labor, 0);

    return (
        <div style={{ padding: 24 }}>
            <h1 className="page-title" style={{ marginBottom: 24 }}>Analíticas</h1>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
                <KpiCard label="Tickets Analizados" value={totalTickets.toString()} accent="#00643E" />
                <KpiCard label="SLA Promedio" value={`${avgSla.toFixed(1)}%`} accent="#10B981" />
                <KpiCard label="Satisfacción Promedio" value={`${avgSatisfaction.toFixed(1)}/5`} accent="#F59E0B" />
                <KpiCard label="Costo Total (5 meses)" value={`L ${totalCost.toLocaleString()}`} accent="#2563EB" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <Card title="Cumplimiento SLA por Mes">
                    {data.slaByMonth.length === 0 ? <Empty /> : <LineTrendChart data={data.slaByMonth.map((d) => ({ label: d.month, value: d.compliance }))} color="#10B981" yMax={100} suffix="%" />}
                </Card>

                <Card title="Resolución Promedio por Categoría">
                    {data.avgResolutionByCategory.length === 0 ? <Empty /> : <HorizontalBars data={data.avgResolutionByCategory.map((d) => ({ label: d.category, value: d.hours }))} color="#00643E" suffix="h" decimals={1} />}
                </Card>

                <Card title="Costos Mensuales (L)">
                    {data.costByMonth.length === 0 ? <Empty /> : <StackedCostBars data={data.costByMonth} />}
                </Card>

                <Card title="Tendencia de Satisfacción">
                    {data.satisfactionTrend.length === 0 ? <Empty /> : <LineTrendChart data={data.satisfactionTrend.map((d) => ({ label: d.month, value: d.avg }))} color="#F59E0B" yMax={5} suffix="/5" decimals={1} />}
                </Card>

                <Card title="Categorías más Frecuentes (Top 5)">
                    {data.topCategories.length === 0 ? <Empty /> : <HorizontalBars data={data.topCategories.map((d) => ({ label: d.name, value: d.count }))} color="#2563EB" />}
                </Card>
            </div>
        </div>
    );
}

function KpiCard({ label, value, accent }: { label: string; value: string; accent: string }) {
    return (
        <div className="card" style={{ padding: 16 }}>
            <div style={{ color: "#6B7280", fontSize: 12, marginBottom: 6 }}>{label}</div>
            <div style={{ color: accent, fontWeight: 700, fontSize: 22 }}>{value}</div>
        </div>
    );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="card" style={{ padding: 16 }}>
            <h3 style={{ margin: `0 0 12px`, fontSize: 14, color: "#888" }}>{title}</h3>
            {children}
        </div>
    );
}

function Empty() {
    return <p style={{ color: "#888", fontSize: 13, textAlign: "center", padding: 16 }}>Sin datos disponibles.</p>;
}

function LineTrendChart({
    data,
    color,
    yMax,
    suffix = "",
    decimals = 0,
}: {
    data: { label: string; value: number }[];
    color: string;
    yMax: number;
    suffix?: string;
    decimals?: number;
}) {
    const width = 560;
    const height = 170;
    const padX = 28;
    const padY = 20;
    const usableW = width - padX * 2;
    const usableH = height - padY * 2;
    const step = data.length > 1 ? usableW / (data.length - 1) : usableW;

    const points = data
        .map((item, index) => {
            const x = padX + index * step;
            const y = padY + (1 - item.value / yMax) * usableH;
            return `${x},${y}`;
        })
        .join(" ");

    return (
        <div>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "180px", display: "block" }}>
                <line x1={padX} x2={width - padX} y1={height - padY} y2={height - padY} stroke="#E5E7EB" strokeWidth="1" />
                <polyline fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={points} />
                {data.map((item, index) => {
                    const x = padX + index * step;
                    const y = padY + (1 - item.value / yMax) * usableH;
                    return <circle key={`${item.label}-${index}`} cx={x} cy={y} r="4" fill="#fff" stroke={color} strokeWidth="2" />;
                })}
            </svg>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`, gap: 8, marginTop: 6 }}>
                {data.map((item) => (
                    <div key={item.label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 12, color: "#6B7280" }}>{item.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color }}>{item.value.toFixed(decimals)}{suffix}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function HorizontalBars({
    data,
    color,
    suffix = "",
    decimals = 0,
}: {
    data: { label: string; value: number }[];
    color: string;
    suffix?: string;
    decimals?: number;
}) {
    const max = Math.max(...data.map((d) => d.value), 1);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.map((row) => (
                <div key={row.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                        <span style={{ color: "#374151" }}>{row.label}</span>
                        <strong>{row.value.toFixed(decimals)}{suffix}</strong>
                    </div>
                    <div style={{ height: 10, borderRadius: 999, background: "#EEF2F7", overflow: "hidden" }}>
                        <div style={{ width: `${(row.value / max) * 100}%`, height: "100%", background: color }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

function StackedCostBars({ data }: { data: { month: string; materials: number; labor: number }[] }) {
    const maxTotal = Math.max(...data.map((d) => d.materials + d.labor), 1);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.map((row) => {
                const total = row.materials + row.labor;
                const widthPct = (total / maxTotal) * 100;
                const materialPct = total > 0 ? (row.materials / total) * 100 : 0;

                return (
                    <div key={row.month}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                            <span style={{ color: "#374151" }}>{row.month}</span>
                            <strong>L {total.toLocaleString()}</strong>
                        </div>
                        <div style={{ height: 12, borderRadius: 999, background: "#EEF2F7", overflow: "hidden", width: `${widthPct}%` }}>
                            <div style={{ width: `${materialPct}%`, height: "100%", background: "#2563EB", float: "left" }} />
                            <div style={{ width: `${100 - materialPct}%`, height: "100%", background: "#93C5FD", float: "left" }} />
                        </div>
                    </div>
                );
            })}
            <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#2563EB", marginRight: 4 }} />Materiales</span>
                <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#93C5FD", marginRight: 4 }} />Mano de obra</span>
            </div>
        </div>
    );
}
