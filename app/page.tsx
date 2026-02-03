"use client";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, PlayCircle, Zap, Shield, Globe } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen text-white overflow-hidden relative selection:bg-purple-500/30">

      {/* BACKGROUND BLOBS (Landing Page Only) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] left-[20%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-600/20 blur-[80px] md:blur-[120px] rounded-full mix-blend-screen animate-pulse"></div>
        <div className="absolute top-[10%] right-[20%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-blue-600/10 blur-[80px] md:blur-[100px] rounded-full mix-blend-screen"></div>
      </div>

      <main className="relative z-10 pt-24 md:pt-32 pb-16 md:pb-32 px-4 md:px-6">

        {/* HERO SECTION */}
        <div className="max-w-7xl mx-auto text-center relative mb-20 md:mb-32">
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl mt-12 md:mt-20 font-bold tracking-tight mb-6 md:mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700">
            Master Your Learning Journey <br className="hidden md:block" />
            with <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              Synapse
              <svg className="absolute -bottom-2 md:-bottom-3 left-0 w-full h-2 md:h-3 text-purple-500/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed px-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Synapse aggregates the best free documentation, videos, and roadmaps from around the web into one distraction-free, intelligent dashboard. Stop searching, start learning.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200 w-full sm:w-auto px-4">
            {session ? (
              <Link href="/learn" className="w-full sm:w-auto group relative px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                Start Learning
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="w-full sm:w-auto group relative px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
              >
                Start Learning
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>


        {/* === FEATURE SHOWCASE (ZIG-ZAG LAYOUT) === */}
        <section className="relative max-w-7xl mx-auto space-y-20 md:space-y-32 mb-20 md:mb-32">

          {/* ROW 1: Image Left | Text Right */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 group">
            <div className="flex-1 relative w-full perspective-[1000px] order-1 md:order-1">
              {/* Glow Effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-purple-600/20 blur-[80px] rounded-full z-0 pointer-events-none"></div>

              <div className="relative z-10 aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-2xl transition-all duration-500 transform md:group-hover:rotate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                  <img src="/learn2.png" alt="Dashboard Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-6 order-2 md:order-2 px-2">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 leading-tight">
                Learn Best Content <br /> around the World.
              </h2>
              <p className="text-base md:text-lg text-slate-400 leading-relaxed">
                Access the internet's best resources without the noise. We aggregate top-tier yt videos and official documentation so you can focus on mastering complex topics.
              </p>
              <ul className="space-y-4">
                {[
                  { title: "Curated Playlists", desc: "Best docs and videos crash courses from top sources." },
                  { title: "Unified Search", desc: "Find docs and videos instantly in one intelligent interface." },
                  { title: "Zero Noise", desc: "No algorithms, no ads, no comments—just pure learning." }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" /></div>
                    <div>
                      <strong className="block text-white">{item.title}</strong>
                      <span className="text-sm text-slate-500">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ROW 2: Text Left | Image Right (Reverse on Mobile) */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 group">
            <div className="flex-1 space-y-6 order-2 md:order-1 px-2">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 leading-tight">
                Don't Guess. <br /> Know What's Next.
              </h2>
              <p className="text-base md:text-lg text-slate-400 leading-relaxed">
                Stop learning outdated tech. Our real-time market tracker analyzes thousands of developer activities to identify high-growth skills before they go mainstream.
              </p>
              <ul className="space-y-3">
                {[
                  { title: "Live Market Data", desc: "See exactly what students and pros are learning right now." },
                  { title: "Growth Spikes", desc: "Identify rising stars instantly." },
                  { title: "Smart Filtering", desc: "Sort by category, demand, or learning time." }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" /></div>
                    <div>
                      <strong className="block text-white">{item.title}</strong>
                      <span className="text-sm text-slate-500">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 relative w-full perspective-[1000px] order-1 md:order-2">
              {/* Glow Effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-purple-600/20 blur-[80px] rounded-full z-0 pointer-events-none"></div>

              <div className="relative z-10 aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-2xl transition-all duration-500 transform md:group-hover:-rotate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                  <div className="text-center w-full h-full relative">
                    <img src="/trendingskills2.png" alt="Dashboard Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 3: Mapping Section */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 group">
            <div className="flex-1 relative w-full perspective-[1000px] order-1 md:order-1">
              {/* Glow Effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-purple-600/20 blur-[80px] rounded-full z-0 pointer-events-none"></div>

              <div className="relative z-10 aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-2xl transition-all duration-500 transform md:group-hover:rotate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                  <img src="/mapping.png" alt="Dashboard Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-6 order-2 md:order-2 px-2">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 leading-tight">
                Connect Skills to <br /> Real Careers.
              </h2>
              <p className="text-base md:text-lg text-slate-400 leading-relaxed">
                Wondering where "React" can take you? Or what you need to become a "DevOps Engineer"? Our AI maps the relationships between skills and job roles instantly.
              </p>
              {/* Simplified List for Code Brevity */}
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
                  <div><strong className="block text-white">Bidirectional Mapping</strong><span className="text-sm text-slate-500">Find roles for your skills, or skills for a role.</span></div>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
                  <div><strong className="block text-white">Strategic Insight</strong><span className="text-sm text-slate-500">Understand why specific skills are critical for the job.</span></div>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
                  <div><strong className="block text-white">Gap Analysis</strong><span className="text-sm text-slate-500">Identify exactly what you're missing for your dream job.</span></div>
                </li>
              </ul>
            </div>
          </div>

          {/* ROW 4: Roadmap Section */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 group">
            <div className="flex-1 space-y-6 order-2 md:order-1 px-2">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 leading-tight">
                Your Personal GPS <br /> for Tech Skills.
              </h2>
              <p className="text-base md:text-lg text-slate-400 leading-relaxed">
                Stop getting lost in tutorials. Our AI generates a step-by-step curriculum tailored to your goals, complete with projects and progress tracking.
              </p>
              <ul className="space-y-3">
                {[
                  { title: "AI Curriculum", desc: "Personalized learning paths generated instantly." },
                  { title: "Progress Tracking", desc: "Mark steps complete and track your streak." },
                  { title: "Project Integration", desc: "Build real-world projects at every milestone." }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" /></div>
                    <div>
                      <strong className="block text-white">{item.title}</strong>
                      <span className="text-sm text-slate-500">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 relative w-full perspective-[1000px] order-1 md:order-2">
              {/* Glow Effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-purple-600/20 blur-[80px] rounded-full z-0 pointer-events-none"></div>

              <div className="relative z-10 aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-2xl transition-all duration-500 transform md:group-hover:-rotate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                  <div className="text-center w-full h-full relative">
                    <img src="/roadmap2.png" alt="Dashboard Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 5: Effort vs Reward */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 group">
            <div className="flex-1 relative w-full perspective-[1000px] order-1 md:order-1">
              {/* Glow Effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-purple-600/20 blur-[80px] rounded-full z-0 pointer-events-none"></div>

              <div className="relative z-10 aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-2xl transition-all duration-500 transform md:group-hover:rotate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                  <img src="/effort.png" alt="Dashboard Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-6 order-2 md:order-1 px-2">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 leading-tight">
                Maximize Your <br /> Learning ROI.
              </h2>
              <p className="text-base md:text-lg text-slate-400 leading-relaxed">
                Not all skills are created equal. Use our interactive scatter plot to find the sweet spot between low learning effort and high market demand.
              </p>
              <ul className="space-y-3">
                {[
                  { title: "Smart Trends", desc: "Visualize the effort vs reward ratio for top tech skills." },
                  { title: "AI Reasoning", desc: "Click any bubble to understand why a skill is positioned there." },
                  { title: "Quick Wins", desc: "Identify low-hanging fruit to boost your career fast." }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" /></div>
                    <div>
                      <strong className="block text-white">{item.title}</strong>
                      <span className="text-sm text-slate-500">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>


        </section>

        {/* === BIG VIDEO SECTION === */}
        <section className="relative px-0 md:px-6">
          <div className="max-w-6xl mx-auto rounded-3xl bg-slate-900/20 border border-slate-800 p-6 md:p-12 relative overflow-hidden text-center group">
            <div className="relative z-10 mb-8 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">See Functionality in Action</h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-lg">
                Watch how EduSite transforms your learning workflow entirely. From generating a roadmap to tracking your first streak.
              </p>
            </div>
            <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden border border-slate-800 shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-80"></div>
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <button className="group/play w-16 h-16 md:w-24 md:h-24 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center transition-all hover:scale-110 border border-white/10">
                  <PlayCircle className="w-8 h-8 md:w-12 md:h-12 text-white fill-white/10 group-hover/play:fill-white transition-colors duration-300" />
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}