"use client";

// ============================================
// SECTION 1: TRENDING SKILLS
// ============================================
// Shows trending skills in card format with growth metrics
// Includes interactive chart showing learning trends over time

import React, { useState } from 'react';
import { TrendingUp, Flame, Users, Search } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingSkill } from '@/data/trendingData';
import SectionHeader from './SectionHeader';
import Link from 'next/link';

interface TrendingSkillsSectionProps {
    skills: TrendingSkill[];
}

export default function TrendingSkillsSection({ skills }: TrendingSkillsSectionProps) {
    // Safety check
    const initialSelection = skills.length > 0 ? [skills[0]?.id, skills[2]?.id].filter(Boolean) : [];

    const [selectedSkills, setSelectedSkills] = useState<string[]>(initialSelection);
    const [filter, setFilter] = useState<'all' | 'Frontend' | 'Backend' | 'AI/ML' | 'DevOps' | 'Mobile' | 'Design'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // If no data
    if (!skills || skills.length === 0) {
        // ... (loading state)
        return (
            <section className="space-y-6 animate-pulse">
                {/* ... skeleton ... */}
            </section>
        );
    }

    // --- FILTER LOGIC ---
    let displaySkills = skills;

    if (searchTerm.trim() !== '') {
        // 1. Search Mode (Global Search)
        displaySkills = skills.filter(skill =>
            skill.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } else {
        // 2. Tab Mode
        if (filter === 'all') {
            // "Default": Show Top 8 Trending (Sorted by Growth)
            displaySkills = [...skills]
                .sort((a, b) => b.growthRate - a.growthRate)
                .slice(0, 8);
        } else {
            // Category Filter
            displaySkills = skills.filter(skill => skill.category === filter);
        }
    }

    // Ensure we sort whatever result we have by growth for nicer display
    const sortedDisplaySkills = [...displaySkills].sort((a, b) => b.growthRate - a.growthRate);


    // ... (Chart Data Preparation Logic remains same)
    const historyLength = skills[0]?.learningTrend?.length || 3;
    const monthLabels = Array.from({ length: historyLength }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - ((historyLength - 1) - i));
        return d.toLocaleString('default', { month: 'short' });
    });

    const chartData = selectedSkills.length > 0
        ? skills
            .filter(skill => selectedSkills.includes(skill.id))
            .map(skill => ({
                name: skill.name,
                data: skill.learningTrend.map((value, index) => ({
                    month: monthLabels[index],
                    [skill.name]: value
                }))
            }))
        : [];

    const mergedChartData = chartData.length > 0
        ? chartData[0].data.map((item, index) => {
            const merged: any = { month: item.month };
            chartData.forEach(skillData => {
                const skillName = skillData.name;
                merged[skillName] = skillData.data[index][skillName];
            });
            return merged;
        })
        : [];

    // ... helpers
    const toggleSkillSelection = (skillId: string) => {
        // ...
        setSelectedSkills(prev =>
            prev.includes(skillId)
                ? prev.filter(id => id !== skillId)
                : [...prev, skillId]
        );
    };
    const colors = ['#3b82f6', '#a855f7', '#22c55e', '#f59e0b', '#ec4899'];

    return (
        <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <SectionHeader
                    icon={Flame}
                    iconColor="text-orange-500"
                    title="Trending Skills"
                    description="What students are learning most this month"
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
                        className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-10 p-2.5 placeholder-slate-500 transition-all"
                    />
                </div>
            </div>

            {/* Filter Tabs (Only show if NOT searching) */}
            {searchTerm === '' && (
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`
                           px-4 py-2 rounded-lg text-sm font-medium transition-all
                           ${filter === 'all'
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' // Highlight "Top Trending"
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
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }
                `}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            )}

            {/* Search Results Header */}
            {searchTerm !== '' && (
                <p className="text-sm text-slate-400">
                    Found {sortedDisplaySkills.length} result{sortedDisplaySkills.length !== 1 ? 's' : ''} for <span className="text-blue-400 font-bold">"{searchTerm}"</span>
                </p>
            )}

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedDisplaySkills.map((skill, index) => {
                    const isSelected = selectedSkills.includes(skill.id);
                    const isTopTrending = index < 3;

                    return (
                        <div
                            key={skill.id}
                            onClick={() => toggleSkillSelection(skill.id)}
                            className={`
                relative group cursor-pointer rounded-xl border p-5 transition-all duration-300
                ${isSelected
                                    ? 'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/20'
                                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:shadow-xl'
                                }
              `}
                        >
                            {/* Top Trending Badge */}
                            {isTopTrending && (
                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                                    🔥 #{index + 1}
                                </div>
                            )}

                            {/* Skill Icon & Name */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl">{skill.icon}</span>
                                    <div>
                                        <h3 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                                            {skill.name}
                                        </h3>
                                        <span className="text-xs text-slate-500 uppercase tracking-wide">
                                            {skill.category}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="space-y-2 mb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        Learners
                                    </span>
                                    <span className="text-sm font-bold text-slate-200">
                                        {(skill.currentLearners / 1000).toFixed(1)}k
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        Growth
                                    </span>
                                    <span className={`text-sm font-bold ${skill.growthRate > 50 ? 'text-green-400' :
                                        skill.growthRate > 30 ? 'text-blue-400' :
                                            'text-slate-400'
                                        }`}>
                                        {skill.growthRate > 0 ? '+' : ''}{skill.growthRate}%
                                    </span>
                                </div>
                            </div>

                            {/* Mini Sparkline */}
                            <div className="h-12 -mx-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={skill.learningTrend.map((val, i) => ({ i, val }))}>
                                        <defs>
                                            <linearGradient id={`gradient-${skill.id}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={isSelected ? '#3b82f6' : '#64748b'} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={isSelected ? '#3b82f6' : '#64748b'} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="val"
                                            stroke={isSelected ? '#3b82f6' : '#64748b'}
                                            strokeWidth={2}
                                            fill={`url(#gradient-${skill.id})`}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* View Details Link */}
                            <Link
                                href={`/trending/${skill.slug}`}
                                onClick={(e) => e.stopPropagation()}
                                className="mt-3 text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                View Details →
                            </Link>

                            {/* Selection Indicator */}
                            {isSelected && (
                                <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Large Interactive Chart */}
            {selectedSkills.length > 0 && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-100">Learning Trend Comparison</h3>
                        <span className="text-xs text-slate-500">
                            Click on cards above to compare skills
                        </span>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mergedChartData}>
                                <defs>
                                    {selectedSkills.map((skillId, index) => {
                                        const skill = skills.find(s => s.id === skillId);
                                        return (
                                            <linearGradient key={skillId} id={`color-${skillId}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0} />
                                            </linearGradient>
                                        );
                                    })}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis
                                    dataKey="month"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        border: '1px solid #1e293b',
                                        borderRadius: '8px'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: any) => [`${(value / 1000).toFixed(1)}k learners`, '']}
                                />
                                {selectedSkills.map((skillId, index) => {
                                    const skill = skills.find(s => s.id === skillId);
                                    return skill ? (
                                        <Area
                                            key={skillId}
                                            type="monotone"
                                            dataKey={skill.name}
                                            stroke={colors[index % colors.length]}
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill={`url(#color-${skillId})`}
                                        />
                                    ) : null;
                                })}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </section>
    );
}
