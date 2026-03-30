// ═══════════════════════════════════════════════════════════════
// DesktopSidebar – visible only on ≥1024px via CSS class
// ═══════════════════════════════════════════════════════════════
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";

const HomeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);

const ListIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="8" y1="9" x2="16" y2="9" /><line x1="8" y1="13" x2="14" y2="13" /><line x1="8" y1="17" x2="12" y2="17" />
    </svg>
);

interface NavDef {
    label: string;
    icon: () => React.ReactNode;
    path: string;
}

const navItems: NavDef[] = [
    { label: "Inicio", icon: HomeIcon, path: "/" },
    { label: "Nuevo Ticket", icon: PlusIcon, path: "/create" },
    { label: "Mis Tickets", icon: ListIcon, path: "/tickets" },
];

export function DesktopSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedArea, setSelectedArea } = useAppContext();

    return (
        <aside className="desktop-sidebar">
            <div className="sidebar-logo">
                <img src="/logo-zamorano.png" alt="Zamorano" />
                <span>Mesa de Ayuda</span>
            </div>
            <label className="area-switch-label" htmlFor="requester-area-switch">Área</label>
            <select
                id="requester-area-switch"
                className="area-switch area-switch--sidebar"
                value={selectedArea}
                onChange={(event) => setSelectedArea(event.target.value)}
            >
                <option value="maintenance">Mantenimiento</option>
            </select>
            <nav>
                {navItems.map((item) => {
                    const active =
                        item.path === "/"
                            ? location.pathname === "/"
                            : location.pathname.startsWith(item.path);
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.path}
                            className={`nav-item${active ? " active" : ""}`}
                            onClick={() => navigate(item.path)}
                        >
                            <Icon />
                            {item.label}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}
