"use client";

// ============================================
// TRENDING DASHBOARD - MAIN PAGE
// ============================================
// Interactive dashboard with 5 comprehensive sections:
// 1. Trending Skills - What students are learning
// 2. Industry Demand - Job market analysis with drill-down
// 3. Skill ↔ Role Mapping - Career path guidance
// 4. Effort vs Reward - Decision-making tool
// 5. Market Insights - AI-powered analysis


import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import axios from 'axios'; // Import Axios

import TrendingSkillsSection from '@/app/components/trending/TrendingSkillsSection';
import IndustryDemandSection from '@/app/components/trending/IndustryDemandSection';
import SkillRoleMappingSection from '@/app/components/trending/SkillRoleMappingSection';
import EffortRewardSection from '@/app/components/trending/EffortRewardSection';
import MarketInsightsSection from '@/app/components/trending/MarketInsightsSection';

// Import data
import {
  trendingSkills as mockSkills, // Renamed to avoid confusion
  industryRoles,
  skillRoleMappings,
  roleSkillMappings,
  effortRewardData,
  marketInsights
} from '@/data/trendingData';

export default function TrendingPage() {
  // 1. State for Real Data
  const [realSkills, setRealSkills] = useState([]);
  const [realJobs, setRealJobs] = useState([]);
  const [realInsights, setRealInsights] = useState([]); // New State
  const [loading, setLoading] = useState(true);

  // 2. Fetch data with Axios
  useEffect(() => {
    async function loadData() {
      try {
        // Parallel Fetch for Speed
        const [skillsRes, jobsRes, insightsRes] = await Promise.all([
          axios.get('/api/trending-proxy'),
          axios.get('/api/jobs-proxy'),
          axios.post('/api/market-analytics') // Independent Gemini Call
        ]);

        setRealSkills(skillsRes.data);
        setRealJobs(jobsRes.data);
        setRealInsights(insightsRes.data);

      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Use real data if available, otherwise fallback to mock
  const displaySkills = realSkills.length > 0 ? realSkills : loading ? [] : mockSkills;
  const displayJobs = realJobs.length > 0 ? realJobs : industryRoles;
  const displayInsights = realInsights.length > 0 ? realInsights : marketInsights; // Fallback

  return (
    <div className="min-h-screen bg-[#05050A] text-slate-100 font-sans pb-20 selection:bg-purple-500/30 relative overflow-hidden">

      {/* HEADER */}
      <div className="border-b border-slate-800 bg-[#05050A]/80 backdrop-blur-md z-20 relative pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-start justify-between relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-purple-500/10 blur-[60px] rounded-full pointer-events-none"></div>
            <div className="relative">
              <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 pb-2 flex items-center gap-3">
                <Activity className="w-8 h-8 text-pink-500" />
                Trending Dashboard
              </h1>

            </div>

          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-16">

        {/* SECTION 1: TRENDING SKILLS (REAL DATA) */}
        <TrendingSkillsSection skills={displaySkills} />

        {/* DIVIDER */}
        <div className="border-t border-slate-800" />

        {/* SECTION 2: INDUSTRY DEMAND (REAL JOBS) */}
        <IndustryDemandSection roles={displayJobs} />

        {/* DIVIDER */}
        <div className="border-t border-slate-800" />

        {/* SECTION 3: SKILL ↔ ROLE MAPPING */}
        <SkillRoleMappingSection
          skillMappings={skillRoleMappings}
          roleMappings={roleSkillMappings}
        />

        {/* DIVIDER */}
        <div className="border-t border-slate-800" />

        {/* SECTION 4: EFFORT VS REWARD */}
        <EffortRewardSection data={effortRewardData} />

        {/* DIVIDER */}
        <div className="border-t border-slate-800" />

        {/* SECTION 5: MARKET INSIGHTS */}
        <MarketInsightsSection insights={displayInsights} />

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-slate-500">
            Data updated monthly • Built with Next.js, TypeScript, and Recharts
          </p>
          <p className="text-xs text-slate-600 mt-2">
            Helping students make informed learning decisions 🚀
          </p>
        </div>
      </footer>
    </div>
  );
}