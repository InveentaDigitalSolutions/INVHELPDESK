// ═══════════════════════════════════════════════════════════════
// Requester App – Application Root
// Uses React Router for SPA navigation within Power Apps host
// Responsive shell: sidebar on desktop, bottom nav on mobile
// ═══════════════════════════════════════════════════════════════
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppProvider } from "./hooks/useAppContext";
import { BottomNav } from "./components/BottomNav";
import { DesktopSidebar } from "./components/DesktopSidebar";
import { HomeScreen } from "./pages/HomeScreen";
import { CreateTicketScreen } from "./pages/CreateTicketScreen";
import { TicketDetailScreen } from "./pages/TicketDetailScreen";
import { MyTicketsScreen } from "./pages/MyTicketsScreen";
import { SurveyScreen } from "./pages/SurveyScreen";

export function App() {
    const [showStartup, setShowStartup] = useState(true);

    useEffect(() => {
        const timer = window.setTimeout(() => setShowStartup(false), 1450);
        return () => window.clearTimeout(timer);
    }, []);

    return (
        <BrowserRouter>
            <AppProvider>
                <div className="app-shell">
                    <DesktopSidebar />
                    <div className="app-content">
                        <Routes>
                            <Route path="/" element={<HomeScreen />} />
                            <Route path="/create" element={<CreateTicketScreen />} />
                            <Route path="/tickets" element={<MyTicketsScreen />} />
                            <Route path="/tickets/:ticketId" element={<TicketDetailScreen />} />
                            <Route path="/survey/:ticketId" element={<SurveyScreen />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                    <BottomNav />
                </div>
                {showStartup && (
                    <div className="startup-splash" role="status" aria-live="polite">
                        <div className="startup-splash__brand">
                            <div className="startup-splash__logo-wrap">
                                <img src="/logo-zamorano.png" alt="Zamorano" className="startup-splash__logo" />
                            </div>
                            <h1 className="startup-splash__title">Mesa de Ayuda</h1>
                            <p className="startup-splash__subtitle">Mantenimiento Zamorano</p>
                            <div className="startup-splash__bar">
                                <span />
                            </div>
                        </div>
                    </div>
                )}
            </AppProvider>
        </BrowserRouter>
    );
}
