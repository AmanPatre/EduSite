"use client";
import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import SearchBar from "./components/SearchBar";
import { Book, PlayCircle, Layers, ListVideo, Sparkles } from "lucide-react"; // Added Sparkles icon for recommendations

export default function Home() {
  const { data: session } = useSession();
  const [searchResults, setSearchResults] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Recommendations (Only if logged in and no search results yet)
  useEffect(() => {
    const fetchRecs = async () => {
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

  // --- VIEW: GUEST (Landing Page) ---
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 px-4 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6">
          Stop Searching. <span className="text-blue-600">Start Learning.</span>
        </h1>
        <p className="max-w-2xl text-lg text-gray-600 mb-10">
          EduSite aggregates the best free documentation, videos, and roadmaps from around the web into one distraction-free dashboard.
        </p>
        <button
          onClick={() => signIn("google")}
          className="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-700 hover:scale-105"
        >
          Get Started for Free
        </button>
        
        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-5xl">
           <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto"><Book className="w-6 h-6"/></div>
              <h3 className="font-bold text-lg">Curated Docs</h3>
              <p className="text-gray-500 text-sm mt-2">Only the best official documentation and tutorials.</p>
           </div>
           <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-4 mx-auto"><PlayCircle className="w-6 h-6"/></div>
              <h3 className="font-bold text-lg">Smart Video Search</h3>
              <p className="text-gray-500 text-sm mt-2">AI-ranked videos based on quality, not just views.</p>
           </div>
           <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4 mx-auto"><Layers className="w-6 h-6"/></div>
              <h3 className="font-bold text-lg">Distraction Free</h3>
              <p className="text-gray-500 text-sm mt-2">No algorithms, no shorts, just pure learning materials.</p>
           </div>
        </div>
      </div>
    );
  }

  // --- VIEW: LOGGED IN (Dashboard) ---
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {session.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-gray-500 mb-8">What topic are we mastering today?</p>
        <SearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {/* === RECOMMENDATIONS SECTION (Only if NO search results yet) === */}
      {!searchResults && recommendations && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-yellow-500 w-5 h-5" />
            <h2 className="text-xl font-bold text-gray-800">Recommended for you</h2>
            
          </div>

          <div className="space-y-8">
            {/* 1. Recommended Videos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {recommendations.videos?.map((vid:any, i:number) => (
                <a key={i} href={vid.url} target="_blank" className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition">
                   <div className="relative h-32 bg-gray-200">
                      <img src={vid.thumbnail} className="w-full h-full object-cover" alt=""/>
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                        {vid.duration}
                      </span>
                   </div>
                   <div className="p-3">
                      <h3 className="font-bold text-sm line-clamp-2 group-hover:text-blue-600 leading-snug">{vid.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{vid.channel}</p>
                   </div>
                </a>
              ))}
            </div>

            {/* 2. Recommended Docs Grid (Added This Section) */}
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Suggested Readings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.docs?.map((doc:any, i:number) => (
                  <a key={i} href={doc.url} target="_blank" className="flex flex-col p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-400 transition hover:shadow-sm">
                     <span className="text-xs font-bold text-blue-600 uppercase mb-1">{doc.source || "Documentation"}</span>
                     <h4 className="font-semibold text-gray-900 text-sm mb-1">{doc.title}</h4>
                     <p className="text-xs text-gray-500 line-clamp-2">{doc.snippet}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === SEARCH RESULTS SECTION === */}
      {searchResults && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            
            {/* LEFT COLUMN: Docs */}
            <div className="lg:col-span-1 space-y-4">
               <h3 className="font-bold text-lg flex items-center gap-2 text-gray-800"><Book className="w-5 h-5"/> Documentation</h3>
               {searchResults.docs.length > 0 ? (
                  searchResults.docs.map((doc:any, i:number)=>(
                    <a key={i} href={doc.url} target="_blank" className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-500 transition shadow-sm group">
                        <span className="text-xs font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full">{doc.source || "Web"}</span>
                        <h4 className="font-semibold text-gray-900 mt-2 group-hover:text-blue-700">{doc.title}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{doc.snippet}</p>
                    </a>
                  ))
               ) : (
                  <div className="text-center p-8 bg-gray-100 rounded-xl text-gray-500 text-sm">No documentation found.</div>
               )}
            </div>

            {/* RIGHT COLUMN: Videos & Playlists */}
            <div className="lg:col-span-2 space-y-8">
               
               {/* Videos */}
               <div>
                 <h3 className="font-bold text-lg flex items-center gap-2 mb-4 text-gray-800"><PlayCircle className="w-5 h-5"/> Videos</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {searchResults.videos.map((vid:any, i:number)=>(
                      <a key={i} href={vid.url} target="_blank" className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition">
                         <div className="relative h-44 bg-gray-100">
                            <img src={vid.thumbnail} className="w-full h-full object-cover" alt=""/>
                            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{vid.duration || vid.estimatedDuration}</span>
                         </div>
                         <div className="p-4">
                            <h4 className="font-bold text-gray-900 group-hover:text-blue-600 line-clamp-2">{vid.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">{vid.channel}</p>
                         </div>
                      </a>
                    ))}
                 </div>
               </div>

               {/* Playlists */}
               {searchResults.playlists && searchResults.playlists.length > 0 && (
                 <div>
                   <h3 className="font-bold text-lg flex items-center gap-2 mb-4 text-gray-800"><ListVideo className="w-5 h-5"/> Full Courses & Playlists</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {searchResults.playlists.map((pl:any, i:number)=>(
                        <a key={`pl-${i}`} href={pl.url} target="_blank" className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition">
                           <div className="relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                              <img src={pl.thumbnail} className="w-full h-full object-cover" alt=""/>
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                 <ListVideo className="text-white w-6 h-6 drop-shadow-md"/>
                              </div>
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-blue-600">{pl.title}</h4>
                              <p className="text-xs text-gray-500 mt-0.5">{pl.channel}</p>
                              <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {pl.totalVideos} Videos
                              </span>
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
  );
}