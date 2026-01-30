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
        <div className="absolute -top-[10%] left-[20%] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse"></div>
        <div className="absolute top-[10%] right-[20%] w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[600px] h-[600px] bg-emerald-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>

      <main className="relative z-10 pt-20 pb-32 px-6">

        {/* HERO SECTION */}
        <div className="max-w-7xl mx-auto text-center relative mb-32">



          {/* Headline */}
          <h1 className="text-5xl md:text-7xl mt-20 font-bold tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700">
            Master Your Learning Journey <br />
            with  <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              EduZard
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-purple-500/50" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            EduZard aggregates the best free documentation, videos, and roadmaps from around the web into one distraction-free, intelligent dashboard. Stop searching, start learning.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
            {session ? (
              <Link href="/learn" className="group relative px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-slate-200 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                Start Learning
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="group relative px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-slate-200 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
              >
                Start Learning
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}


          </div>
        </div>


        {/* === FEATURE SHOWCASE (ZIG-ZAG LAYOUT) === */}
        <section className="relative max-w-7xl mx-auto space-y-32 mb-32">

          {/* ROW 1: Image Left | Text Right */}
          <div className="flex flex-col md:flex-row items-center gap-12 group">
            {/* IMAGE SIDE */}
            <div className="flex-1 relative w-full perspective-[1000px]">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-2xl group-hover:shadow-blue-500/10 transition-all duration-500 transform group-hover:rotate-y-2">
                {/* Placeholder for Real Photo */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                  <img src="/Learn Page.png" alt="Dashboard Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                </div>

              </div>
              {/* Glow Behind */}
              <div className="absolute -inset-4 bg-b  lue-500/20 blur-2xl -z-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            </div>

            {/* TEXT SIDE */}
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Learn Best Content  <br /> around the World.
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Access the internet's best  resources without the noise. We aggregate top-tier yt videos and official documentation so you can focus on mastering complex topics.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
                  <div>
                    <strong className="block text-white">Curated Playlists</strong>
                    <span className="text-sm text-slate-500"> Best docs and videos crash courses from top sources.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
                  <div>
                    <strong className="block text-white">Unified Search</strong>
                    <span className="text-sm text-slate-500">
                      Find docs and videos instantly in one intelligent interface.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
                  <div>
                    <strong className="block text-white">Zero Noise</strong>
                    <span className="text-sm text-slate-500">No algorithms, no ads, no comments—just pure learning..</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* ROW 2: Text Left | Image Right */}
          <div className="flex flex-col-reverse md:flex-row items-center gap-12 group">
            {/* TEXT SIDE */}
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Don't Guess. <br /> Know What's Next..
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Stop learning outdated tech. Our real-time market tracker analyzes thousands of developer activities to identify high-growth skills before they go mainstream..
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
                  <div>
                    <strong className="block text-white">Live Market Data</strong>
                    <span className="text-sm text-slate-500">
                      See exactly what students and pros are learning right now.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
                  <div>
                    <strong className="block text-white">Growth Spikes</strong>
                    <span className="text-sm text-slate-500">
                      Identify rising stars instantly.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
                  <div>
                    <strong className="block text-white">Smart Filtering</strong>
                    <span className="text-sm text-slate-500">
                      Sort by category, demand, or learning time.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* IMAGE SIDE */}
            <div className="flex-1 relative w-full perspective-[1000px]">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-2xl group-hover:shadow-purple-500/10 transition-all duration-500 transform group-hover:-rotate-y-2">
                {/* Placeholder for Real Photo */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                      <span className="text-purple-400 text-2xl font-bold">2</span>
                    </div>
                    <p className="text-slate-500 font-mono text-sm">Roadmap Screenshot</p>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                      <img src="/trendingskills.png" alt="Dashboard Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
                {/* Optional Badge */}

              </div>
              {/* Glow Behind */}
              <div className="absolute -inset-4 bg-purple-500/20 blur-2xl -z-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>

          {/* 3 */}
          <div className="flex flex-col md:flex-row items-center gap-12 group">
            {/* IMAGE SIDE */}
            <div className="flex-1 relative w-full perspective-[1000px]">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-2xl group-hover:shadow-blue-500/10 transition-all duration-500 transform group-hover:rotate-y-2">
                {/* Placeholder for Real Photo */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                  <img src="/Jobs.png" alt="Dashboard Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                </div>

              </div>
              {/* Glow Behind */}
              <div className="absolute -inset-4 bg-b  lue-500/20 blur-2xl -z-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            </div>

            {/* TEXT SIDE */}
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Align With Industry Demand.
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Build the skills employers are actually looking for. We visualize the gap between distinct role categories so you can position yourself perfectly for the next hiring cycle.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
                  <div>
                    <strong className="block text-white">Role Breakdown</strong>
                    <span className="text-sm text-slate-500"> Clear visualization of Job roles.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
                  <div>
                    <strong className="block text-white">Monthly Updates</strong>
                    <span className="text-sm text-slate-500">
                      Fresh data every 30 days to keep your career strategy current.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
                  <div>
                    <strong className="block text-white">Data-Backed Decisions</strong>
                    <span className="text-sm text-slate-500">Choose your next career move based on facts, not hype.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/*4 */}
          <div className="flex flex-col-reverse md:flex-row items-center gap-12 group">
            {/* TEXT SIDE */}
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Your Career ROI
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Not all skills are created equal. We visualize the relationship between "Learning Difficulty" and "Market Value" so you can find the sweet spot—high-paying skills that are easier to master.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
                  <div>
                    <strong className="block text-white">Effort vs. Reward</strong>
                    <span className="text-sm text-slate-500">
                      A Scatter Plot showing exactly which tech yields the highest return.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
                  <div>
                    <strong className="block text-white">Hidden Gems:</strong>
                    <span className="text-sm text-slate-500">
                      Spot low-effort, high-demand skills (the "Quick Wins").</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
                  <div>
                    <strong className="block text-white">Avoid Traps</strong>
                    <span className="text-sm text-slate-500">
                      Identify technologies that are incredibly hard to learn but interest is fading.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* IMAGE SIDE */}
            <div className="flex-1 relative w-full perspective-[1000px]">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-2xl group-hover:shadow-purple-500/10 transition-all duration-500 transform group-hover:-rotate-y-2">
                {/* Placeholder for Real Photo */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                      <span className="text-purple-400 text-2xl font-bold">2</span>
                    </div>
                    <p className="text-slate-500 font-mono text-sm">Roadmap Screenshot</p>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                      <img src="/ROI.png" alt="Dashboard Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
                {/* Optional Badge */}

              </div>
              {/* Glow Behind */}
              <div className="absolute -inset-4 bg-purple-500/20 blur-2xl -z-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>

          {/* 5 */}
          <div className="flex flex-col md:flex-row items-center gap-12 group">
            {/* IMAGE SIDE */}
            <div className="flex-1 relative w-full perspective-[1000px]">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-2xl group-hover:shadow-blue-500/10 transition-all duration-500 transform group-hover:rotate-y-2">
                {/* Placeholder for Real Photo */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                  <img src="/roadmap.png" alt="Dashboard Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                </div>

              </div>
              {/* Glow Behind */}
              <div className="absolute -inset-4 bg-b  lue-500/20 blur-2xl -z-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            </div>

            {/* TEXT SIDE */}
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Your Personal Roadmap.
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                No more random tutorials. Get a clear, simple path that takes you from beginner to pro without the confusion.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
                  <div>
                    <strong className="block text-white">Stay Focused</strong>
                    <span className="text-sm text-slate-500"> One step at a time. No distractions.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
                  <div>
                    <strong className="block text-white">Track Growth</strong>
                    <span className="text-sm text-slate-500">
                      See exactly how far you've come.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
                  <div>
                    <strong className="block text-white">Clear Steps</strong>
                    <span className="text-sm text-slate-500">Know exactly what to learn next.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

        </section>


        {/* === BIG VIDEO SECTION === */}
        <section className="relative px-6">
          <div className="max-w-6xl mx-auto rounded-3xl bg-slate-900/20 border border-slate-800 p-4 md:p-12 relative overflow-hidden text-center group">

            {/* Section Header */}
            <div className="relative z-10 mb-12">

              <h2 className="text-4xl font-bold text-white mb-4">See Functionality in Action</h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                Watch how EduSite transforms your learning workflow entirely. From generating a roadmap to tracking your first streak.
              </p>
            </div>

            {/* Video Container */}
            <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden border border-slate-800 shadow-2xl group-hover:shadow-red-900/20 transition-shadow duration-500">
              {/* Placeholder Video Background */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-80"></div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <button className="group/play w-24 h-24 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center transition-all hover:scale-110 border border-white/10">
                  <PlayCircle className="w-12 h-12 text-white fill-white/10 group-hover/play:fill-white transition-colors duration-300" />
                </button>
              </div>

              <div className="absolute bottom-8 left-0 right-0 text-center z-10">
                <p className="text-sm text-slate-500 font-mono bg-slate-950/80 inline-block px-4 py-2 rounded-lg border border-slate-800">
                  &lt;video src="/demo.mp4" controls /&gt;
                </p>
              </div>
            </div>

            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>
          </div>
        </section>

      </main>



    </div>
  );
}