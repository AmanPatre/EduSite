"use client";

import React, { useState } from 'react';
import { Info, BarChart2, Github, Youtube, ChevronDown, ChevronUp } from 'lucide-react';

export default function TransparencyNote() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-[#0F0F12] border border-slate-800/60 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Header / Toggle */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="px-5 py-4 flex items-center justify-between cursor-pointer group hover:bg-slate-900/40 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 group-hover:text-purple-300">
                        <Info className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-200 text-sm">How is this calculated?</h4>
                        <p className="text-xs text-slate-500">Transparency is our priority. See logic.</p>
                    </div>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
            </div>

            {/* Expanded Content */}
            {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-800/50 bg-slate-900/20">
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">
                        The <strong>Trend Score (0-100)</strong> represents real-time market momentum. It is
                        NOT just opinion—it is calculated daily from live data using a weighted algorithm:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* GitHub Card */}
                        <div className="bg-[#05050A] border border-slate-800 rounded-lg p-4 relative group">
                            <div className="flex items-center gap-2 mb-2">
                                <Github className="w-4 h-4 text-slate-200" />
                                <span className="text-sm font-bold text-slate-200">GitHub Activity (40%)</span>
                            </div>
                            <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                                <li>New Repositories Created (High Impact)</li>
                                <li>Star Velocity (Interest)</li>
                                <li>Fork Count (Usage)</li>
                            </ul>
                        </div>

                        {/* YouTube Card */}
                        <div className="bg-[#05050A] border border-slate-800 rounded-lg p-4 relative group">
                            <div className="flex items-center gap-2 mb-2">
                                <Youtube className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-bold text-slate-200">YouTube Interest (60%)</span>
                            </div>
                            <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                                <li>New Tutorials Published (High Impact)</li>
                                <li>Total Views (Volume)</li>
                                <li>Engagement Rate (Quality)</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-600 border px-3 py-2 rounded border-yellow-500/10 bg-yellow-500/5">
                        <BarChart2 className="w-3 h-3 text-yellow-500/50" />
                        <span>Scores are normalized against the top performer in each category (e.g., React vs Vue, not React vs Python).</span>
                    </div>
                </div>
            )}
        </div>
    );
}
