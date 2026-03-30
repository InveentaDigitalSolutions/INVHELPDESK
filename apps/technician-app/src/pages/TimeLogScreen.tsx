// ═══════════════════════════════════════════════════════════════
// TimeLogScreen – Start/stop timer for technician work hours
// Supports multiple sessions per ticket
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTechnicianTimeLogs, startTechnicianTimer, stopTechnicianTimer } from "../utils/mockTechnicianData";

interface TimeEntry {
    id: string;
    startTime: string;
    endTime?: string;
    durationMinutes?: number;
    notes: string;
}

// ── Dataverse stubs ────────────────────────────────────────────
async function fetchTimeLogs(_ticketId: string): Promise<TimeEntry[]> {
    return fetchTechnicianTimeLogs(_ticketId);
}
async function startTimer(_ticketId: string, _notes: string): Promise<TimeEntry> {
    return startTechnicianTimer(_ticketId, _notes);
}
async function stopTimer(_entryId: string): Promise<void> {
    await stopTechnicianTimer(_entryId);
}

export function TimeLogScreen() {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
    const [elapsed, setElapsed] = useState(0); // seconds
    const [notes, setNotes] = useState("");
    const timer = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!ticketId) return;
        fetchTimeLogs(ticketId).then((logs) => {
            setEntries(logs);
            const running = logs.find((l) => !l.endTime);
            if (running) {
                setActiveEntry(running);
                setElapsed(Math.floor((Date.now() - new Date(running.startTime).getTime()) / 1000));
            }
        });
    }, [ticketId]);

    // Live timer
    useEffect(() => {
        if (activeEntry) {
            timer.current = setInterval(() => setElapsed((e) => e + 1), 1000);
        }
        return () => {
            if (timer.current) clearInterval(timer.current);
        };
    }, [activeEntry]);

    const handleStart = async () => {
        if (!ticketId) return;
        const entry = await startTimer(ticketId, notes);
        setActiveEntry(entry);
        setElapsed(0);
        setNotes("");
    };

    const handleStop = async () => {
        if (!activeEntry) return;
        await stopTimer(activeEntry.id);
        setEntries((prev) => [
            ...prev.filter((e) => e.id !== activeEntry.id),
            { ...activeEntry, endTime: new Date().toISOString(), durationMinutes: Math.ceil(elapsed / 60) },
        ]);
        setActiveEntry(null);
        setElapsed(0);
        if (timer.current) clearInterval(timer.current);
    };

    const formatTime = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    };

    const totalMinutes = entries.reduce((acc, e) => acc + (e.durationMinutes ?? 0), 0) + Math.ceil(elapsed / 60);

    return (
        <div style={{ padding: 16, maxWidth: 700, margin: "0 auto" }}>
            <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, marginBottom: 12 }}>
                ← Volver
            </button>
            <h2 className="page-title">Registro de Tiempo</h2>

            {/* Timer display */}
            <div className="card" style={{ textAlign: "center", padding: 24, marginBottom: 16 }}>
                <div style={{ fontSize: 48, fontWeight: 700, fontFamily: "monospace", color: activeEntry ? "#DC2626" : "#00643E" }}>
                    {formatTime(elapsed)}
                </div>
                <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
                    {activeEntry ? "Cronómetro activo" : "Listo para iniciar"}
                </div>
            </div>

            {/* Notes + action */}
            {!activeEntry && (
                <div style={{ marginBottom: 16 }}>
                    <input
                        type="text"
                        placeholder="Notas (opcional)…"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="input-control"
                        style={{ marginBottom: 8 }}
                    />
                </div>
            )}

            <button
                onClick={activeEntry ? handleStop : handleStart}
                className={activeEntry ? "btn btn-danger" : "btn btn-primary"}
                style={{ width: "100%", marginBottom: 24 }}
            >
                {activeEntry ? "Detener" : "Iniciar Cronómetro"}
            </button>

            {/* Summary */}
            <div style={{ fontSize: 14, color: "#888", marginBottom: 12 }}>
                Tiempo total: <strong style={{ color: "#111" }}>{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</strong>
            </div>

            {/* Previous entries */}
            {entries.filter((e) => e.endTime).length > 0 && (
                <>
                    <h3 style={{ fontSize: 14, marginBottom: 8 }}>Sesiones Anteriores</h3>
                    <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #e5e7eb", color: "#888" }}>
                                <th style={{ textAlign: "left", padding: 6 }}>Inicio</th>
                                <th style={{ textAlign: "left", padding: 6 }}>Fin</th>
                                <th style={{ textAlign: "right", padding: 6 }}>Minutos</th>
                                <th style={{ textAlign: "left", padding: 6 }}>Notas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries
                                .filter((e) => e.endTime)
                                .map((e) => (
                                    <tr key={e.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        <td style={{ padding: 6 }}>{new Date(e.startTime).toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" })}</td>
                                        <td style={{ padding: 6 }}>{e.endTime ? new Date(e.endTime).toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                                        <td style={{ padding: 6, textAlign: "right" }}>{e.durationMinutes ?? "—"}</td>
                                        <td style={{ padding: 6, color: "#888" }}>{e.notes || "—"}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}
