"use client";

// ============================================
// SECTION 1: TRENDING SKILLS
// ============================================
// Shows trending skills in card format with growth metrics
// Includes interactive chart showing learning trends over time

import React, { useState } from 'react';
import { TrendingUp, Flame, Activity, Search } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import SectionHeader from './SectionHeader';
import TransparencyNote from './TransparencyNote';
import Link from 'next/link';
// Define the shape of our API Data
interface TrendScoreResult {
    name: string;
    category: string;
    trendScore: number;
    breakdown: {
        github: number;
        youtube: number;
    };
}

interface TrendingSkillsSectionProps {
    skills: any[]; // Accepting the raw API response
}

export default function TrendingSkillsSection({ skills }: TrendingSkillsSectionProps) {
    // Safety check
    const hasData = skills && skills.length > 0;
    const initialSelection: string[] = []; // Start with nothing selected

    const [selectedSkills, setSelectedSkills] = useState<string[]>(initialSelection);
    const [filter, setFilter] = useState<'all' | 'Frontend' | 'Backend' | 'AI/ML' | 'DevOps' | 'Mobile' | 'Design'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // If no data
    if (!hasData) {
        return (
            <section className="space-y-6 animate-pulse">
                <div className="h-10 w-48 bg-slate-800 rounded-lg"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-40 bg-slate-800 rounded-xl"></div>
                    ))}
                </div>
            </section>
        );
    }

    // --- FILTER LOGIC ---
    let displaySkills = skills;

    if (searchTerm.trim() !== '') {
        displaySkills = skills.filter(skill =>
            skill.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } else {
        if (filter === 'all') {
            // Default: Show Top 8 (API already sends them sorted by score)
            displaySkills = skills.slice(0, 8);
        } else {
            displaySkills = skills.filter(skill => skill.category === filter);
        }
    }

    const toggleSkillSelection = (skillName: string) => {
        setSelectedSkills(prev =>
            prev.includes(skillName)
                ? prev.filter(n => n !== skillName)
                : [...prev, skillName]
        );
    };

    // Helper to generate a fake "trend history" for the chart if we don't have one yet
    // In Phase 4, we will use real history from DB
    const getMockTrendHistory = (score: number) => {
        // Create a curve ending at the current score
        return [
            Math.max(0, score - 15),
            Math.max(0, score - 10),
            Math.max(0, score - 5),
            score
        ];
    };

    return (
        <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <SectionHeader
                    icon={Flame}
                    iconColor="text-orange-500"
                    title="Trending Skills"
                    description="Real-time popularity score (0-100) based on GitHub & YouTube activity."
                />

                {/* SEARCH BAR */}
                <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for a skill..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0F0F12] border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block pl-10 p-2.5 placeholder-slate-500 transition-all"
                    />
                </div>
            </div>

            <TransparencyNote />

            {/* Filter Tabs */}
            {searchTerm === '' && (
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`
               px-4 py-2 rounded-lg text-sm font-medium transition-all
               ${filter === 'all'
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }
             `}
                    >
                        🔥 Top Trending
                    </button>
                    {(['Frontend', 'Backend', 'AI/ML', 'DevOps', 'Mobile', 'Design'] as const).map(category => (
                        <button
                            key={category}
                            onClick={() => setFilter(category)}
                            className={`
      px-4 py-2 rounded-lg text-sm font-medium transition-all
      ${filter === category
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                                    : 'bg-[#0F0F12] text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }
    `}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            )}

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displaySkills.map((skill, index) => {
                    const isSelected = selectedSkills.includes(skill.name);
                    const isTop3 = index < 3 && filter === 'all';
                    const mockHistory = getMockTrendHistory(skill.trendScore);

                    return (
                        <div
                            key={skill.name}
                            onClick={() => toggleSkillSelection(skill.name)}
                            className={`
                relative group cursor-pointer rounded-xl border p-5 transition-all duration-300
                ${isSelected
                                    ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/20'
                                    : 'bg-[#0F0F12] border-slate-800 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10'
                                }
              `}
                        >
                            {/* Top Trending Badge */}
                            {isTop3 && (
                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                                    🔥 #{index + 1}
                                </div>
                            )}

                            {/* Title Row */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-100">{skill.name}</h3>
                                    <span className="text-xs text-slate-500 uppercase">{skill.category}</span>
                                </div>

                                {/* Score Circle */}
                                <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm
                    ${skill.trendScore >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                                        skill.trendScore >= 50 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                                            'bg-slate-700/50 text-slate-400 border border-slate-600'}
                `}>
                                    {skill.trendScore}
                                </div>
                            </div>

                            {/* Metrics Row */}
                            <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                                <div className="bg-slate-800/50 p-2 rounded flex flex-col items-center">
                                    <span className="text-slate-400">GitHub</span>
                                    <span className="font-bold text-slate-200">{skill.breakdown.github.toFixed(0)}</span>
                                </div>
                                <div className="bg-slate-800/50 p-2 rounded flex flex-col items-center">
                                    <span className="text-slate-400">YouTube</span>
                                    <span className="font-bold text-slate-200">{skill.breakdown.youtube.toFixed(0)}</span>
                                </div>
                            </div>

                            {/* Sparkline (Visual only for Phase 3) */}
                            <div className="h-10 -mx-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={mockHistory.map((val, i) => ({ v: val }))}>
                                        <Area type="monotone" dataKey="v" stroke={isSelected ? '#a855f7' : '#475569'} fill="none" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Selection Indicator */}
                            {isSelected && (
                                <div className="absolute top-3 right-3 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
