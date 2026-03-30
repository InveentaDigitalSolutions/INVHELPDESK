import { MaterialRequestStatus } from "../types";

export interface TicketAssessment {
    ticketId: string;
    notes: string;
    needsMaterials: boolean;
    assessedOn: string;
}

export interface TicketMaterialItem {
    id: string;
    name: string;
    quantity: number;
    unitCost: number;
    status: MaterialRequestStatus;
}

export interface PendingApprovalItem {
    id: string;
    type: "material" | "cost_overrun";
    ticketId: string;
    ticketNumber: string;
    ticketTitle: string;
    technicianName: string;
    description: string;
    amount: number;
    requestedOn: string;
}

export interface ApprovalHistoryEntry {
    id: string;
    ticketId: string;
    status: "submitted" | "approved" | "rejected";
    decidedBy: string;
    decidedOn: string;
    reason?: string;
}

interface WorkflowState {
    assessments: TicketAssessment[];
    materialsByTicket: Record<string, TicketMaterialItem[]>;
    pendingApprovals: PendingApprovalItem[];
    approvalHistoryByTicket: Record<string, ApprovalHistoryEntry[]>;
}

const STORAGE_KEY = "coap_helpdesk_material_approval_flow_v1";

function defaultState(): WorkflowState {
    return {
        assessments: [],
        materialsByTicket: {},
        pendingApprovals: [],
        approvalHistoryByTicket: {},
    };
}

function readState(): WorkflowState {
    if (typeof window === "undefined") return defaultState();
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();

    try {
        const parsed = JSON.parse(raw) as WorkflowState;
        return {
            assessments: parsed.assessments ?? [],
            materialsByTicket: parsed.materialsByTicket ?? {},
            pendingApprovals: parsed.pendingApprovals ?? [],
            approvalHistoryByTicket: parsed.approvalHistoryByTicket ?? {},
        };
    } catch {
        return defaultState();
    }
}

function writeState(state: WorkflowState) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateState(updater: (current: WorkflowState) => WorkflowState) {
    const next = updater(readState());
    writeState(next);
    return next;
}

function materialTotal(items: TicketMaterialItem[]) {
    return items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
}

function materialDescription(items: TicketMaterialItem[]) {
    return items.map((item) => `${item.name} x${item.quantity}`).join(", ");
}

export async function getTicketAssessment(ticketId: string): Promise<TicketAssessment | null> {
    const state = readState();
    return state.assessments.find((assessment) => assessment.ticketId === ticketId) ?? null;
}

export async function saveTicketAssessment(input: Omit<TicketAssessment, "assessedOn">): Promise<TicketAssessment> {
    const assessment: TicketAssessment = {
        ...input,
        assessedOn: new Date().toISOString(),
    };

    updateState((current) => {
        const others = current.assessments.filter((item) => item.ticketId !== input.ticketId);
        return {
            ...current,
            assessments: [...others, assessment],
        };
    });

    return assessment;
}

export async function fetchTicketMaterials(ticketId: string): Promise<TicketMaterialItem[]> {
    const state = readState();
    return state.materialsByTicket[ticketId] ?? [];
}

export async function addTicketMaterial(
    ticketId: string,
    item: Omit<TicketMaterialItem, "id" | "status">,
): Promise<TicketMaterialItem> {
    const created: TicketMaterialItem = {
        ...item,
        id: `mat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        status: MaterialRequestStatus.Required,
    };

    updateState((current) => {
        const existing = current.materialsByTicket[ticketId] ?? [];
        return {
            ...current,
            materialsByTicket: {
                ...current.materialsByTicket,
                [ticketId]: [...existing, created],
            },
        };
    });

    return created;
}

export async function submitMaterialApproval(input: {
    ticketId: string;
    ticketNumber: string;
    ticketTitle: string;
    technicianName: string;
}): Promise<PendingApprovalItem | null> {
    const state = readState();
    const items = state.materialsByTicket[input.ticketId] ?? [];
    if (items.length === 0) return null;

    const alreadyPending = state.pendingApprovals.some(
        (approval) => approval.ticketId === input.ticketId && approval.type === "material",
    );
    if (alreadyPending) {
        return state.pendingApprovals.find(
            (approval) => approval.ticketId === input.ticketId && approval.type === "material",
        ) ?? null;
    }

    const pendingApproval: PendingApprovalItem = {
        id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: "material",
        ticketId: input.ticketId,
        ticketNumber: input.ticketNumber,
        ticketTitle: input.ticketTitle,
        technicianName: input.technicianName,
        description: materialDescription(items),
        amount: materialTotal(items),
        requestedOn: new Date().toISOString(),
    };

    updateState((current) => {
        const materials = current.materialsByTicket[input.ticketId] ?? [];
        return {
            ...current,
            materialsByTicket: {
                ...current.materialsByTicket,
                [input.ticketId]: materials.map((material) => ({
                    ...material,
                    status: MaterialRequestStatus.PendingApproval,
                })),
            },
            pendingApprovals: [...current.pendingApprovals, pendingApproval],
            approvalHistoryByTicket: {
                ...current.approvalHistoryByTicket,
                [input.ticketId]: [
                    ...(current.approvalHistoryByTicket[input.ticketId] ?? []),
                    {
                        id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                        ticketId: input.ticketId,
                        status: "submitted",
                        decidedBy: input.technicianName,
                        decidedOn: new Date().toISOString(),
                    },
                ],
            },
        };
    });

    return pendingApproval;
}

export async function fetchPendingApprovals(): Promise<PendingApprovalItem[]> {
    const state = readState();
    return state.pendingApprovals;
}

export async function fetchApprovalHistory(ticketId: string): Promise<ApprovalHistoryEntry[]> {
    const state = readState();
    return state.approvalHistoryByTicket[ticketId] ?? [];
}

export async function approvePendingApproval(approvalId: string, decidedBy = "Supervisor"): Promise<void> {
    updateState((current) => {
        const approval = current.pendingApprovals.find((item) => item.id === approvalId);
        if (!approval) return current;

        const materials = current.materialsByTicket[approval.ticketId] ?? [];
        return {
            ...current,
            materialsByTicket: {
                ...current.materialsByTicket,
                [approval.ticketId]: materials.map((material) => ({
                    ...material,
                    status: MaterialRequestStatus.Approved,
                })),
            },
            pendingApprovals: current.pendingApprovals.filter((item) => item.id !== approvalId),
            approvalHistoryByTicket: {
                ...current.approvalHistoryByTicket,
                [approval.ticketId]: [
                    ...(current.approvalHistoryByTicket[approval.ticketId] ?? []),
                    {
                        id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                        ticketId: approval.ticketId,
                        status: "approved",
                        decidedBy,
                        decidedOn: new Date().toISOString(),
                    },
                ],
            },
        };
    });
}

export async function rejectPendingApproval(approvalId: string, reason?: string, decidedBy = "Supervisor"): Promise<void> {
    updateState((current) => {
        const approval = current.pendingApprovals.find((item) => item.id === approvalId);
        if (!approval) return current;

        const materials = current.materialsByTicket[approval.ticketId] ?? [];
        return {
            ...current,
            materialsByTicket: {
                ...current.materialsByTicket,
                [approval.ticketId]: materials.map((material) => ({
                    ...material,
                    status: MaterialRequestStatus.Rejected,
                })),
            },
            pendingApprovals: current.pendingApprovals.filter((item) => item.id !== approvalId),
            approvalHistoryByTicket: {
                ...current.approvalHistoryByTicket,
                [approval.ticketId]: [
                    ...(current.approvalHistoryByTicket[approval.ticketId] ?? []),
                    {
                        id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                        ticketId: approval.ticketId,
                        status: "rejected",
                        decidedBy,
                        decidedOn: new Date().toISOString(),
                        reason,
                    },
                ],
            },
        };
    });
}