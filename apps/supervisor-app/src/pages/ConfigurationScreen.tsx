// ═══════════════════════════════════════════════════════════════
// ConfigurationScreen – Manage SLA policies, categories,
// locations, and app settings
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import {
    CategorySkillMapping,
    fetchCategorySkillMappings,
    fetchTechnicianSkills,
    saveCategorySkillMapping,
    saveTechnicianSkill,
    SKILL_OPTIONS,
    SkillName,
    TechnicianSkillProfile,
} from "../utils/skillsData";

// ── Types ──────────────────────────────────────────────────────
interface SLAPolicy {
    id: string;
    name: string;
    firstResponseMinutes: number;
    diagnosisHours: number;
    resolutionHours: number;
    isActive: boolean;
}

interface Category {
    id: string;
    name: string;
    departmentName: string;
    isActive: boolean;
}

// ── Dataverse stubs ────────────────────────────────────────────
async function fetchSLAPolicies(): Promise<SLAPolicy[]> { return []; }
async function fetchCategories(): Promise<Category[]> { return []; }
async function toggleSLAActive(_id: string, _active: boolean): Promise<void> { }
async function toggleCategoryActive(_id: string, _active: boolean): Promise<void> { }

type Tab = "sla" | "categories" | "skills";

export function ConfigurationScreen() {
    const [tab, setTab] = useState<Tab>("sla");
    const [policies, setPolicies] = useState<SLAPolicy[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [technicianSkills, setTechnicianSkills] = useState<TechnicianSkillProfile[]>([]);
    const [categorySkillMappings, setCategorySkillMappings] = useState<CategorySkillMapping[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([fetchSLAPolicies(), fetchCategories(), fetchTechnicianSkills(), fetchCategorySkillMappings()]).then(([p, c, ts, maps]) => {
            setPolicies(p);
            setCategories(c);
            setTechnicianSkills(ts);
            setCategorySkillMappings(maps);
            setLoading(false);
        });
    }, []);

    const handleSkillLevelChange = async (technicianId: string, skillName: SkillName, level: number) => {
        await saveTechnicianSkill(technicianId, skillName, level);
        setTechnicianSkills((prev) => prev.map((tech) => (
            tech.id === technicianId
                ? { ...tech, skills: { ...tech.skills, [skillName]: level } }
                : tech
        )));
    };

    const handleCategorySkillChange = async (mappingId: string, requiredSkill: SkillName) => {
        await saveCategorySkillMapping(mappingId, requiredSkill);
        setCategorySkillMappings((prev) => prev.map((mapping) => (
            mapping.id === mappingId ? { ...mapping, requiredSkill } : mapping
        )));
    };

    const tabStyle = (active: boolean): React.CSSProperties => ({
        padding: "10px 20px",
        cursor: "pointer",
        fontWeight: active ? 700 : 400,
        color: active ? "#00643E" : "#888",
        borderBottom: active ? "3px solid #00643E" : "3px solid transparent",
        background: "none",
        border: "none",
        fontSize: 14,
    });

    return (
        <div style={{ padding: 24 }}>
            <h1 className="page-title" style={{ marginBottom: 24 }}>Configuración</h1>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", marginBottom: 20 }}>
                <button style={tabStyle(tab === "sla")} onClick={() => setTab("sla")}>Políticas SLA</button>
                <button style={tabStyle(tab === "categories")} onClick={() => setTab("categories")}>Categorías</button>
                <button style={tabStyle(tab === "skills")} onClick={() => setTab("skills")}>Habilidades</button>
            </div>

            {loading && <p style={{ textAlign: "center", color: "#888" }}>Cargando…</p>}

            {/* SLA Policies */}
            {!loading && tab === "sla" && (
                <div className="table-shell">
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                                <th style={{ textAlign: "left", padding: 10 }}>Política</th>
                                <th style={{ textAlign: "center", padding: 10 }}>1ª Respuesta</th>
                                <th style={{ textAlign: "center", padding: 10 }}>Diagnóstico</th>
                                <th style={{ textAlign: "center", padding: 10 }}>Resolución</th>
                                <th style={{ textAlign: "center", padding: 10 }}>Activa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {policies.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: "center", padding: 24, color: "#888" }}>Sin políticas.</td></tr>
                            ) : (
                                policies.map((p) => (
                                    <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        <td style={{ padding: 10, fontWeight: 600 }}>{p.name}</td>
                                        <td style={{ padding: 10, textAlign: "center" }}>{p.firstResponseMinutes} min</td>
                                        <td style={{ padding: 10, textAlign: "center" }}>{p.diagnosisHours}h</td>
                                        <td style={{ padding: 10, textAlign: "center" }}>{p.resolutionHours}h</td>
                                        <td style={{ padding: 10, textAlign: "center" }}>
                                            <button
                                                onClick={async () => {
                                                    await toggleSLAActive(p.id, !p.isActive);
                                                    setPolicies((prev) => prev.map((x) => x.id === p.id ? { ...x, isActive: !x.isActive } : x));
                                                }}
                                                style={{
                                                    padding: "4px 12px",
                                                    borderRadius: 99,
                                                    border: "none",
                                                    fontWeight: 600,
                                                    fontSize: 12,
                                                    cursor: "pointer",
                                                    background: p.isActive ? "#D1FAE5" : "#F3F4F6",
                                                    color: p.isActive ? "#10B981" : "#888",
                                                }}
                                            >
                                                {p.isActive ? "Activa" : "Inactiva"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Categories */}
            {!loading && tab === "categories" && (
                <div className="table-shell">
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                                <th style={{ textAlign: "left", padding: 10 }}>Categoría</th>
                                <th style={{ textAlign: "left", padding: 10 }}>Departamento</th>
                                <th style={{ textAlign: "center", padding: 10 }}>Activa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 ? (
                                <tr><td colSpan={3} style={{ textAlign: "center", padding: 24, color: "#888" }}>Sin categorías.</td></tr>
                            ) : (
                                categories.map((c) => (
                                    <tr key={c.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        <td style={{ padding: 10, fontWeight: 600 }}>{c.name}</td>
                                        <td style={{ padding: 10 }}>{c.departmentName}</td>
                                        <td style={{ padding: 10, textAlign: "center" }}>
                                            <button
                                                onClick={async () => {
                                                    await toggleCategoryActive(c.id, !c.isActive);
                                                    setCategories((prev) => prev.map((x) => x.id === c.id ? { ...x, isActive: !x.isActive } : x));
                                                }}
                                                style={{
                                                    padding: "4px 12px",
                                                    borderRadius: 99,
                                                    border: "none",
                                                    fontWeight: 600,
                                                    fontSize: 12,
                                                    cursor: "pointer",
                                                    background: c.isActive ? "#D1FAE5" : "#F3F4F6",
                                                    color: c.isActive ? "#10B981" : "#888",
                                                }}
                                            >
                                                {c.isActive ? "Activa" : "Inactiva"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Skills */}
            {!loading && tab === "skills" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div className="table-shell" style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 920 }}>
                            <thead>
                                <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                                    <th style={{ textAlign: "left", padding: 10 }}>Técnico</th>
                                    {SKILL_OPTIONS.map((skill) => (
                                        <th key={skill} style={{ textAlign: "center", padding: 10 }}>{skill}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {technicianSkills.length === 0 ? (
                                    <tr><td colSpan={SKILL_OPTIONS.length + 1} style={{ textAlign: "center", padding: 24, color: "#888" }}>Sin técnicos.</td></tr>
                                ) : (
                                    technicianSkills.map((tech) => (
                                        <tr key={tech.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                            <td style={{ padding: 10, fontWeight: 600 }}>{tech.name}</td>
                                            {SKILL_OPTIONS.map((skill) => (
                                                <td key={`${tech.id}-${skill}`} style={{ padding: 10, textAlign: "center" }}>
                                                    <select
                                                        className="input-control"
                                                        value={tech.skills[skill]}
                                                        onChange={(event) => handleSkillLevelChange(tech.id, skill, Number(event.target.value))}
                                                        style={{ width: 70, minWidth: 70, margin: "0 auto" }}
                                                    >
                                                        {[0, 1, 2, 3, 4, 5].map((level) => (
                                                            <option key={level} value={level}>{level}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="table-shell" style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                                    <th style={{ textAlign: "left", padding: 10 }}>Categoría</th>
                                    <th style={{ textAlign: "left", padding: 10 }}>Habilidad requerida</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorySkillMappings.length === 0 ? (
                                    <tr><td colSpan={2} style={{ textAlign: "center", padding: 24, color: "#888" }}>Sin mapeos.</td></tr>
                                ) : (
                                    categorySkillMappings.map((mapping) => (
                                        <tr key={mapping.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                            <td style={{ padding: 10, fontWeight: 600 }}>{mapping.categoryName}</td>
                                            <td style={{ padding: 10 }}>
                                                <select
                                                    className="input-control"
                                                    value={mapping.requiredSkill}
                                                    onChange={(event) => handleCategorySkillChange(mapping.id, event.target.value as SkillName)}
                                                    style={{ maxWidth: 280 }}
                                                >
                                                    {SKILL_OPTIONS.map((skill) => (
                                                        <option key={skill} value={skill}>{skill}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="card" style={{ marginTop: 24, padding: 16, fontSize: 13, color: "#1E40AF", background: "#EFF6FF" }}>
                💡 Para agregar o modificar registros en detalle, use la vista de tablas de Dataverse en make.powerapps.com o Power Platform admin center.
            </div>
        </div>
    );
}
