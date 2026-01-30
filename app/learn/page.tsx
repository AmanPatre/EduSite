"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
// Adjust the import path for SearchBar depending on where it moved or if it's in components
// Assuming SearchBar is in ../components/SearchBar based on previous file structure
import SearchBar from "../components/SearchBar";
import { Book, PlayCircle, ListVideo, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function LearnPage() {
    const { data: session } = useSession();
    const [searchResults, setSearchResults] = useState<any>(null);
    const [recommendations, setRecommendations] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Redirect if not logged in (optional, but good for "Learn" page)
    useEffect(() => {
        if (session === null) {
            // redirect("/"); // Uncomment if strict protection is needed
        }
    }, [session]);

    // 1. Fetch Recommendations (Only if logged in and no search results yet)
    useEffect(() => {
        const fetchRecs = async () => {
            // Fetch if session exists, OR maybe just generic recs if we want public access
            if (session && !searchResults) {
                try {
                    const res = await axios.get("/api/recommendations");
                    setRecommendations(res.data);
                } catch (err) {
                    console.error("Failed to fetch recommendations:", err);
                }
            }
        };
        fetchRecs();
    }, [session, searchResults]);

    // 2. Handle Search
    const handleSearch = async (query: string) => {
        setLoading(true);
        setSearchResults(null);
        try {
            const [vidRes, docRes] = await Promise.all([
                axios.post("/api/search", { query }),
                axios.post("/api/docs", { query })
            ]);

            setSearchResults({
                videos: vidRes.data.videos || [],
                playlists: vidRes.data.playlists || [],
                docs: docRes.data.data || []
            });
        } catch (e) {
            console.error(e);
            alert("Search failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold text-white">Access Restricted</h1>
                    <p className="text-slate-400">Please sign in to access the Learning Dashboard.</p>
                    <Link href="/" className="inline-block px-6 py-2 bg-purple-600 rounded-full text-white font-bold hover:bg-purple-500 transition">Go Home</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-transparent text-slate-100">
            <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
                <div className="text-center mb-16 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                    <h1 className="relative text-4xl md:text-5xl font-extrabold text-white mb-4 pb-2 tracking-tight">
                        Search Less. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Learn More.</span>
                    </h1>
                    <p className="relative text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                        Access a centralized engine for developer documentation, video courses, and interactive guides. Designed to get you to your "Aha!" moment faster.
                    </p>
                    <SearchBar onSearch={handleSearch} loading={loading} />
                </div>

                {/* === RECOMMENDATIONS SECTION (Only if NO search results yet) === */}
                {!searchResults && recommendations && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">

                        {/* Recommended Videos */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                    <Sparkles className="text-yellow-400 w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-100">Recommended for you</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {recommendations.videos?.map((vid: any, i: number) => (
                                    <a key={i} href={vid.url} target="_blank" className="group block bg-[#0F0F12] rounded-xl border border-slate-800 overflow-hidden hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
                                        <div className="relative h-40 bg-slate-800">
                                            <img src={vid.thumbnail} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60"></div>
                                            <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white border border-white/10 text-[10px] font-bold px-2 py-0.5 rounded">
                                                {vid.duration}
                                            </span>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100">
                                                <PlayCircle className="w-8 h-8 text-white fill-white/20" />
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-sm text-slate-200 line-clamp-2 group-hover:text-purple-400 transition-colors leading-snug mb-2">{vid.title}</h3>
                                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                                {vid.channel}
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Recommended Docs */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                    <Book className="text-purple-400 w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-100">Suggested Readings</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recommendations.docs?.map((doc: any, i: number) => (
                                    <a key={i} href={doc.url} target="_blank" className="flex flex-col p-5 bg-[#0F0F12] rounded-xl border border-slate-800 hover:border-purple-500/30 transition-all hover:bg-slate-800/50 group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md">{doc.source || "Documentation"}</span>
                                            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100" />
                                        </div>
                                        <h4 className="font-bold text-slate-200 text-base mb-2 group-hover:text-purple-300 transition-colors">{doc.title}</h4>
                                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed group-hover:text-slate-300 transition-colors">{doc.snippet}</p>
                                    </a>
                                ))}
                            </div>
                        </div>

                    </div>
                )}

                {/* === SEARCH RESULTS SECTION === */}
                {searchResults && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">

                        {/* LEFT COLUMN: Docs */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                                <Book className="w-5 h-5 text-purple-400" />
                                <h3 className="font-bold text-lg text-slate-100">Documentation</h3>
                            </div>

                            <div className="space-y-4">
                                {searchResults.docs.length > 0 ? (
                                    searchResults.docs.map((doc: any, i: number) => (
                                        <a key={i} href={doc.url} target="_blank" className="block p-5 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-purple-500/40 hover:bg-slate-800/50 transition-all group">
                                            <span className="text-[10px] font-bold text-purple-400 uppercase bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md">{doc.source || "Web"}</span>
                                            <h4 className="font-bold text-slate-200 mt-2 group-hover:text-purple-300 transition-colors">{doc.title}</h4>
                                            <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{doc.snippet}</p>
                                        </a>
                                    ))
                                ) : (
                                    <div className="text-center p-8 bg-slate-900/30 border border-slate-800 rounded-xl text-slate-500 text-sm">No documentation found.</div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Videos & Playlists */}
                        <div className="lg:col-span-2 space-y-10">

                            {/* Videos */}
                            <div>
                                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-800">
                                    <PlayCircle className="w-5 h-5 text-red-400" />
                                    <h3 className="font-bold text-lg text-slate-100">Videos</h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {searchResults.videos.map((vid: any, i: number) => (
                                        <a key={i} href={vid.url} target="_blank" className="group bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden hover:shadow-xl hover:border-red-500/30 transition-all duration-300">
                                            <div className="relative h-44 bg-slate-800">
                                                <img src={vid.thumbnail} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="" />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                                <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded border border-white/10">{vid.duration || vid.estimatedDuration}</span>
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100 shadow-lg">
                                                    <PlayCircle className="w-6 h-6 text-white fill-white" />
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-bold text-slate-200 group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">{vid.title}</h4>
                                                <p className="text-xs text-slate-500 mt-2 font-medium">{vid.channel}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Playlists */}
                            {searchResults.playlists && searchResults.playlists.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-800">
                                        <ListVideo className="w-5 h-5 text-purple-400" />
                                        <h3 className="font-bold text-lg text-slate-100">Full Courses & Playlists</h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {searchResults.playlists.map((pl: any, i: number) => (
                                            <a key={`pl-${i}`} href={pl.url} target="_blank" className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-purple-500/40 hover:bg-slate-800/80 transition-all group">
                                                <div className="relative w-28 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
                                                    <img src={pl.thumbnail} className="w-full h-full object-cover" alt="" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                                                        <ListVideo className="text-white w-8 h-8 drop-shadow-lg opacity-90 group-hover:scale-110 transition-transform" />
                                                    </div>
                                                    <div className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-bold text-white px-1.5 py-0.5 rounded">
                                                        {pl.totalVideos} videos
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-sm text-slate-200 line-clamp-2 group-hover:text-purple-400 transition-colors leading-snug">{pl.title}</h4>
                                                    <p className="text-xs text-slate-500 mt-1">{pl.channel}</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
