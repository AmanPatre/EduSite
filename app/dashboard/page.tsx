"use client";
import { useState, useEffect, useRef, Fragment } from "react";
import { Menu, Transition } from '@headlessui/react';
import axios from "axios";
import { useSession } from "next-auth/react";
import { Loader2, Flame, Trophy, Target, Calendar as CalIcon, ChevronDown, Check, MoreVertical, Play, Trash2 } from "lucide-react";
import Link from "next/link";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

export default function DashboardPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [monthBlocks, setMonthBlocks] = useState<any[]>([]); // Array of Months, each containing weeks
    const [skillData, setSkillData] = useState<any[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>("Current");
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const years = ["Current", "2025", "2024"];

    const handleDeleteRoadmap = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("Are you sure you want to stop this journey? This action cannot be undone.")) return;

        try {
            await axios.delete("/api/roadmap/delete", { data: { roadmapId: id } });
            setStats((prev: any) => ({
                ...prev,
                roadmaps: prev.roadmaps.filter((r: any) => r.id !== id)
            }));
        } catch (err) {
            console.error("Failed to delete", err);
            alert("Failed to delete roadmap");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!session) return;
            try {
                const res = await axios.get("/dashboard/stats");
                const { activities, roadmaps } = res.data;
                setStats({ activities, roadmaps });

                // Process Heatmap Data
                const map = new Map();
                activities.forEach((act: any) => {
                    const date = new Date(act.createdAt).toISOString().split('T')[0];
                    map.set(date, (map.get(date) || 0) + 1);
                });

                // Generate Month-wise Data (Discrete Blocks)
                const monthBlocksData: any[] = [];
                const today = new Date();
                let startDate: Date;
                let endDate: Date;

                if (selectedYear === "Current") {
                    // Last 365 Days logic
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 364);
                    // Start from the month of the startDate
                    startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
                    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                } else {
                    // Specific Calendar Year logic
                    const y = parseInt(selectedYear);
                    startDate = new Date(y, 0, 1); // Jan 1st
                    endDate = new Date(y, 11, 31); // Dec 31st
                }

                let loopDate = new Date(startDate);

                while (loopDate <= endDate) {
                    const year = loopDate.getFullYear();
                    const month = loopDate.getMonth();
                    const monthName = loopDate.toLocaleString('default', { month: 'short' });
                    const daysInMonth = new Date(year, month + 1, 0).getDate();

                    const weeksInMonth = [];
                    let currentWeek = [];

                    // Pad the first week if month doesn't start on Sunday
                    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
                    for (let i = 0; i < firstDayOfMonth; i++) {
                        currentWeek.push(null);
                    }

                    // Fill days
                    for (let d = 1; d <= daysInMonth; d++) {
                        const dateObj = new Date(year, month, d);
                        const dateStr = dateObj.toISOString().split('T')[0];

                        currentWeek.push({
                            date: dateStr,
                            count: map.get(dateStr) || 0,
                            inFuture: dateObj > today,
                            isBeforeWindow: selectedYear === "Current" && (dateObj < new Date(new Date().setDate(new Date().getDate() - 364)))
                        });

                        if (currentWeek.length === 7) {
                            weeksInMonth.push(currentWeek);
                            currentWeek = [];
                        }
                    }

                    // Pad the last week if incomplete
                    if (currentWeek.length > 0) {
                        while (currentWeek.length < 7) {
                            currentWeek.push(null);
                        }
                        weeksInMonth.push(currentWeek);
                    }

                    monthBlocksData.push({
                        name: monthName,
                        weeks: weeksInMonth
                    });

                    // Next month
                    loopDate.setMonth(loopDate.getMonth() + 1);
                }

                setMonthBlocks(monthBlocksData);

                setMonthBlocks(monthBlocksData);

                // Process Skill Data for Radar
                const skillMap = new Map();

                // Helper to normalize topic names
                const normalizeTopic = (topic: string) => {
                    if (!topic) return "General";
                    const t = topic.trim().split(" ")[0]; // "React JS" -> "React"
                    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
                };

                // 1. Base Score & Progress Score from Roadmaps
                roadmaps.forEach((r: any) => {
                    const topic = normalizeTopic(r.topic);
                    const currentScore = skillMap.get(topic) || 0;

                    // Base: +10 for starting
                    // Progress: +Up to 50 based on % completion
                    const progressScore = (r.currentStep / (r.content.length || 1)) * 50;

                    skillMap.set(topic, currentScore + 10 + progressScore);
                });

                // 2. Activity Score
                activities.forEach((a: any) => {
                    const topic = normalizeTopic(a.topic);
                    const currentScore = skillMap.get(topic) || 0;

                    // +2 for every valid activity in that topic
                    skillMap.set(topic, currentScore + 2);
                });

                const skills = Array.from(skillMap.entries()).map(([subject, score]) => ({
                    subject,
                    A: Math.min(Math.round(score), 100), // Cap at 100
                    fullMark: 100
                })).sort((a, b) => b.A - a.A).slice(0, 5); // Top 5 skills

                setSkillData(skills);

            } catch (error) {
                console.error("Dashboard fetch error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [session, selectedYear]);

    // Auto-scroll to end on data load
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
    }, [monthBlocks]);

    if (!session) return <div className="p-10 text-center text-slate-400">Please log in to view dashboard.</div>;

    return (
        <div className="min-h-screen bg-transparent text-slate-100 p-8 pb-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-8 relative z-10 pt-24">

                {/* Header */}
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[300px] h-[150px] bg-purple-500/10 blur-[60px] rounded-full pointer-events-none"></div>
                    <div className="relative">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 pb-2">
                            Mastery Dashboard
                        </h1>
                        <p className="text-slate-400 mt-1">Consistency is the key to victory, {session.user?.name}.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-[#0F0F12] border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><Flame className="w-5 h-5" /></div>
                            <div>
                                <div className="text-sm text-slate-500">Total Activities</div>
                                <div className="text-xl font-bold">{stats?.activities?.length || 0}</div>
                            </div>
                        </div>
                        <div className="bg-[#0F0F12] border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Target className="w-5 h-5" /></div>
                            <div>
                                <div className="text-sm text-slate-500">Active Goals</div>
                                <div className="text-xl font-bold">{stats?.roadmaps?.length || 0}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-slate-500" /></div>
                ) : (
                    <>
                        {/* GRID & RADAR ROW */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* ACTIVITY HEATMAP (Span 2) */}
                            <div
                                className="lg:col-span-2 bg-[#0F0F12] border border-slate-800 rounded-2xl p-8"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <CalIcon className="w-4 h-4 text-purple-400" /> Activity Log
                                        <span className="text-slate-500 text-sm font-normal ml-2">
                                            {selectedYear === "Current" ? "(Last 365 Days)" : `(${selectedYear})`}
                                        </span>
                                    </h3>

                                    {/* Year Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-colors"
                                        >
                                            {selectedYear}
                                            <ChevronDown className="w-3 h-3 text-slate-500" />
                                        </button>

                                        {isYearDropdownOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setIsYearDropdownOpen(false)}
                                                />
                                                <div className="absolute top-full right-0 mt-2 w-32 bg-[#1a1b1e] border border-slate-800 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
                                                    {years.map((year) => (
                                                        <button
                                                            key={year}
                                                            onClick={() => {
                                                                setSelectedYear(year);
                                                                setIsYearDropdownOpen(false);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 flex items-center justify-between group"
                                                        >
                                                            <span className={selectedYear === year ? "text-purple-400 font-bold" : ""}>
                                                                {year}
                                                            </span>
                                                            {selectedYear === year && <Check className="w-3 h-3 text-purple-400" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div
                                    className="overflow-x-auto custom-scrollbar pb-2"
                                    ref={scrollContainerRef}
                                >
                                    <div className="flex items-start min-w-max">
                                        {/* Day Labels Column */}
                                        <div className="flex flex-col gap-[3px] text-[10px] text-slate-500 pr-2 pt-[1px] sticky left-0 bg-[#0F0F12] z-10">
                                            <div className="h-2.5"></div> {/* Sun */}
                                            <div className="h-2.5 flex items-center leading-none">Mon</div>
                                            <div className="h-2.5"></div> {/* Tue */}
                                            <div className="h-2.5 flex items-center leading-none">Wed</div>
                                            <div className="h-2.5"></div> {/* Thu */}
                                            <div className="h-2.5 flex items-center leading-none">Fri</div>
                                            <div className="h-2.5"></div> {/* Sat */}
                                        </div>

                                        {/* Month Blocks Container */}
                                        <div className="flex gap-4"> {/* Gap between Month Blocks */}
                                            {monthBlocks.map((block, mIdx) => (
                                                <div key={mIdx} className="flex flex-col items-center">
                                                    {/* The Weeks Grid for this Month */}
                                                    <div className="flex gap-[3px]">
                                                        {block.weeks.map((week: any[], wIdx: number) => (
                                                            <div key={wIdx} className="flex flex-col gap-[3px]">
                                                                {week.map((day: any | null, dIdx: number) => {
                                                                    // Handle null padding or invisible days
                                                                    if (!day) return <div key={dIdx} className="w-2.5 h-2.5" />; // Invisible placeholder

                                                                    return (
                                                                        <div
                                                                            key={dIdx}
                                                                            title={!day.inFuture ? `${day.date}: ${day.count} activities` : 'Future'}
                                                                            className={`w-2.5 h-2.5 rounded-[1px] transition-all 
                                                                                ${day.inFuture || day.isBeforeWindow ? 'opacity-0' :
                                                                                    day.count === 0 ? 'bg-slate-800/80 hover:bg-slate-700 hover:ring-1 hover:ring-white/50' :
                                                                                        day.count < 3 ? 'bg-purple-900 hover:bg-purple-800 hover:ring-1 hover:ring-white/50' :
                                                                                            day.count < 6 ? 'bg-purple-600 hover:bg-purple-500 hover:ring-1 hover:ring-white/50' :
                                                                                                'bg-purple-400 hover:bg-purple-300 shadow-[0_0_8px_rgba(192,132,252,0.4)] hover:ring-1 hover:ring-white/50'
                                                                                }`}
                                                                        />
                                                                    );
                                                                })}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {/* Month Label at Bottom */}
                                                    <div className="text-[10px] text-slate-500 mt-2">{block.name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-4 justify-end border-t border-slate-800/50 pt-4">
                                    <span>Less</span>
                                    <div className="w-2.5 h-2.5 bg-slate-800 rounded-[1px]"></div>
                                    <div className="w-2.5 h-2.5 bg-purple-900 rounded-[1px]"></div>
                                    <div className="w-2.5 h-2.5 bg-purple-600 rounded-[1px]"></div>
                                    <div className="w-2.5 h-2.5 bg-purple-400 rounded-[1px]"></div>
                                    <span>More</span>
                                </div>
                            </div>

                            {/* SKILL RADAR */}
                            <div className="bg-[#0F0F12] border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
                                <h3 className="text-lg font-bold mb-2 w-full text-left flex items-center gap-2 z-10">
                                    <Trophy className="w-4 h-4 text-purple-400" /> Skill Balance
                                </h3>
                                <div className="w-full h-[250px] z-10">
                                    {skillData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData}>
                                                <PolarGrid stroke="#334155" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                <Radar
                                                    name="Skill Level"
                                                    dataKey="A"
                                                    stroke="#a855f7"
                                                    fill="#a855f7"
                                                    fillOpacity={0.5}
                                                />
                                                <RechartsTooltip
                                                    contentStyle={{ backgroundColor: '#0F0F12', borderColor: '#1e293b', color: '#f1f5f9' }}
                                                    itemStyle={{ color: '#a855f7' }}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                                            Complete roadmaps to generate stats!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ACTIVE PROJECTS */}
                        <div className="mt-8">
                            <h3 className="text-xl font-bold mb-6">Active Journeys</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {stats?.roadmaps?.map((roadmap: any) => (
                                    <div key={roadmap.id} className="block group relative">
                                        <div className="bg-[#0F0F12] border border-slate-800 p-5 rounded-xl hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all h-full flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <Link href={`/roadmap?id=${roadmap.id}`} className="font-bold text-lg text-slate-200 group-hover:text-purple-400 transition-colors hover:underline">
                                                        {roadmap.topic}
                                                    </Link>

                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded border border-purple-500/20 capitalize">{roadmap.status}</span>

                                                        <Menu as="div" className="relative inline-block text-left">
                                                            <Menu.Button className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white focus:outline-none">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Menu.Button>
                                                            <Transition
                                                                as={Fragment}
                                                                enter="transition ease-out duration-100"
                                                                enterFrom="transform opacity-0 scale-95"
                                                                enterTo="transform opacity-100 scale-100"
                                                                leave="transition ease-in duration-75"
                                                                leaveFrom="transform opacity-100 scale-100"
                                                                leaveTo="transform opacity-0 scale-95"
                                                            >
                                                                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-slate-700 rounded-md bg-[#1a1b1e] border border-slate-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                                                    <div className="p-1">
                                                                        <Menu.Item>
                                                                            {({ active }) => (
                                                                                <Link
                                                                                    href={`/roadmap?id=${roadmap.id}`}
                                                                                    className={`${active ? 'bg-purple-500/10 text-purple-400' : 'text-slate-200'
                                                                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                                                                >
                                                                                    <Play className="mr-2 h-4 w-4" />
                                                                                    Continue Learning
                                                                                </Link>
                                                                            )}
                                                                        </Menu.Item>
                                                                    </div>
                                                                    <div className="p-1">
                                                                        <Menu.Item>
                                                                            {({ active }) => (
                                                                                <button
                                                                                    onClick={(e) => handleDeleteRoadmap(roadmap.id, e)}
                                                                                    className={`${active ? 'bg-red-500/10 text-red-500' : 'text-red-400'
                                                                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm w-full text-left`}
                                                                                >
                                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                                    Exit Learning
                                                                                </button>
                                                                            )}
                                                                        </Menu.Item>
                                                                    </div>
                                                                </Menu.Items>
                                                            </Transition>
                                                        </Menu>
                                                    </div>
                                                </div>

                                                <Link href={`/roadmap?id=${roadmap.id}`} className="block">
                                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                                                        <div className="bg-purple-500 h-full" style={{ width: `${(roadmap.currentStep / roadmap.content.length) * 100}%` }}></div>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-slate-500">
                                                        <span>Step {roadmap.currentStep} of {roadmap.content.length}</span>
                                                        <span>{Math.round((roadmap.currentStep / roadmap.content.length) * 100)}%</span>
                                                    </div>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!stats?.roadmaps || stats.roadmaps.length === 0) && (
                                    <div className="col-span-full text-center py-10 border border-dashed border-slate-800 rounded-xl text-slate-500">
                                        No active roadmaps found. <a href="/roadmap" className="text-purple-400 hover:underline">Start one now?</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
