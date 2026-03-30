export type SkillName =
    | "Electricidad"
    | "Plomería"
    | "HVAC"
    | "Obra Civil"
    | "Cerrajería"
    | "Jardinería"
    | "Limpieza";

export interface TechnicianSkillProfile {
    id: string;
    name: string;
    skills: Record<SkillName, number>;
}

export interface CategorySkillMapping {
    id: string;
    categoryName: string;
    requiredSkill: SkillName;
}

export const SKILL_OPTIONS: SkillName[] = [
    "Electricidad",
    "Plomería",
    "HVAC",
    "Obra Civil",
    "Cerrajería",
    "Jardinería",
    "Limpieza",
];

export function normalizeText(value: string) {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

export function getRequiredSkillForCategory(categoryName: string, mappings: CategorySkillMapping[]) {
    const normalizedCategory = normalizeText(categoryName);
    const exactMatch = mappings.find((mapping) => normalizeText(mapping.categoryName) === normalizedCategory);
    if (exactMatch) return exactMatch.requiredSkill;

    const partialMatch = mappings.find((mapping) => {
        const normalizedMapping = normalizeText(mapping.categoryName);
        return normalizedCategory.includes(normalizedMapping) || normalizedMapping.includes(normalizedCategory);
    });

    return partialMatch?.requiredSkill ?? null;
}

export function technicianSkillLevel(technician: TechnicianSkillProfile, requiredSkill: SkillName | null) {
    if (!requiredSkill) return 0;
    return technician.skills[requiredSkill] ?? 0;
}

export function technicianAssignScore(technician: TechnicianSkillProfile, requiredSkill: SkillName | null, activeTickets: number) {
    const skillLevel = technicianSkillLevel(technician, requiredSkill);
    const skillScore = skillLevel * 20;
    const workloadPenalty = activeTickets * 3;
    return skillScore - workloadPenalty;
}

export async function fetchTechnicianSkills(): Promise<TechnicianSkillProfile[]> {
    return [
        {
            id: "tech-01",
            name: "Carlos Méndez",
            skills: { Electricidad: 2, "Plomería": 5, HVAC: 3, "Obra Civil": 4, "Cerrajería": 2, "Jardinería": 1, "Limpieza": 1 },
        },
        {
            id: "tech-02",
            name: "María López",
            skills: { Electricidad: 4, "Plomería": 2, HVAC: 5, "Obra Civil": 2, "Cerrajería": 3, "Jardinería": 1, "Limpieza": 1 },
        },
        {
            id: "tech-03",
            name: "José Ramírez",
            skills: { Electricidad: 3, "Plomería": 1, HVAC: 2, "Obra Civil": 3, "Cerrajería": 5, "Jardinería": 2, "Limpieza": 1 },
        },
    ];
}

export async function fetchCategorySkillMappings(): Promise<CategorySkillMapping[]> {
    return [
        { id: "map-01", categoryName: "Plomería", requiredSkill: "Plomería" },
        { id: "map-02", categoryName: "Electricidad", requiredSkill: "Electricidad" },
        { id: "map-03", categoryName: "HVAC", requiredSkill: "HVAC" },
        { id: "map-04", categoryName: "Cerrajería", requiredSkill: "Cerrajería" },
        { id: "map-05", categoryName: "Obra Civil", requiredSkill: "Obra Civil" },
    ];
}

export async function saveTechnicianSkill(_technicianId: string, _skillName: SkillName, _level: number): Promise<void> { }

export async function saveCategorySkillMapping(_mappingId: string, _requiredSkill: SkillName): Promise<void> { }