"use client";

// ============================================
// SECTION 4: EFFORT VS REWARD
// ============================================
// Scatter plot showing learning effort vs job demand
// Helps students make data-driven decisions about what to learn

import React, { useState } from 'react';
import { Target, TrendingUp } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ZAxis } from 'recharts';
import { EffortRewardData } from '@/data/trendingData';
import SectionHeader from './SectionHeader';
import Link from 'next/link';

interface EffortRewardSectionProps {
    data: EffortRewardData[];
}

export default function EffortRewardSection({ data: initialData }: EffortRewardSectionProps) {
    const [data, setData] = useState<EffortRewardData[]>(initialData);
    const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Filter data by category
    const filteredData = selectedCategory === 'all'
        ? data
        : data.filter(item => item.category === selectedCategory);

    // Prepare scatter data
    const scatterData = filteredData.map(item => ({
        ...item,
        x: item.effortLevel,
        y: item.demandLevel,
        z: item.jobOpenings / 100 // Size of bubble
    }));

    // Get color based on ROI
    const getROIColor = (roi: string) => {
        switch (roi) {
            case 'High': return '#22c55e'; // green
            case 'Medium': return '#eab308'; // yellow
            case 'Low': return '#f97316'; // orange
            default: return '#64748b'; // slate
        }
    };

    // Get quadrant info
    const getQuadrantInfo = (x: number, y: number) => {
        if (x <= 5 && y > 5) return { label: '🔥 Best ROI', color: 'text-green-400', desc: 'High demand, low effort' };
        if (x > 5 && y > 5) return { label: '⭐ Long-term', color: 'text-blue-400', desc: 'High demand, high effort' };
        if (x <= 5 && y <= 5) return { label: '⚡ Quick Wins', color: 'text-yellow-400', desc: 'Low demand, low effort' };
        return { label: '⚠️ Avoid', color: 'text-red-400', desc: 'Low demand, high effort' };
    };

    const categories = ['all', 'Frontend', 'Backend', 'AI/ML', 'DevOps', 'Mobile', 'Design'];

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const res = await fetch(`/api/effort-demand?skill=${encodeURIComponent(searchQuery)}`);
            const newData = await res.json();

            if (Array.isArray(newData)) {
                // Determine if we merge or replace? 
                // Let's MERGE for now so they see it compared to others, 
                // but if it exists, replace it.

                const newSkill = newData[0];
                if (newSkill) {
                    // REPLACEMENT: Only show the searched skill as requested
                    setData([newSkill]);

                    // Highlight the new skill & Select it to show reason
                    setHoveredSkill(newSkill.skillId);
                    // We need to type cast or update interface for placementReason, but for now assuming it comes through
                    setHoveredSkill(null); // Clear hover to rely on selection
                    setSelectedCategory('all');
                }
            }
        } catch (error) {
            console.error("Failed to search skill:", error);
        } finally {
            setIsSearching(false);
            setSearchQuery('');
        }
    };

    // State for clicked skill to show details
    const [selectedSkillData, setSelectedSkillData] = useState<EffortRewardData & { placementReason?: string } | null>(null);

    return (
        <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <SectionHeader
                    icon={Target}
                    iconColor="text-green-500"
                    title="Effort vs Reward Analysis"
                    description="Make smart learning decisions based on effort required and job demand"

                />

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Analyze a specific skill..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[#0F0F12] border border-slate-800 rounded-lg py-2 pl-4 pr-10 text-sm text-slate-200 focus:outline-none focus:border-green-500/50 transition-colors w-full md:w-64"
                        />
                        {/* Status Icon inside input */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                            {isSearching ? <div className="animate-spin h-3 w-3 border-2 border-slate-500 border-t-green-500 rounded-full" /> : <Target size={14} />}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSearching || !searchQuery.trim()}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-900/20"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* AI Reasoning Panel (Appears on Selection) */}
            {selectedSkillData && (
                <div className="bg-gradient-to-r from-slate-900 to-[#0F0F12] border border-blue-500/30 rounded-xl p-4 relative animate-in fade-in slide-in-from-top-2">
                    <button
                        onClick={() => setSelectedSkillData(null)}
                        className="absolute top-2 right-3 text-slate-500 hover:text-slate-300"
                    >
                        ×
                    </button>
                    <div className="flex gap-4 items-start">
                        <div className="bg-blue-500/20 p-2 rounded-lg mt-1">
                            <TrendingUp className="text-blue-400" size={20} />
                        </div>
                        <div>
                            <h4 className="text-blue-400 font-bold text-sm mb-1">AI Insight: Why is {selectedSkillData.skillName} here?</h4>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                {selectedSkillData.placementReason || `${selectedSkillData.skillName} has a Market Demand of ${selectedSkillData.demandLevel}/10 and Learning Effort of ${selectedSkillData.effortLevel}/10.`}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${selectedCategory === category
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                : 'bg-[#0F0F12] text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }
            `}
                    >
                        {category === 'all' ? 'All Categories' : category}
                    </button>
                ))}
            </div>

            {/* Scatter Plot */}
            <div className="bg-[#0F0F12] border border-slate-800 rounded-2xl p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-100 mb-2">
                        Learning Effort vs Job Demand
                    </h3>
                    <p className="text-sm text-slate-400">
                        Bubble size represents number of job openings. <span className="text-green-400 font-bold">Click any bubble for AI reasoning.</span>
                    </p>
                </div>

                <div className="h-[500px] w-full relative">
                    {/* Quadrant Labels */}
                    <div className="absolute top-8 left-8 z-10 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                        <p className="text-xs font-bold text-green-400">🔥 Best ROI</p>
                        <p className="text-[10px] text-slate-500">High demand, low effort</p>
                    </div>
                    <div className="absolute top-8 right-8 z-10 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2">
                        <p className="text-xs font-bold text-blue-400">⭐ Long-term Investment</p>
                        <p className="text-[10px] text-slate-500">High demand, high effort</p>
                    </div>
                    <div className="absolute bottom-8 left-8 z-10 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2">
                        <p className="text-xs font-bold text-yellow-400">⚡ Quick Wins</p>
                        <p className="text-[10px] text-slate-500">Low demand, low effort</p>
                    </div>
                    <div className="absolute bottom-8 right-8 z-10 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                        <p className="text-xs font-bold text-red-400">⚠️ Avoid for Now</p>
                        <p className="text-[10px] text-slate-500">Low demand, high effort</p>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

                            {/* Quadrant dividers */}
                            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#334155" strokeWidth={2} strokeDasharray="5 5" />
                            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#334155" strokeWidth={2} strokeDasharray="5 5" />

                            <XAxis
                                type="number"
                                dataKey="x"
                                name="Effort"
                                domain={[0, 10]}
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                label={{ value: 'Learning Effort (months) →', position: 'bottom', fill: '#94a3b8', fontSize: 12 }}
                            />
                            <YAxis
                                type="number"
                                dataKey="y"
                                name="Demand"
                                domain={[0, 10]}
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                label={{ value: '← Job Demand', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }}
                            />
                            <ZAxis type="number" dataKey="z" range={[100, 1000]} />

                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload as EffortRewardData;
                                        const quadrant = getQuadrantInfo(data.effortLevel, data.demandLevel);

                                        return (
                                            <div className="bg-[#0F0F12] border border-slate-800 rounded-xl p-4 shadow-2xl min-w-[250px]">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h4 className="font-bold text-slate-100 text-lg">{data.skillName}</h4>
                                                    <span
                                                        className="text-xs font-bold px-2 py-1 rounded"
                                                        style={{
                                                            backgroundColor: `${getROIColor(data.roi)}20`,
                                                            color: getROIColor(data.roi)
                                                        }}
                                                    >
                                                        {data.roi} ROI
                                                    </span>
                                                </div>

                                                <div className="space-y-2 text-sm mb-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Learning Time:</span>
                                                        <span className="text-slate-200 font-medium">{data.learningMonths?.toString().replace(/months?/gi, '').trim()} months</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Avg Salary:</span>
                                                        <span className="text-green-400 font-bold">{data.avgSalary}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Category:</span>
                                                        <span className="text-blue-400">{data.category}</span>
                                                    </div>
                                                </div>

                                                <div className={`pt-3 border-t border-slate-800 ${quadrant.color}`}>
                                                    <p className="text-xs font-bold">{quadrant.label}</p>
                                                    <p className="text-[10px] text-slate-500">{quadrant.desc}</p>
                                                </div>

                                                <p className="text-[10px] text-slate-500 mt-2 text-center italic">Click for AI reasoning</p>


                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />

                            <Scatter
                                data={scatterData}
                                onMouseEnter={(data) => setHoveredSkill(data.skillId)}
                                onMouseLeave={() => setHoveredSkill(null)}
                                onClick={(data) => {
                                    // Set selected skill data (including placementReason if available)
                                    // data.payload contains the full object
                                    setSelectedSkillData(data.payload as any);
                                }}
                            >
                                {scatterData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={getROIColor(entry.roi)}
                                        opacity={hoveredSkill === entry.skillId || (selectedSkillData?.skillId === entry.skillId) ? 1 : 0.6}
                                        cursor="pointer"
                                        stroke={selectedSkillData?.skillId === entry.skillId ? "#fff" : "none"}
                                        strokeWidth={2}
                                    />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ROI Legend */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <h4 className="font-bold text-green-400">High ROI</h4>
                    </div>
                    <p className="text-sm text-slate-400">
                        Best learning investment. High demand with reasonable effort.
                    </p>

                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <h4 className="font-bold text-yellow-400">Medium ROI</h4>
                    </div>
                    <p className="text-sm text-slate-400">
                        Good investment but requires more effort or has moderate demand.
                    </p>

                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <h4 className="font-bold text-orange-400">Low ROI</h4>
                    </div>
                    <p className="text-sm text-slate-400">
                        Consider carefully. High effort with lower demand or niche applications.
                    </p>

                </div>
            </div>
        </section>
    );
}
