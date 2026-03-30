// ═══════════════════════════════════════════════════════════════
// Technician App – Application Root
// ═══════════════════════════════════════════════════════════════
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { DashboardScreen } from "./pages/DashboardScreen";
import { TicketDetailScreen } from "./pages/TicketDetailScreen";
import { WorkOrderScreen } from "./pages/WorkOrderScreen";
import { TimeLogScreen } from "./pages/TimeLogScreen";
import { MaterialRequestScreen } from "./pages/MaterialRequestScreen";
import { CloseTicketScreen } from "./pages/CloseTicketScreen";

export function App() {
    const [selectedArea, setSelectedArea] = useState("maintenance");

    return (
        <BrowserRouter>
            <div className="app-shell">
                <header className="app-header">
                    <div className="app-header__left">
                        <img src="/Logo-Universidad-Zamorano-beige.png" alt="Zamorano" className="app-header__logo" />
                        <h1 className="app-header__title app-header__title--detail">Mesa de Ayuda</h1>
                    </div>
                    <div className="app-header__actions">
                        <select
                            aria-label="Área de servicio"
                            className="area-switch"
                            value={selectedArea}
                            onChange={(event) => setSelectedArea(event.target.value)}
                        >
                            <option value="maintenance">Mantenimiento</option>
                        </select>
                    </div>
                </header>
                <div className="app-content page-wrapper">
                    <div className="page page-desktop">
                        <Routes>
                            <Route path="/" element={<DashboardScreen />} />
                            <Route path="/tickets/:ticketId" element={<TicketDetailScreen />} />
                            <Route path="/tickets/:ticketId/work-order" element={<WorkOrderScreen />} />
                            <Route path="/tickets/:ticketId/time-log" element={<TimeLogScreen />} />
                            <Route path="/tickets/:ticketId/materials" element={<MaterialRequestScreen />} />
                            <Route path="/tickets/:ticketId/close" element={<CloseTicketScreen />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </BrowserRouter>
    );
}
