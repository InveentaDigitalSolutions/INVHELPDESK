// ═══════════════════════════════════════════════════════════════
// Supervisor App – Application Root (desktop-optimized layout)
// ═══════════════════════════════════════════════════════════════
import { BrowserRouter, Routes, Route, Navigate, NavLink } from "react-router-dom";
import { useState } from "react";
import { OperationsDashboard } from "./pages/OperationsDashboard";
import { QueueManagement } from "./pages/QueueManagement";
import { TicketDetailScreen } from "./pages/TicketDetailScreen";
import { ApprovalCenter } from "./pages/ApprovalCenter";
import { AnalyticsScreen } from "./pages/AnalyticsScreen";
import { ConfigurationScreen } from "./pages/ConfigurationScreen";

const DashboardIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="4" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
);

const QueueIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
);

const ApprovalIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
    </svg>
);

const AnalyticsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const ConfigIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.08a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.08a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const navItems = [
    { path: "/", label: "Dashboard", icon: DashboardIcon },
    { path: "/queue", label: "Cola", icon: QueueIcon },
    { path: "/approvals", label: "Aprobaciones", icon: ApprovalIcon },
    { path: "/analytics", label: "Analíticas", icon: AnalyticsIcon },
    { path: "/config", label: "Configuración", icon: ConfigIcon },
];

export function App() {
    const [selectedArea, setSelectedArea] = useState("maintenance");

    return (
        <BrowserRouter>
            <div className="app-shell">
                <nav className="desktop-sidebar">
                    <div className="sidebar-logo">
                        <img src="/logo-zamorano.png" alt="Zamorano" />
                        <span>Mesa de Ayuda</span>
                    </div>
                    <label className="area-switch-label" htmlFor="supervisor-area-switch">Área</label>
                    <select
                        id="supervisor-area-switch"
                        className="area-switch area-switch--sidebar"
                        value={selectedArea}
                        onChange={(event) => setSelectedArea(event.target.value)}
                    >
                        <option value="maintenance">Mantenimiento</option>
                    </select>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/"}
                            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                        >
                            <item.icon />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <main className="app-content page-wrapper">
                    <div className="page page-desktop" style={{ maxWidth: "100%" }}>
                        <Routes>
                            <Route path="/" element={<OperationsDashboard />} />
                            <Route path="/queue" element={<QueueManagement />} />
                            <Route path="/tickets/:ticketId" element={<TicketDetailScreen />} />
                            <Route path="/approvals" element={<ApprovalCenter />} />
                            <Route path="/analytics" element={<AnalyticsScreen />} />
                            <Route path="/config" element={<ConfigurationScreen />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </BrowserRouter>
    );
}
