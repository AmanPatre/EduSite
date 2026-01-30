"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { PlayCircle, Book, ExternalLink, Loader2 } from "lucide-react";

interface ResourceViewerProps {
    query: string;
}

export default function ResourceViewer({ query }: ResourceViewerProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Run both searches in parallel
                const [videoRes, docRes] = await Promise.all([
                    axios.post("/api/search", { query }), // YouTube
                    axios.post("/api/docs", { query })    // Documentation
                ]);

                setData({
                    videos: videoRes.data.videos?.slice(0, 3) || [], // Top 3 only
                    docs: docRes.data.data?.slice(0, 3) || []        // Top 3 only
                });
            } catch (e) {
                console.error("Failed to load resources", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [query]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-blue-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span className="text-sm font-medium">AI is curating the best resources...</span>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 animate-in fade-in zoom-in-95 duration-300">

            {/* 1. Best Videos Column */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" /> Top Tutorials
                </h4>
                {data.videos.map((vid: any, i: number) => (
                    <a key={i} href={vid.url} target="_blank" className="flex gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-red-500/50 hover:bg-slate-800 transition-all group">
                        <div className="relative w-24 h-16 flex-shrink-0 bg-slate-950 rounded-lg overflow-hidden">
                            <img src={vid.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-bold text-slate-200 line-clamp-1 group-hover:text-red-400 transition-colors">{vid.title}</h5>
                            <p className="text-xs text-slate-500 mt-1">{vid.channel}</p>
                        </div>
                    </a>
                ))}
            </div>

            {/* 2. Best Docs Column */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                    <Book className="w-4 h-4" /> Recommended Reading
                </h4>
                {data.docs.map((doc: any, i: number) => (
                    <a key={i} href={doc.url} target="_blank" className="block p-3 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 transition-all group">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">{doc.source}</span>
                            <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-blue-400" />
                        </div>
                        <h5 className="text-sm font-bold text-slate-200 line-clamp-1 group-hover:text-blue-300 transition-colors">{doc.title}</h5>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{doc.snippet}</p>
                    </a>
                ))}
            </div>

        </div>
    );
}