// ═══════════════════════════════════════════════════════════════
// BottomNav – modern floating bottom navigation with SVG icons
// Responsive: full-width bar on small phones, floating pill on
//   375px+, hidden on desktop ≥1024px (CSS-driven)
// ═══════════════════════════════════════════════════════════════
import { useLocation, useNavigate } from "react-router-dom";

const HomeIcon = ({ active }: { active: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const PlusIcon = ({ active }: { active: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);

const ListIcon = ({ active }: { active: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="8" y1="9" x2="16" y2="9" /><line x1="8" y1="13" x2="14" y2="13" /><line x1="8" y1="17" x2="12" y2="17" />
    </svg>
);

interface NavItemDef {
    label: string;
    icon: (props: { active: boolean }) => React.ReactNode;
    path: string;
}

const items: NavItemDef[] = [
    { label: "Inicio", icon: HomeIcon, path: "/" },
    { label: "Nuevo", icon: PlusIcon, path: "/create" },
    { label: "Mis Tickets", icon: ListIcon, path: "/tickets" },
];

export function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();

    if (location.pathname.startsWith("/survey")) return null;

    return (
        <nav className="bottom-nav">
            <div className="bottom-nav__inner">
                {items.map((item) => {
                    const active =
                        item.path === "/"
                            ? location.pathname === "/"
                            : location.pathname.startsWith(item.path);
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.path}
                            className={`bottom-nav__item${active ? " bottom-nav__item--active" : ""}`}
                            onClick={() => navigate(item.path)}
                            aria-label={item.label}
                        >
                            <Icon active={active} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
