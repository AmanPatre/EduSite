"use client";

// ============================================
// SECTION 3: SKILL ↔ ROLE MAPPING
// ============================================
// Bidirectional mapping between skills and roles
// Shows which roles a skill unlocks, or which skills a role requires

import React, { useState } from 'react';
import { GitBranch, CheckCircle2, AlertCircle, MinusCircle } from 'lucide-react';
import { SkillRoleMapping, RoleSkillMapping } from '@/data/trendingData';
import SectionHeader from './SectionHeader';
import Link from 'next/link';

interface SkillRoleMappingSectionProps {
    skillMappings: SkillRoleMapping[];
    roleMappings: RoleSkillMapping[];
}

export default function SkillRoleMappingSection({
    skillMappings,
    roleMappings
}: SkillRoleMappingSectionProps) {
    const [viewMode, setViewMode] = useState<'skill-to-role' | 'role-to-skill'>('skill-to-role');
    const [searchTerm, setSearchTerm] = useState(''); // Search State
    const [selectedId, setSelectedId] = useState<string>(
        viewMode === 'skill-to-role' ? skillMappings[0]?.skillId : roleMappings[0]?.roleId
    );

    // Filter Logic
    const filteredSkills = skillMappings.filter(m => m.skillName.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredRoles = roleMappings.filter(m => m.roleName.toLowerCase().includes(searchTerm.toLowerCase()));

    // Get current selection data
    const selectedSkillMapping = skillMappings.find(m => m.skillId === selectedId);
    const selectedRoleMapping = roleMappings.find(m => m.roleId === selectedId);

    const currentData = viewMode === 'skill-to-role' ? selectedSkillMapping : selectedRoleMapping;

    // Helper to get alignment icon and color
    const getAlignmentStyle = (alignment: string) => {
        switch (alignment) {
            case 'Strong':
            case 'Critical':
                return {
                    icon: CheckCircle2,
                    color: 'text-green-400',
                    bg: 'bg-green-500/10',
                    border: 'border-green-500/20'
                };
            case 'Medium':
            case 'Important':
                return {
                    icon: AlertCircle,
                    color: 'text-yellow-400',
                    bg: 'bg-yellow-500/10',
                    border: 'border-yellow-500/20'
                };
            default:
                return {
                    icon: MinusCircle,
                    color: 'text-slate-500',
                    bg: 'bg-slate-500/10',
                    border: 'border-slate-500/20'
                };
        }
    };

    return (
        <section className="space-y-6">
            <SectionHeader
                icon={GitBranch}
                iconColor="text-purple-500"
                title="Skill ↔ Role Mapping"
                description="Understand which skills unlock which roles, and vice versa"
            />

            {/* View Mode Toggle */}
            <div className="flex items-center justify-center gap-4 p-1 bg-[#0F0F12] rounded-xl border border-slate-800 max-w-md mx-auto">
                <button
                    onClick={() => {
                        setViewMode('skill-to-role');
                        setSelectedId(skillMappings[0]?.skillId);
                        setSearchTerm(''); // Reset search on toggle
                    }}
                    className={`
            flex-1 px-6 py-3 rounded-lg text-sm font-bold transition-all
            ${viewMode === 'skill-to-role'
                            ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                            : 'text-slate-400 hover:text-slate-200'
                        }
          `}
                >
                    Skill → Roles
                </button>
                <button
                    onClick={() => {
                        setViewMode('role-to-skill');
                        setSelectedId(roleMappings[0]?.roleId);
                        setSearchTerm('');
                    }}
                    className={`
            flex-1 px-6 py-3 rounded-lg text-sm font-bold transition-all
            ${viewMode === 'role-to-skill'
                            ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                            : 'text-slate-400 hover:text-slate-200'
                        }
          `}
                >
                    Role → Skills
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Selector */}
                <div className="lg:col-span-1 space-y-3">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                        {viewMode === 'skill-to-role' ? 'Select a Skill' : 'Select a Role'}
                    </h3>

                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder={viewMode === 'skill-to-role' ? "Search skills..." : "Search roles..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0F0F12] border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500 mb-2"
                    />

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {viewMode === 'skill-to-role' ? (
                            filteredSkills.length > 0 ? (
                                filteredSkills.map((mapping) => (
                                    <button
                                        key={mapping.skillId}
                                        onClick={() => setSelectedId(mapping.skillId)}
                                        className={`
                    w-full text-left px-4 py-3 rounded-lg border transition-all
                    ${selectedId === mapping.skillId
                                                ? 'bg-purple-500/10 border-purple-500/50 text-purple-300'
                                                : 'bg-[#0F0F12] border-slate-800 text-slate-300 hover:border-slate-700'
                                            }
                  `}
                                    >
                                        <p className="font-bold">{mapping.skillName}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {mapping.roles.length} role{mapping.roles.length !== 1 ? 's' : ''}
                                        </p>
                                    </button>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 text-center py-4">No skills found</p>
                            )
                        ) : (
                            filteredRoles.length > 0 ? (
                                filteredRoles.map((mapping) => (
                                    <button
                                        key={mapping.roleId}
                                        onClick={() => setSelectedId(mapping.roleId)}
                                        className={`
                    w-full text-left px-4 py-3 rounded-lg border transition-all
                    ${selectedId === mapping.roleId
                                                ? 'bg-purple-500/10 border-purple-500/50 text-purple-300'
                                                : 'bg-[#0F0F12] border-slate-800 text-slate-300 hover:border-slate-700'
                                            }
                  `}
                                    >
                                        <p className="font-bold">{mapping.roleName}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {mapping.requiredSkills.length} skill{mapping.requiredSkills.length !== 1 ? 's' : ''}
                                        </p>
                                    </button>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 text-center py-4">No roles found</p>
                            )
                        )}
                    </div>
                </div>

                {/* Right: Mapping Display */}
                <div className="lg:col-span-2">
                    <div className="bg-[#0F0F12] border border-slate-800 rounded-2xl p-6">
                        {viewMode === 'skill-to-role' && selectedSkillMapping ? (
                            <>
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-slate-100 mb-2">
                                        {selectedSkillMapping.skillName}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        This skill unlocks the following roles:
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {selectedSkillMapping.roles
                                        .sort((a, b) => b.matchPercentage - a.matchPercentage)
                                        .map((role) => {
                                            const style = getAlignmentStyle(role.alignment);
                                            const Icon = style.icon;

                                            return (
                                                <div
                                                    key={role.roleId}
                                                    className={`
                            border rounded-xl p-5 transition-all hover:shadow-lg
                            ${style.bg} ${style.border}
                          `}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <Icon className={`w-6 h-6 ${style.color}`} />
                                                            <div>
                                                                <h4 className="font-bold text-slate-100">{role.roleName}</h4>
                                                                <span className={`text-xs font-bold uppercase ${style.color}`}>
                                                                    {role.alignment} Match
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold text-slate-100">
                                                                {role.matchPercentage}%
                                                            </p>
                                                            <p className="text-xs text-slate-500">Match Score</p>
                                                        </div>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
                                                        <div
                                                            className={`h-2 rounded-full transition-all ${role.alignment === 'Strong' ? 'bg-green-500' :
                                                                role.alignment === 'Medium' ? 'bg-yellow-500' :
                                                                    'bg-slate-500'
                                                                }`}
                                                            style={{ width: `${role.matchPercentage}%` }}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-slate-400">
                                                            Demand Score: <span className="font-bold text-slate-200">{role.demandScore}/10</span>
                                                        </span>
                                                        {role.alignment === 'Strong' && (
                                                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                                                                ⭐ Recommended
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </>
                        ) : viewMode === 'role-to-skill' && selectedRoleMapping ? (
                            <>
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-slate-100 mb-2">
                                        {selectedRoleMapping.roleName}
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        Required skills for this role:
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {selectedRoleMapping.requiredSkills.map((skill) => {
                                        const style = getAlignmentStyle(skill.priority);
                                        const Icon = style.icon;

                                        return (
                                            <div
                                                key={skill.skillId}
                                                className={`
                          border rounded-xl p-5 transition-all hover:shadow-lg
                          ${style.bg} ${style.border}
                        `}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Icon className={`w-6 h-6 ${style.color}`} />
                                                        <div>
                                                            <Link
                                                                href={`/trending/${skill.skillName.toLowerCase().replace(/\s+/g, '-')}`}
                                                                className="font-bold text-slate-100 hover:text-blue-400 transition-colors"
                                                            >
                                                                {skill.skillName}
                                                            </Link>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={`text-xs font-bold uppercase ${style.color}`}>
                                                                    {skill.priority}
                                                                </span>
                                                                <span className="text-xs text-slate-500">•</span>
                                                                <span className="text-xs text-slate-400">
                                                                    {skill.proficiencyLevel} level
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {skill.priority === 'Critical' && (
                                                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded font-bold">
                                                            MUST HAVE
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-slate-500 py-12">
                                No data available
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-5">
                <h4 className="font-bold text-slate-100 mb-2 flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-purple-400" />
                    How to Use This Section
                </h4>
                <ul className="text-sm text-slate-300 space-y-1 ml-7">
                    <li>• <strong>Skill → Roles:</strong> See which career paths a skill opens up</li>
                    <li>• <strong>Role → Skills:</strong> Understand what to learn for your target role</li>
                    <li>• <strong>Match %:</strong> Higher percentage = stronger alignment</li>
                    <li>• <strong>Priority:</strong> Critical skills are must-haves for the role</li>
                </ul>
            </div>
        </section>
    );
}
