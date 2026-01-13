"use client";

// ============================================
// SECTION 2: INDUSTRY DEMAND
// ============================================
// Shows job demand by role category with drill-down
// Click on a category to see subcategories (e.g., SDE → Frontend, Backend, Full Stack)

import React, { useState } from 'react';
import { Briefcase, ChevronRight, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { IndustryRole } from '@/data/trendingData';
import SectionHeader from './SectionHeader';

interface IndustryDemandSectionProps {
    roles: IndustryRole[];
}

export default function IndustryDemandSection({ roles }: IndustryDemandSectionProps) {
    const [selectedCategory, setSelectedCategory] = useState<IndustryRole | null>(null);
    const [hoveredBar, setHoveredBar] = useState<string | null>(null);

    // Prepare main category data
    const mainCategoryData = roles.map(role => ({
        id: role.id,
        name: role.category,
        jobs: role.totalJobs,
        growth: role.growth,
        color: role.color
    }));

    // Prepare subcategory data when a category is selected
    const subcategoryData = selectedCategory
        ? selectedCategory.subcategories.map(sub => ({
            id: sub.id,
            name: sub.name,
            jobs: sub.jobs,
            growth: sub.growth,
            salary: sub.avgSalary,
            color: selectedCategory.color
        }))
        : [];

    const handleBarClick = (data: any) => {
        if (!selectedCategory) {
            // Drill down into category
            const category = roles.find(role => role.id === data.id);
            if (category) {
                setSelectedCategory(category);
            }
        }
    };

    const handleBack = () => {
        setSelectedCategory(null);
    };

    return (
        <section className="space-y-6">
            <SectionHeader
                icon={Briefcase}
                iconColor="text-blue-500"
                title="Industry Demand"
                description="Job openings by role category this month"
            />

            {/* Breadcrumb Navigation */}
            {selectedCategory && (
                <div className="flex items-center gap-2 text-sm">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to All Categories
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                    <span className="text-slate-300 font-medium">{selectedCategory.category}</span>
                </div>
            )}

            {/* Main Chart */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-100">
                        {selectedCategory
                            ? `${selectedCategory.category} - Role Breakdown`
                            : 'Job Openings by Category'
                        }
                    </h3>
                    {!selectedCategory && (
                        <span className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">
                            Click on any bar to drill down
                        </span>
                    )}
                </div>

                <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={selectedCategory ? subcategoryData : mainCategoryData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis
                                dataKey="name"
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                cursor={{ fill: '#1e293b' }}
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    border: '1px solid #1e293b',
                                    borderRadius: '8px',
                                    padding: '12px'
                                }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 shadow-xl">
                                                <p className="font-bold text-slate-100 mb-2">{data.name}</p>
                                                <div className="space-y-1 text-sm">
                                                    <p className="text-slate-300">
                                                        <span className="text-slate-500">Jobs:</span> {data.jobs.toLocaleString('en-US')}
                                                    </p>
                                                    <p className="text-green-400">
                                                        <span className="text-slate-500">Growth:</span> +{data.growth}%
                                                    </p>
                                                    {data.salary && (
                                                        <p className="text-blue-400">
                                                            <span className="text-slate-500">Avg Salary:</span> {data.salary}
                                                        </p>
                                                    )}
                                                </div>
                                                {!selectedCategory && (
                                                    <p className="text-xs text-slate-500 mt-2 italic">Click to see breakdown</p>
                                                )}
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                dataKey="jobs"
                                radius={[8, 8, 0, 0]}
                                onClick={handleBarClick}
                                onMouseEnter={(data) => setHoveredBar(data.id)}
                                onMouseLeave={() => setHoveredBar(null)}
                                cursor={!selectedCategory ? 'pointer' : 'default'}
                            >
                                {(selectedCategory ? subcategoryData : mainCategoryData).map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        opacity={hoveredBar === entry.id ? 1 : 0.8}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Stats Summary */}
                <div className="mt-6 pt-6 border-t border-slate-800">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedCategory ? (
                            <>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-slate-100">
                                        {selectedCategory.totalJobs.toLocaleString('en-US')}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Total Jobs</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-400">
                                        +{selectedCategory.growth}%
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Category Growth</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-slate-100">
                                        {selectedCategory.subcategories.length}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Role Types</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-400">
                                        {selectedCategory.subcategories[0]?.avgSalary || 'N/A'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Top Avg Salary</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-slate-100">
                                        {roles.reduce((sum, role) => sum + role.totalJobs, 0).toLocaleString('en-US')}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Total Jobs</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-slate-100">
                                        {roles.length}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Categories</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-400">
                                        +{Math.round(roles.reduce((sum, role) => sum + role.growth, 0) / roles.length)}%
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Avg Growth</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-purple-400">
                                        {roles.find(r => r.category === 'Data & AI Roles')?.category.split(' ')[0] || 'AI'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Fastest Growing</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Cards (when not drilled down) */}
            {!selectedCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => setSelectedCategory(role)}
                            className="group bg-slate-900/50 border border-slate-800 rounded-xl p-5 text-left transition-all hover:border-slate-700 hover:shadow-xl hover:-translate-y-1"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `${role.color}20`, color: role.color }}
                                >
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">
                                    +{role.growth}%
                                </span>
                            </div>
                            <h4 className="font-bold text-slate-100 mb-1 group-hover:text-blue-400 transition-colors">
                                {role.category}
                            </h4>
                            <p className="text-2xl font-black text-slate-200 mb-2">
                                {(role.totalJobs / 1000).toFixed(1)}k
                            </p>
                            <p className="text-xs text-slate-500">
                                {role.subcategories.length} role types
                            </p>
                            <div className="mt-3 flex items-center gap-1 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                View breakdown <ChevronRight className="w-3 h-3" />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
}
