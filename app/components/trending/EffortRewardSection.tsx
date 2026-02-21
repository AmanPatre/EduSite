"use client";

import React, { useState } from 'react';
import { Target, TrendingUp } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ZAxis } from 'recharts';
import { EffortRewardData } from '@/data/trendingData';
import SectionHeader from './SectionHeader';

interface EffortRewardSectionProps {
    data: EffortRewardData[];
}

export default function EffortRewardSection({ data: initialData }: EffortRewardSectionProps) {
    const [data, setData] = useState<EffortRewardData[]>(initialData);
    const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [selectedSkillData, setSelectedSkillData] = useState<EffortRewardData & { placementReason?: string } | null>(null);

    const filteredData = selectedCategory === 'all'
        ? data
        : data.filter(item => item.category === selectedCategory);

    const scatterData = filteredData.map(item => ({
        ...item,
        x: item.effortLevel,
        y: item.demandLevel,
        z: item.jobOpenings / 100
    }));

    const getROIColor = (roi: string) => {
        switch (roi) {
            case 'High': return '#22c55e';
            case 'Medium': return '#eab308';
            case 'Low': return '#f97316';
            default: return '#64748b';
        }
    };

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
                const newSkill = newData[0];
                if (newSkill) {
                    setData([newSkill]);
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

    return (
        <section className="space-y-4 sm:space-y-6">
            {/* Header + Search */}
            <div className="flex flex-col gap-4">
                <SectionHeader
                    icon={Target}
                    iconColor="text-green-500"
                    title="Effort vs Reward Analysis"
                    description="Make smart learning decisions based on effort required and job demand"
                />
                <form onSubmit={handleSearch} className="flex gap-2 w-full">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Analyze a specific skill..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[#0F0F12] border border-slate-800 rounded-lg py-2 pl-4 pr-10 text-sm text-slate-200 focus:outline-none focus:border-green-500/50 transition-colors w-full"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                            {isSearching
                                ? <div className="animate-spin h-3 w-3 border-2 border-slate-500 border-t-green-500 rounded-full" />
                                : <Target size={14} />}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isSearching || !searchQuery.trim()}
                        className="bg-green-600 hover:bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-900/20 whitespace-nowrap"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* AI Insight Panel */}
            {selectedSkillData && (
                <div className="bg-gradient-to-r from-slate-900 to-[#0F0F12] border border-blue-500/30 rounded-xl p-4 relative animate-in fade-in slide-in-from-top-2">
                    <button
                        onClick={() => setSelectedSkillData(null)}
                        className="absolute top-2 right-3 text-slate-500 hover:text-slate-300 text-lg"
                    >×</button>
                    <div className="flex gap-3 items-start">
                        <div className="bg-blue-500/20 p-2 rounded-lg mt-1 flex-shrink-0">
                            <TrendingUp className="text-blue-400" size={18} />
                        </div>
                        <div>
                            <h4 className="text-blue-400 font-bold text-sm mb-1">AI Insight: Why is {selectedSkillData.skillName} here?</h4>
                            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                                {selectedSkillData.placementReason || `${selectedSkillData.skillName} has a Market Demand of ${selectedSkillData.demandLevel}/10 and Learning Effort of ${selectedSkillData.effortLevel}/10.`}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Filter — scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0
                            ${selectedCategory === category
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                : 'bg-[#0F0F12] text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                            }`}
                    >
                        {category === 'all' ? 'All' : category}
                    </button>
                ))}
            </div>

            {/* Scatter Plot */}
            <div className="bg-[#0F0F12] border border-slate-800 rounded-2xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-4">
                    Learning Effort vs Job Demand
                </h3>

                {/* Quadrant legend — grid on mobile instead of absolute overlay */}
                <div className="grid grid-cols-2 gap-2 mb-4 sm:hidden">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-2 py-1.5">
                        <p className="text-xs font-bold text-green-400">🔥 Best ROI</p>
                        <p className="text-[10px] text-slate-500">High demand, low effort</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-2 py-1.5">
                        <p className="text-xs font-bold text-blue-400">⭐ Long-term</p>
                        <p className="text-[10px] text-slate-500">High demand, high effort</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-2 py-1.5">
                        <p className="text-xs font-bold text-yellow-400">⚡ Quick Wins</p>
                        <p className="text-[10px] text-slate-500">Low demand, low effort</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-2 py-1.5">
                        <p className="text-xs font-bold text-red-400">⚠️ Avoid</p>
                        <p className="text-[10px] text-slate-500">Low demand, high effort</p>
                    </div>
                </div>

                {/* Chart with responsive height */}
                <div className="h-[280px] sm:h-[400px] md:h-[500px] w-full relative">
                    {/* Quadrant labels — desktop only (absolute overlay) */}
                    <div className="hidden sm:block absolute top-4 left-4 z-10 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2 pointer-events-none">
                        <p className="text-xs font-bold text-green-400">🔥 Best ROI</p>
                        <p className="text-[10px] text-slate-500">High demand, low effort</p>
                    </div>
                    <div className="hidden sm:block absolute top-4 right-4 z-10 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2 pointer-events-none">
                        <p className="text-xs font-bold text-blue-400">⭐ Long-term Investment</p>
                        <p className="text-[10px] text-slate-500">High demand, high effort</p>
                    </div>
                    <div className="hidden sm:block absolute bottom-4 left-4 z-10 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2 pointer-events-none">
                        <p className="text-xs font-bold text-yellow-400">⚡ Quick Wins</p>
                        <p className="text-[10px] text-slate-500">Low demand, low effort</p>
                    </div>
                    <div className="hidden sm:block absolute bottom-4 right-4 z-10 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 pointer-events-none">
                        <p className="text-xs font-bold text-red-400">⚠️ Avoid for Now</p>
                        <p className="text-[10px] text-slate-500">Low demand, high effort</p>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 30, right: 20, bottom: 30, left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis
                                type="number"
                                dataKey="x"
                                name="Effort"
                                domain={[0, 10]}
                                stroke="#64748b"
                                fontSize={10}
                                tickLine={false}
                                label={{ value: 'Effort →', position: 'bottom', fill: '#94a3b8', fontSize: 10 }}
                            />
                            <YAxis
                                type="number"
                                dataKey="y"
                                name="Demand"
                                domain={[0, 10]}
                                stroke="#64748b"
                                fontSize={10}
                                tickLine={false}
                                width={30}
                                label={{ value: '← Demand', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
                            />
                            <ZAxis type="number" dataKey="z" range={[40, 400]} />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const d = payload[0].payload as EffortRewardData;
                                        const quadrant = getQuadrantInfo(d.effortLevel, d.demandLevel);
                                        return (
                                            <div className="bg-[#0F0F12] border border-slate-800 rounded-xl p-3 shadow-2xl max-w-[220px]">
                                                <div className="flex items-start justify-between mb-2 gap-2">
                                                    <h4 className="font-bold text-slate-100 text-sm leading-tight">{d.skillName}</h4>
                                                    <span className="text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                                                        style={{ backgroundColor: `${getROIColor(d.roi)}20`, color: getROIColor(d.roi) }}>
                                                        {d.roi}
                                                    </span>
                                                </div>
                                                <div className="space-y-1 text-xs mb-2">
                                                    <div className="flex justify-between gap-4">
                                                        <span className="text-slate-500">Effort:</span>
                                                        <span className="text-slate-200">{d.effortLevel}/10</span>
                                                    </div>
                                                    <div className="flex justify-between gap-4">
                                                        <span className="text-slate-500">Demand:</span>
                                                        <span className="text-slate-200">{d.demandLevel}/10</span>
                                                    </div>
                                                    <div className="flex justify-between gap-4">
                                                        <span className="text-slate-500">Salary:</span>
                                                        <span className="text-green-400 font-bold">{d.avgSalary}</span>
                                                    </div>
                                                </div>
                                                <div className={`pt-2 border-t border-slate-800 ${quadrant.color}`}>
                                                    <p className="text-xs font-bold">{quadrant.label}</p>
                                                </div>
                                                <p className="text-[10px] text-slate-500 mt-1 italic">Tap for AI reasoning</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Scatter
                                data={scatterData}
                                onMouseEnter={(d) => setHoveredSkill(d.skillId)}
                                onMouseLeave={() => setHoveredSkill(null)}
                                onClick={(d) => setSelectedSkillData(d.payload as any)}
                            >
                                {scatterData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={getROIColor(entry.roi)}
                                        opacity={hoveredSkill === entry.skillId || selectedSkillData?.skillId === entry.skillId ? 1 : 0.65}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
                        <h4 className="font-bold text-green-400 text-sm">High ROI</h4>
                    </div>
                    <p className="text-xs text-slate-400">Best learning investment — high demand, reasonable effort.</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 flex-shrink-0" />
                        <h4 className="font-bold text-yellow-400 text-sm">Medium ROI</h4>
                    </div>
                    <p className="text-xs text-slate-400">Good investment but needs more effort or has moderate demand.</p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0" />
                        <h4 className="font-bold text-orange-400 text-sm">Low ROI</h4>
                    </div>
                    <p className="text-xs text-slate-400">High effort with lower demand. Consider carefully.</p>
                </div>
            </div>
        </section>
    );
}
