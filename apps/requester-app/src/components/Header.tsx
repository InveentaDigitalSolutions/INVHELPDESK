// ═══════════════════════════════════════════════════════════════
// Header – modern sticky header with gradient + optional back
// Responsive: visible on mobile/tablet, hidden ≥1024px (CSS)
// ═══════════════════════════════════════════════════════════════
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";

interface HeaderProps {
    title: string;
    showBack?: boolean;
    rightAction?: React.ReactNode;
}

const BackIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
    </svg>
);

export function Header({ title, showBack = false, rightAction }: HeaderProps) {
    const navigate = useNavigate();
    const { selectedArea, setSelectedArea } = useAppContext();

    return (
        <header className="app-header">
            <div className="app-header__left">
                {showBack && (
                    <button
                        className="app-header__back"
                        onClick={() => navigate(-1)}
                        aria-label="Volver"
                    >
                        <BackIcon />
                    </button>
                )}
                {!showBack && (
                    <img
                        className="app-header__logo"
                        src="/Logo-Universidad-Zamorano-beige.png"
                        alt="Zamorano"
                    />
                )}
                <h1 className={`app-header__title${showBack ? " app-header__title--detail" : ""}`}>
                    {title}
                </h1>
            </div>
            <div className="app-header__actions">
                {!showBack && (
                    <select
                        aria-label="Área de servicio"
                        className="area-switch"
                        value={selectedArea}
                        onChange={(event) => setSelectedArea(event.target.value)}
                    >
                        <option value="maintenance">Mantenimiento</option>
                    </select>
                )}
                {rightAction}
            </div>
        </header>
    );
}
