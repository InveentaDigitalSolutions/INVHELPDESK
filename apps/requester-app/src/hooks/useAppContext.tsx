// ═══════════════════════════════════════════════════════════════
// AppContext – cached Power Apps context & user information
// Uses @microsoft/power-apps SDK getContext() at startup
// ═══════════════════════════════════════════════════════════════
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

// ── Types ──────────────────────────────────────────────────────
export interface AppContextData {
    app: { appId: string; environmentId: string; queryParams: Record<string, string> };
    user: {
        fullName: string;
        objectId: string;
        tenantId: string;
        userPrincipalName: string;
    };
    host: { sessionId: string };
}

interface AppCtx {
    context: AppContextData | null;
    loading: boolean;
    error: string | null;
    selectedArea: string;
    setSelectedArea: (area: string) => void;
}

type ContextLoadState = Pick<AppCtx, "context" | "loading" | "error">;

// ── SDK loader ─────────────────────────────────────────────────
// In production (inside Power Apps host) the real SDK is available.
// For local dev we fall back to mock data.
// NOTE: getContext() never resolves outside the host, so we race with a timeout.
const MOCK_CONTEXT: AppContextData = {
    app: { appId: "local-dev", environmentId: "local-env", queryParams: {} },
    user: {
        fullName: "Usuario de Desarrollo",
        objectId: "00000000-0000-0000-0000-000000000000",
        tenantId: "00000000-0000-0000-0000-000000000000",
        userPrincipalName: "dev@zamorano.edu",
    },
    host: { sessionId: "local-session" },
};

async function loadContext(): Promise<AppContextData> {
    try {
        const sdk = await import("@microsoft/power-apps/app");
        // Race the SDK call against a 2-second timeout for local dev
        const ctx = await Promise.race([
            (sdk as { getContext: () => Promise<AppContextData> }).getContext(),
            new Promise<AppContextData>((resolve) =>
                setTimeout(() => resolve(MOCK_CONTEXT), 2000),
            ),
        ]);
        return ctx;
    } catch {
        return MOCK_CONTEXT;
    }
}

// ── Context ────────────────────────────────────────────────────
const AppContext = createContext<AppCtx>({
    context: null,
    loading: true,
    error: null,
    selectedArea: "maintenance",
    setSelectedArea: () => { },
});

export function AppProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ContextLoadState>({
        context: null,
        loading: true,
        error: null,
    });
    const [selectedArea, setSelectedArea] = useState("maintenance");

    useEffect(() => {
        let cancelled = false;
        loadContext()
            .then((ctx) => {
                if (!cancelled) setState({ context: ctx, loading: false, error: null });
            })
            .catch((err) => {
                if (!cancelled) setState({ context: null, loading: false, error: String(err) });
            });
        return () => { cancelled = true; };
    }, []);

    return <AppContext.Provider value={{ ...state, selectedArea, setSelectedArea }}>{children}</AppContext.Provider>;
}

export function useAppContext() {
    return useContext(AppContext);
}
