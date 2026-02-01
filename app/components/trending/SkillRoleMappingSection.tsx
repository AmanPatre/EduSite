"use client";

// ============================================
// SECTION 3: SKILL ↔ ROLE MAPPING
// ============================================

import React, { useEffect, useState } from "react";
import { GitBranch, CheckCircle2, AlertCircle, MinusCircle, ChevronDown } from "lucide-react";
import { SkillRoleMapping, RoleSkillMapping } from "@/data/trendingData";
import SectionHeader from "./SectionHeader";
import Link from "next/link";

interface SkillRoleMappingSectionProps {
    skillMappings: SkillRoleMapping[];
    roleMappings: RoleSkillMapping[];
}

export default function SkillRoleMappingSection({
    skillMappings,
    roleMappings,
}: SkillRoleMappingSectionProps) {
    const [viewMode, setViewMode] = useState<"skill-to-role" | "role-to-skill">(
        "skill-to-role"
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [customSkill, setCustomSkill] = useState<string | null>(null);

    // AI state
    const [aiRoles, setAiRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // 🔁 Sync selectedId when viewMode changes
    useEffect(() => {
        if (viewMode === "skill-to-role" && skillMappings.length > 0) {
            setSelectedId(skillMappings[0].skillId);
            setCustomSkill(null);
        }
        if (viewMode === "role-to-skill" && roleMappings.length > 0) {
            setSelectedId(roleMappings[0].roleId);
        }
        setAiRoles([]); // reset AI data on toggle
    }, [viewMode, skillMappings, roleMappings]);

    // 🤖 Fetch AI data when selection changes
    useEffect(() => {
        if (!selectedId) return;

        setAiRoles([]); // Reset on change

        if (viewMode === "skill-to-role") {
            const skill = skillMappings.find((s) => s.skillId === selectedId);
            if (skill) {
                setCustomSkill(null);
                fetchAiMapping(skill.skillName);
            }
        } else {
            const role = roleMappings.find((r) => r.roleId === selectedId);
            if (role) {
                fetchAiMapping(role.roleName);
            }
        }
    }, [selectedId, viewMode]);

    const handleSearch = () => {
        if (!searchTerm.trim()) return;

        // 1. Try to find in existing list
        if (viewMode === "skill-to-role") {
            const match = skillMappings.find(s =>
                s.skillName.toLowerCase() === searchTerm.toLowerCase()
            );
            if (match) {
                setSelectedId(match.skillId);
                setCustomSkill(null);
            } else {
                setSelectedId(null);
                setCustomSkill(searchTerm);
                fetchAiMapping(searchTerm);
            }
        } else {
            // Role search
            const match = roleMappings.find(r =>
                r.roleName.toLowerCase() === searchTerm.toLowerCase()
            );
            if (match) {
                setSelectedId(match.roleId);
            } else {
                // Handle custom role search if needed, strictly speaking we treat it as custom here
                fetchAiMapping(searchTerm);
            }
        }
    };

    const fetchAiMapping = async (query: string) => {
        setLoading(true);
        const endpoint = viewMode === "skill-to-role" ? "/api/skill-roles" : "/api/role-skills";
        const body = viewMode === "skill-to-role" ? { skill: query } : { role: query };

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setAiRoles(data);
                }
            }
        } catch (err) {
            console.error("AI mapping failed", err);
        } finally {
            setLoading(false);
        }
    };

    // Filters
    const filteredSkills = skillMappings.filter((s) =>
        s.skillName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredRoles = roleMappings.filter((r) =>
        r.roleName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedSkill = skillMappings.find((s) => s.skillId === selectedId);
    const selectedRole = roleMappings.find((r) => r.roleId === selectedId);

    // Use AI results if available
    const dataToDisplay = aiRoles.length > 0 ? aiRoles : (
        viewMode === "skill-to-role" ? (selectedSkill?.roles || []) : (selectedRole?.requiredSkills || [])
    );

    const getAlignmentStyle = (alignment: string) => {
        switch (alignment) {
            case "Strong":
            case "Critical":
                return {
                    icon: CheckCircle2,
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                    border: "border-green-500/20",
                    bar: "bg-green-500",
                };
            case "Medium":
            case "Important":
                return {
                    icon: AlertCircle,
                    color: "text-yellow-400",
                    bg: "bg-yellow-500/10",
                    border: "border-yellow-500/20",
                    bar: "bg-yellow-500",
                };
            default:
                return {
                    icon: MinusCircle,
                    color: "text-slate-500",
                    bg: "bg-slate-500/10",
                    border: "border-slate-500/20",
                    bar: "bg-slate-500",
                };
        }
    };

    // State for expanded card
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    return (
        <section className="space-y-6">
            <SectionHeader
                icon={GitBranch}
                iconColor="text-purple-500"
                title="Skill ↔ Role Mapping"
                description="Understand which skills unlock which roles (AI-assisted)"
            />

            {/* Toggle */}
            <div className="flex justify-center bg-[#0F0F12] p-1 rounded-xl border border-slate-800 max-w-md mx-auto">
                {["skill-to-role", "role-to-skill"].map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode as any)}
                        className={`flex-1 px-6 py-3 rounded-lg text-sm font-bold transition-all ${viewMode === mode
                            ? "bg-purple-500 text-white"
                            : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        {mode === "skill-to-role" ? "Skill → Roles" : "Role → Skills"}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Selector */}
                <div>
                    <div className="flex gap-2 mb-3">
                        <input
                            placeholder="Search skill..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="flex-1 px-4 py-2 bg-[#0F0F12] border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500"
                        />
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors"
                        >
                            Search
                        </button>
                    </div>

                    <div className="space-y-2 max-h-[420px] overflow-y-auto">
                        {(viewMode === "skill-to-role" ? filteredSkills : filteredRoles).map(
                            (item: any) => (
                                <button
                                    key={item.skillId || item.roleId}
                                    onClick={() =>
                                        setSelectedId(item.skillId || item.roleId)
                                    }
                                    className={`w-full text-left p-3 rounded-lg border ${selectedId === (item.skillId || item.roleId)
                                        ? "border-purple-500 bg-purple-500/10"
                                        : "border-slate-800"
                                        }`}
                                >
                                    <p className="font-bold">{item.skillName || item.roleName}</p>
                                </button>
                            )
                        )}
                    </div>
                </div>

                {/* Mapping Display */}
                <div className="lg:col-span-2 bg-[#0F0F12] border border-slate-800 rounded-2xl p-6">
                    {(viewMode === "skill-to-role" && (selectedSkill || customSkill)) || (viewMode === "role-to-skill" && selectedRole) ? (
                        <>
                            <h3 className="text-2xl font-bold mb-4">
                                {viewMode === "skill-to-role" ? (selectedSkill?.skillName || customSkill) : selectedRole?.roleName}
                            </h3>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-sm text-purple-400 animate-pulse">Consulting AI Career Coach...</p>
                                </div>
                            ) : (
                                dataToDisplay
                                    .sort((a: any, b: any) => (b.matchPercentage || 0) - (a.matchPercentage || 0))
                                    .map((item: any) => {
                                        const alignment = item.alignment || item.priority; // Handle both types
                                        const style = getAlignmentStyle(alignment);
                                        const Icon = style.icon;
                                        const itemId = item.roleId || item.skillId;
                                        const itemName = item.roleName || item.skillName;
                                        const isExpanded = expandedCard === itemId;

                                        // Specific to role cards (skill-to-role view)
                                        const isRoleCard = !!item.matchPercentage;

                                        return (
                                            <div
                                                key={itemId}
                                                onClick={() => setExpandedCard(isExpanded ? null : itemId)}
                                                className={`
                                                    mb-4 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300
                                                    ${style.bg} ${style.border} hover:shadow-lg
                                                `}
                                            >
                                                <div className={`px-5 pt-5 ${isRoleCard ? 'pb-0' : 'pb-5'}`}>
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <Icon className={`w-6 h-6 ${style.color}`} />
                                                            <div>
                                                                <h4 className="font-bold text-slate-100 text-lg">
                                                                    {itemName}
                                                                </h4>
                                                                <p className={`text-sm ${style.color}`}>
                                                                    {alignment} {isRoleCard ? 'match' : 'priority'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {isRoleCard && (
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-2xl font-bold text-slate-100">
                                                                    {item.matchPercentage}%
                                                                </span>
                                                                <ChevronDown
                                                                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                                                />
                                                            </div>
                                                        )}
                                                        {!isRoleCard && (
                                                            <ChevronDown
                                                                className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                                            />
                                                        )}
                                                    </div>

                                                    {isRoleCard && (
                                                        <div className="w-full bg-slate-800 h-2 rounded mb-0">
                                                            <div
                                                                className={`${style.bar} h-2 rounded`}
                                                                style={{ width: `${item.matchPercentage}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div
                                                    className={`
                                                        px-5 bg-black/20 transition-all duration-300 ease-in-out border-slate-700/50 overflow-hidden
                                                        ${isExpanded ? 'max-h-40 py-4 opacity-100 border-t' : 'max-h-0 py-0 opacity-0 border-t-0'}
                                                    `}
                                                >
                                                    {item.reason && (
                                                        <p className="text-sm text-slate-300 italic leading-relaxed">
                                                            "{item.reason}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                            )}
                        </>
                    ) : (
                        <p className="text-center text-slate-500">No data available</p>
                    )}
                </div>
            </div>
        </section>
    );
}
