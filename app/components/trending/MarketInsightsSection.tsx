"use client";

// ============================================
// SECTION 5: MARKET INSIGHTS
// ============================================
// AI-powered market insights and trends
// Converts data into actionable understanding

import React, { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, Sprout, Filter, RotateCcw } from 'lucide-react';
import { MarketInsight, getSkillById } from '@/data/trendingData';
import SectionHeader from './SectionHeader';
import SkillTag from './SkillTag';

interface MarketInsightsSectionProps {
    insights: MarketInsight[];
}

export default function MarketInsightsSection({ insights }: MarketInsightsSectionProps) {
    const [filterType, setFilterType] = useState<'all' | 'trend' | 'warning' | 'opportunity'>('all');
    const [filterImpact, setFilterImpact] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');

    // Filter insights
    const filteredInsights = insights.filter(insight => {
        const typeMatch = filterType === 'all' || insight.type === filterType;
        const impactMatch = filterImpact === 'all' || insight.impact === filterImpact;
        return typeMatch && impactMatch;
    });

    // Get icon and styling based on type
    const getInsightStyle = (type: string) => {
        switch (type) {
            case 'trend':
                return {
                    icon: TrendingUp,
                    color: 'text-blue-400',
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/20',
                    badge: 'bg-blue-500/20 text-blue-400',
                    emoji: '📈'
                };
            case 'warning':
                return {
                    icon: AlertTriangle,
                    color: 'text-amber-400',
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/20',
                    badge: 'bg-amber-500/20 text-amber-400',
                    emoji: '⚠️'
                };
            case 'opportunity':
                return {
                    icon: Sprout,
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    badge: 'bg-emerald-500/20 text-emerald-400',
                    emoji: '🌱'
                };
            default:
                return {
                    icon: Brain,
                    color: 'text-slate-400',
                    bg: 'bg-slate-500/10',
                    border: 'border-slate-500/20',
                    badge: 'bg-slate-500/20 text-slate-400',
                    emoji: '💡'
                };
        }
    };

    // Get impact badge color
    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'High': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'Low': return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    return (
        <section className="space-y-6">
            <SectionHeader
                icon={Brain}
                iconColor="text-cyan-500"
                title="Market Insights"
                description="Data-driven insights to guide your learning journey"
                badge="AI-Powered"
            />

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-400 font-medium">Type:</span>
                    <div className="flex gap-2">
                        {(['all', 'trend', 'warning', 'opportunity'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`
                  px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all
                  ${filterType === type
                                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                                    }
                `}
                            >
                                {type === 'all' ? 'All' : type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400 font-medium">Impact:</span>
                    <div className="flex gap-2">
                        {(['all', 'High', 'Medium', 'Low'] as const).map(impact => (
                            <button
                                key={impact}
                                onClick={() => setFilterImpact(impact)}
                                className={`
                  px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all
                  ${filterImpact === impact
                                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                                    }
                `}
                            >
                                {impact}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Result Count & Reset */}
            <div className="flex items-center justify-between bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800">
                <span className="text-sm text-slate-400 flex items-center gap-2">
                    Showing <span className="text-white font-bold">{filteredInsights.length}</span> of <span className="text-white font-bold">{insights.length}</span> insights
                </span>

                {(filterType !== 'all' || filterImpact !== 'all') && (
                    <button
                        onClick={() => {
                            setFilterType('all');
                            setFilterImpact('all');
                        }}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors bg-cyan-500/10 px-3 py-1.5 rounded-md border border-cyan-500/20"
                    >
                        <RotateCcw className="w-3 h-3" />
                        Reset Filters
                    </button>
                )}
            </div>

            {/* Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInsights.map((insight) => {
                    const style = getInsightStyle(insight.type);
                    const Icon = style.icon;

                    return (
                        <div
                            key={insight.id}
                            className={`
                group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300
                hover:shadow-2xl hover:-translate-y-1
                ${style.bg} ${style.border}
              `}
                        >
                            {/* Background Icon */}
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Icon className="w-24 h-24" />
                            </div>

                            {/* Header */}
                            <div className="relative z-10 mb-4">
                                <div className="flex items-start justify-between mb-3">
                                    <span className="text-3xl">{style.emoji}</span>
                                    <div className="flex flex-col gap-2 items-end">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${style.badge} border-current`}>
                                            {insight.type}
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${getImpactColor(insight.impact)}`}>
                                            {insight.impact} Impact
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-slate-100 mb-2 leading-tight">
                                    {insight.title}
                                </h3>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-slate-300 leading-relaxed mb-4 relative z-10">
                                {insight.description}
                            </p>

                            {/* Related Skills */}
                            {insight.relatedSkills.length > 0 && (
                                <div className="relative z-10">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">
                                        Related Skills
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {insight.relatedSkills.map(skillId => {
                                            const skill = getSkillById(skillId);
                                            return skill ? (
                                                <SkillTag
                                                    key={skillId}
                                                    skillName={skill.name}
                                                    slug={skill.slug}
                                                    size="sm"
                                                    variant="outlined"
                                                />
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Timeframe */}
                            <div className="mt-4 pt-4 border-t border-slate-800 relative z-10">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">Timeframe:</span>
                                    <span className={`font-bold ${style.color}`}>{insight.timeframe}</span>
                                </div>
                            </div>

                            {/* Hover Glow Effect */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${style.bg} blur-xl`} />
                        </div>
                    );
                })}
            </div>

            {/* No Results */}
            {filteredInsights.length === 0 && (
                <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No insights match your filters</p>
                    <button
                        onClick={() => {
                            setFilterType('all');
                            setFilterImpact('all');
                        }}
                        className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-medium hover:bg-cyan-600 transition-colors"
                    >
                        Reset Filters
                    </button>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-400">
                        {insights.filter(i => i.type === 'trend').length}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Trends</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-amber-400">
                        {insights.filter(i => i.type === 'warning').length}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Warnings</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">
                        {insights.filter(i => i.type === 'opportunity').length}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Opportunities</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-red-400">
                        {insights.filter(i => i.impact === 'High').length}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">High Impact</p>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-5">
                <h4 className="font-bold text-slate-100 mb-2 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-cyan-400" />
                    Understanding Market Insights
                </h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-300 mt-3">
                    <div>
                        <p className="font-bold text-blue-400 mb-1">📈 Trends</p>
                        <p className="text-xs text-slate-400">Emerging patterns in the market that indicate growing opportunities</p>
                    </div>
                    <div>
                        <p className="font-bold text-amber-400 mb-1">⚠️ Warnings</p>
                        <p className="text-xs text-slate-400">Areas of oversaturation or declining demand to be aware of</p>
                    </div>
                    <div>
                        <p className="font-bold text-emerald-400 mb-1">🌱 Opportunities</p>
                        <p className="text-xs text-slate-400">Underserved niches with high growth potential</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
