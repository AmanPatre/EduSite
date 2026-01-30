"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Play, BookOpen, CheckCircle, ArrowRight, ChevronDown, ChevronUp, RefreshCw, Save, Check } from "lucide-react";
import ResourceViewer from "../components/roadmap/ResourceViewer";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function RoadmapPage() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const urlId = searchParams.get('id');
    const [topic, setTopic] = useState("");
    const [roadmap, setRoadmap] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [isLearning, setIsLearning] = useState(false);
    const [expandedStep, setExpandedStep] = useState<number | null>(null);

    // Persistence State
    const [isSaved, setIsSaved] = useState(false);
    const [roadmapId, setRoadmapId] = useState<string | null>(null);
    const [completedSteps, setCompletedSteps] = useState<number>(0);

    // Fetch Saved Roadmap on Load
    useEffect(() => {
        const fetchSavedRoadmap = async () => {
            if (!session) return;
            try {
                // Fetch specific roadmap if ID is in URL, otherwise fetch latest active
                const url = urlId ? `/roadmap/user?id=${urlId}` : "/roadmap/user";
                const res = await axios.get(url);
                // If the user has put route.ts in app/roadmap/user/route.ts, then path is /roadmap/user
                if (res.data?.roadmap) {
                    setRoadmap(res.data.roadmap.content);
                    setTopic(res.data.roadmap.topic);
                    setRoadmapId(res.data.roadmap.id);
                    setCompletedSteps(res.data.roadmap.currentStep || 0);
                    setIsLearning(true);
                    setIsSaved(true);
                }
            } catch (error) {
                console.log("No saved roadmap or error fetching", error);
            }
        };
        fetchSavedRoadmap();
    }, [session]);

    const generateRoadmap = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setRoadmap(null);
        setIsLearning(false);
        setExpandedStep(null);
        setIsSaved(false);
        setRoadmapId(null);
        setCompletedSteps(0);
        try {
            const res = await axios.post("/api/generate-roadmap", { topic });
            setRoadmap(res.data.roadmap);
        } catch (err) {
            alert("Failed to generate roadmap");
        } finally {
            setLoading(false);
        }
    };

    const handleStartLearning = async () => {
        setIsLearning(true);
        if (session && !isSaved && roadmap) {
            try {
                const res = await axios.post("/roadmap/save", { topic, roadmap });
                setIsSaved(true);
                if (res.data?.id) {
                    setRoadmapId(res.data.id);
                }
            } catch (e) {
                console.error("Failed to save roadmap", e);
            }
        }
    };

    const handleMarkComplete = async (index: number) => {
        if (!roadmapId) return;

        // Optimistic update
        const newCount = index + 1;
        if (newCount > completedSteps) {
            setCompletedSteps(newCount);

            try {
                await axios.post("/api/roadmap/progress", {
                    roadmapId,
                    stepIndex: index
                });
            } catch (error) {
                console.error("Failed to update progress", error);
                // Revert if failed looks bad, usually we just silent fail or toast
            }
        }
    };

    const handleUndo = async (index: number) => {
        if (!roadmapId) return;

        // Optimistic update: Undo means we set completed count to THIS index
        // e.g. If I undo step 0 (index 0), completed count becomes 0.
        // If I undo step 5 (index 4), completed count becomes 4.
        const newCount = index;
        setCompletedSteps(newCount);

        try {
            // Update DB to new LAST completed index, which is newCount - 1
            await axios.post("/api/roadmap/progress", {
                roadmapId,
                stepIndex: newCount - 1
            });
        } catch (error) {
            console.error("Failed to undo progress", error);
        }
    };

    const toggleStep = (index: number) => {
        if (!isLearning) {
            alert("Click 'Start Learning' in the left sidebar first!");
            return;
        }

        if (expandedStep === index) {
            setExpandedStep(null);
        } else {
            setExpandedStep(index);
        }
    };

    return (
        <div className="min-h-screen bg-transparent text-slate-100 p-8 pb-24 relative overflow-hidden">
            {/* Content Container with Top Padding for Navbar */}
            <div className="max-w-7xl mx-auto relative z-10 pt-24">
                <div className="text-center mb-12 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                    <h1 className="relative text-5xl font-extrabold mb-4 pb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                        AI Learning Roadmap
                    </h1>

                </div>

                {/* Input Section */}
                {!roadmap && (
                    <div className="flex gap-4 mb-12 max-w-2xl mx-auto animate-in fade-in duration-500">
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Enter a role (e.g. 'MERN Stack Developer')"
                            className="flex-1 bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-500"
                        />
                        <button
                            onClick={generateRoadmap}
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl font-bold disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Generate Path"}
                        </button>
                    </div>
                )}

                {roadmap && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">

                        {/* LEFT SIDEBAR: CONTROLS & INFO */}
                        <div className="lg:col-span-1">
                            <div className="bg-[#0F0F12]/80 border border-slate-700 p-6 rounded-2xl backdrop-blur-sm sticky top-24 shadow-xl z-30">
                                <h2 className="text-xl font-bold text-white mb-2 capitalize leading-tight">
                                    {isSaved ? "Continuing:" : "Draft:"} {topic}
                                </h2>

                                {/* Progress Bar */}
                                {isSaved && (
                                    <div className="mb-6">
                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                            <span>Progress</span>
                                            <span>{Math.round((completedSteps / roadmap.length) * 100)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 transition-all duration-500"
                                                style={{ width: `${(completedSteps / roadmap.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mb-6">
                                    <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">
                                        {roadmap.length} Steps
                                    </span>
                                    {isSaved && <span className="text-xs text-emerald-400 font-bold flex items-center gap-1"><Save className="w-3 h-3" /> Saved</span>}
                                </div>

                                {!isLearning ? (
                                    <button
                                        onClick={handleStartLearning}
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group"
                                    >
                                        <Play className="fill-white w-4 h-4" /> Start Learning
                                    </button>
                                ) : (
                                    <div className="w-full flex items-center justify-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20">
                                        <CheckCircle className="w-5 h-5" /> Learning Active
                                    </div>
                                )}

                                <p className="text-xs text-slate-500 mt-6 leading-relaxed">
                                    {isLearning
                                        ? "Mark steps as complete to track your progress!"
                                        : "Click 'Start Learning' to save this roadmap to your profile."}
                                </p>

                                <button
                                    onClick={() => { setRoadmap(null); setTopic(""); setIsLearning(false); setIsSaved(false); setCompletedSteps(0); setRoadmapId(null); }}
                                    className="w-full mt-4 text-slate-400 hover:text-white text-xs font-medium border border-slate-800 hover:bg-slate-800 p-2 rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="w-3 h-3" /> Generate New Path
                                </button>
                            </div>
                        </div>

                        {/* RIGHT CONTENT: UNIFIED TIMELINE VIEW */}
                        <div className="lg:col-span-3 relative">
                            {/* Timeline Line (Background Layer) */}
                            <div className="absolute inset-0 ml-5 md:ml-8 w-0.5 bg-gradient-to-b from-transparent via-slate-700 to-transparent pointer-events-none"></div>

                            <div className="space-y-8 relative z-10">
                                {roadmap.map((step, index) => {
                                    const isCompleted = index < completedSteps;
                                    return (
                                        <div key={index} className="relative flex items-start group">
                                            {/* Icon */}
                                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border transition-colors shadow shrink-0 font-bold text-xs ring-4 ring-slate-900 z-10 mr-4 md:absolute md:left-8 md:-translate-x-1/2 ${isCompleted
                                                ? 'bg-emerald-500 text-white border-emerald-400'
                                                : expandedStep === index ? 'text-white border-purple-500 bg-purple-600' : 'text-slate-300 border-slate-600 bg-slate-900'
                                                }`}>
                                                {isCompleted ? <Check className="w-5 h-5" /> : step.step}
                                            </div>

                                            {/* Card */}


                                            <div
                                                // onClick={() => toggleStep(index)} // Move click to header for better control
                                                className={`flex-1 rounded-2xl border transition-all duration-300 shadow-sm relative z-20 overflow-hidden md:ml-16 ${isLearning
                                                    ? ' ' + (expandedStep === index ? 'bg-slate-800/80 ring-1 ring-purple-500' : 'bg-[#0F0F12] border-slate-800')
                                                    : 'bg-[#0F0F12] border-slate-800 opacity-60'
                                                    }`}
                                            >
                                                <div className="p-5">
                                                    <div
                                                        className="flex justify-between items-start cursor-pointer"
                                                        onClick={() => toggleStep(index)}
                                                    >
                                                        <h3 className={`font-bold text-lg mb-2 transition-colors ${isCompleted ? 'text-emerald-400' : expandedStep === index ? 'text-purple-400' : 'text-slate-200'}`}>
                                                            {step.title}
                                                        </h3>
                                                        {isLearning && (
                                                            expandedStep === index ? <ChevronUp className="w-5 h-5 text-purple-400" /> : <ChevronDown className="w-5 h-5 text-slate-600" />
                                                        )}
                                                    </div>

                                                    <p className="text-sm text-slate-400 mb-4 leading-relaxed">{step.description}</p>

                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {step.tools.map((t: string) => (
                                                            <span key={t} className="text-xs font-medium bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-slate-300">{t}</span>
                                                        ))}
                                                    </div>

                                                    <div className="flex items-start justify-between gap-4 mt-4 pt-4 border-t border-slate-800/50">
                                                        {/* Project Badge */}
                                                        <div className="flex-1 min-w-0 flex items-start gap-2">
                                                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-0.5 shrink-0">Project:</span>
                                                            <span className="text-xs text-slate-300 leading-relaxed">{step.project}</span>
                                                        </div>

                                                        {/* MARK COMPLETE BUTTON */}
                                                        <div className="shrink-0 flex flex-col items-end gap-2">
                                                            {isLearning && isSaved && !isCompleted && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleMarkComplete(index);
                                                                    }}
                                                                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/50 rounded-lg text-xs font-bold text-slate-400 transition-all whitespace-nowrap"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" /> Mark Complete
                                                                </button>
                                                            )}
                                                            {isCompleted && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleUndo(index);
                                                                    }}
                                                                    className="group/undo flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 hover:bg-red-500/10 hover:text-red-400 px-3 py-1 rounded-lg border border-emerald-500/20 hover:border-red-500/30 whitespace-nowrap transition-all"
                                                                >
                                                                    <Check className="w-3 h-3 group-hover/undo:hidden" />
                                                                    <span className="group-hover/undo:hidden">Completed</span>
                                                                    <span className="hidden group-hover/undo:inline-block">Undo</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* INLINE RESOURCE VIEWER */}
                                                {expandedStep === index && (
                                                    <div className="px-5 pb-5 border-t border-slate-700/50 bg-[#0F0F12]/50 animate-in zoom-in-95 duration-300">
                                                        <ResourceViewer query={`${step.title} ${topic}`} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}