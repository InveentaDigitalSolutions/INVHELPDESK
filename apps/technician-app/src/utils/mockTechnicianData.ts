import { TicketPriority, TicketStatus } from "@shared/types";

export interface TechnicianQueueTicket {
    id: string;
    ticketNumber: string;
    title: string;
    status: TicketStatus;
    priority: TicketPriority;
    createdOn: string;
    locationName: string;
    categoryName: string;
    slaDeadline?: string;
}

export interface TechnicianFullTicket extends TechnicianQueueTicket {
    description: string;
    reportedByName: string;
    subcategoryName?: string;
    eta?: string;
    slaFirstResponseDeadline?: string;
    slaDiagnosisDeadline?: string;
    slaResolutionDeadline?: string;
    evidence?: string[];
}

export interface TechnicianWorkOrderData {
    id?: string;
    diagnosis: string;
    rootCause: string;
    solution: string;
    estimatedCost: number;
    actualCost: number;
}

export interface TechnicianTimeEntry {
    id: string;
    startTime: string;
    endTime?: string;
    durationMinutes?: number;
    notes: string;
}

interface TechnicianMockState {
    tickets: TechnicianFullTicket[];
    workOrdersByTicket: Record<string, TechnicianWorkOrderData>;
    timeLogsByTicket: Record<string, TechnicianTimeEntry[]>;
}

const STORAGE_KEY = "coap_helpdesk_technician_mock_v1";

function hoursFromNow(hours: number) {
    return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function hoursAgo(hours: number) {
    return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function createDefaultState(): TechnicianMockState {
    return {
        tickets: [
            {
                id: "tech-tkt-001",
                ticketNumber: "TKT-000241",
                title: "Fuga de agua en lavamanos del laboratorio",
                description: "Se reporta fuga continua bajo el lavamanos del laboratorio de química. Ya afecta el piso y hay riesgo de deslizamiento.",
                status: TicketStatus.Assigned,
                priority: TicketPriority.High,
                createdOn: hoursAgo(4),
                reportedByName: "Ana Flores",
                categoryName: "Plomería",
                subcategoryName: "Tuberías",
                locationName: "Edificio Ciencia · Lab 2",
                eta: hoursFromNow(1),
                slaDeadline: hoursFromNow(1.5),
                slaFirstResponseDeadline: hoursFromNow(0.5),
                slaDiagnosisDeadline: hoursFromNow(2),
                slaResolutionDeadline: hoursFromNow(8),
                evidence: [
                    "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=640&q=60",
                ],
            },
            {
                id: "tech-tkt-002",
                ticketNumber: "TKT-000238",
                title: "Aire acondicionado no enfría en oficina administrativa",
                description: "El equipo de A/C en oficina administrativa no enfría desde ayer. Temperatura ambiente supera los 30°C.",
                status: TicketStatus.InProgress,
                priority: TicketPriority.Medium,
                createdOn: hoursAgo(18),
                reportedByName: "Luis Mejía",
                categoryName: "HVAC",
                locationName: "Edificio Central · Oficina 105",
                eta: hoursFromNow(3),
                slaDeadline: hoursFromNow(5),
                slaFirstResponseDeadline: hoursAgo(10),
                slaDiagnosisDeadline: hoursFromNow(1),
                slaResolutionDeadline: hoursFromNow(12),
                evidence: [
                    "https://images.unsplash.com/photo-1581093588401-16ec2f6c5d06?auto=format&fit=crop&w=640&q=60",
                ],
            },
            {
                id: "tech-tkt-003",
                ticketNumber: "TKT-000232",
                title: "Cambio de cerradura en aula 12",
                description: "La cerradura actual presenta daño mecánico y no cierra correctamente. Requiere sustitución completa.",
                status: TicketStatus.OnHold,
                priority: TicketPriority.Low,
                createdOn: hoursAgo(36),
                reportedByName: "Marvin Sánchez",
                categoryName: "Cerrajería",
                locationName: "Aulas Norte · Aula 12",
                eta: hoursFromNow(6),
                slaDeadline: hoursFromNow(10),
                slaFirstResponseDeadline: hoursAgo(30),
                slaDiagnosisDeadline: hoursAgo(12),
                slaResolutionDeadline: hoursFromNow(16),
                evidence: [
                    "https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=640&q=60",
                ],
            },
            {
                id: "tech-tkt-004",
                ticketNumber: "TKT-000226",
                title: "Tomacorriente sin energía en sala de reuniones",
                description: "Dos tomacorrientes no tienen energía en sala de reuniones principal. Equipo de videoconferencia no enciende.",
                status: TicketStatus.Resolved,
                priority: TicketPriority.Critical,
                createdOn: hoursAgo(52),
                reportedByName: "Patricia Dubón",
                categoryName: "Electricidad",
                locationName: "Administración · Sala Principal",
                eta: hoursAgo(20),
                slaDeadline: hoursAgo(12),
                slaFirstResponseDeadline: hoursAgo(48),
                slaDiagnosisDeadline: hoursAgo(40),
                slaResolutionDeadline: hoursAgo(18),
            },
        ],
        workOrdersByTicket: {
            "tech-tkt-002": {
                id: "wo-002",
                diagnosis: "Compresor con bajo rendimiento por falta de mantenimiento y suciedad en serpentín.",
                rootCause: "Mantenimiento preventivo fuera de periodicidad recomendada.",
                solution: "Limpieza profunda, revisión de gas refrigerante y ajuste de filtros.",
                estimatedCost: 2200,
                actualCost: 1850,
            },
        },
        timeLogsByTicket: {
            "tech-tkt-002": [
                {
                    id: "time-1",
                    startTime: hoursAgo(3),
                    endTime: hoursAgo(2.25),
                    durationMinutes: 45,
                    notes: "Diagnóstico inicial y revisión de unidad evaporadora.",
                },
                {
                    id: "time-2",
                    startTime: hoursAgo(1.2),
                    notes: "Ajustes y pruebas de funcionamiento.",
                },
            ],
            "tech-tkt-001": [
                {
                    id: "time-3",
                    startTime: hoursAgo(0.8),
                    endTime: hoursAgo(0.4),
                    durationMinutes: 24,
                    notes: "Inspección de fuga y preparación de reemplazo de unión.",
                },
            ],
        },
    };
}

function readState(): TechnicianMockState {
    if (typeof window === "undefined") return createDefaultState();
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    try {
        const parsed = JSON.parse(raw) as TechnicianMockState;
        return {
            tickets: parsed.tickets ?? [],
            workOrdersByTicket: parsed.workOrdersByTicket ?? {},
            timeLogsByTicket: parsed.timeLogsByTicket ?? {},
        };
    } catch {
        return createDefaultState();
    }
}

function writeState(state: TechnicianMockState) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateState(updater: (current: TechnicianMockState) => TechnicianMockState) {
    const next = updater(readState());
    writeState(next);
    return next;
}

function ensureSeeded() {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) writeState(createDefaultState());
}

ensureSeeded();

export async function fetchTechnicianQueue(): Promise<TechnicianQueueTicket[]> {
    const state = readState();
    return [...state.tickets].sort(
        (a, b) =>
            b.priority - a.priority
            || new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime(),
    );
}

export async function fetchTechnicianTicket(ticketId: string): Promise<TechnicianFullTicket | null> {
    const state = readState();
    return state.tickets.find((ticket) => ticket.id === ticketId) ?? null;
}

export async function setTechnicianTicketStatus(ticketId: string, status: TicketStatus): Promise<void> {
    updateState((current) => ({
        ...current,
        tickets: current.tickets.map((ticket) =>
            ticket.id === ticketId ? { ...ticket, status } : ticket,
        ),
    }));
}

export async function fetchTechnicianWorkOrder(ticketId: string): Promise<TechnicianWorkOrderData | null> {
    const state = readState();
    return state.workOrdersByTicket[ticketId] ?? null;
}

export async function saveTechnicianWorkOrder(ticketId: string, workOrder: TechnicianWorkOrderData): Promise<void> {
    updateState((current) => ({
        ...current,
        workOrdersByTicket: {
            ...current.workOrdersByTicket,
            [ticketId]: {
                ...workOrder,
                id: workOrder.id ?? `wo-${ticketId}`,
            },
        },
    }));
}

export async function fetchTechnicianTimeLogs(ticketId: string): Promise<TechnicianTimeEntry[]> {
    const state = readState();
    return state.timeLogsByTicket[ticketId] ?? [];
}

export async function startTechnicianTimer(ticketId: string, notes: string): Promise<TechnicianTimeEntry> {
    const newEntry: TechnicianTimeEntry = {
        id: `time-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        startTime: new Date().toISOString(),
        notes,
    };

    updateState((current) => {
        const existing = current.timeLogsByTicket[ticketId] ?? [];
        return {
            ...current,
            timeLogsByTicket: {
                ...current.timeLogsByTicket,
                [ticketId]: [...existing, newEntry],
            },
        };
    });

    return newEntry;
}

export async function stopTechnicianTimer(entryId: string): Promise<void> {
    const now = new Date().toISOString();
    updateState((current) => {
        const nextLogs = Object.fromEntries(
            Object.entries(current.timeLogsByTicket).map(([ticketId, entries]) => [
                ticketId,
                entries.map((entry) => {
                    if (entry.id !== entryId || entry.endTime) return entry;
                    const durationMinutes = Math.max(
                        1,
                        Math.ceil((new Date(now).getTime() - new Date(entry.startTime).getTime()) / 60000),
                    );
                    return { ...entry, endTime: now, durationMinutes };
                }),
            ]),
        ) as Record<string, TechnicianTimeEntry[]>;

        return {
            ...current,
            timeLogsByTicket: nextLogs,
        };
    });
}

export async function closeTechnicianTicket(ticketId: string): Promise<void> {
    await setTechnicianTicketStatus(ticketId, TicketStatus.Closed);
}

export function resetTechnicianMockData(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
    writeState(createDefaultState());
}