

// ============================================
// TRENDING DASHBOARD - MAIN PAGE
// ============================================
// Interactive dashboard with 5 comprehensive sections:
// 1. Trending Skills - What students are learning
// 2. Industry Demand - Job market analysis with drill-down
// 3. Skill ↔ Role Mapping - Career path guidance
// 4. Effort vs Reward - Decision-making tool
// 5. Market Insights - AI-powered analysis


import React from 'react';
import Navbar from "../components/Navbar";
import PageWrapper from "../components/PageWrapper";
import MarketInsightsSection from "../components/trending/MarketInsightsSection";
import SkillRoleMappingSection from "../components/trending/SkillRoleMappingSection";
import TrendingClientSections from "../components/trending/TrendingClientSections";

// Import mock data for other sections
import {
  industryRoles,
  skillRoleMappings,
  roleSkillMappings,
  effortRewardData,
  marketInsights
} from '@/data/trendingData';

// Force dynamic rendering since we are fetching live trend data
export const dynamic = 'force-dynamic';

async function getTrendScores() {
  try {
    // Determine base URL based on environment (server-side only)
    const baseUrl = process.env.NEXTAUTH_URL
      ? process.env.NEXTAUTH_URL
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

    // 2. FETCH JOBS (Parallel)
    const jobsResPromise = fetch(`${baseUrl}/api/jobs-proxy`, {
      next: { revalidate: 3600 }
    });

    // 3. FETCH EFFORT-DEMAND (Parallel)
    const effortResPromise = fetch(`${baseUrl}/api/effort-demand`, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    const [res, jobsRes, effortRes] = await Promise.all([
      fetch(`${baseUrl}/api/trend-scores`, { next: { revalidate: 0 } }),
      jobsResPromise,
      effortResPromise
    ]);

    let realSkills = [];
    if (res.ok) {
      realSkills = await res.json();
    }

    let realJobs = [];
    if (jobsRes.ok) {
      realJobs = await jobsRes.json();
    }

    let realEffortData = effortRewardData;
    if (effortRes.ok) {
      const data = await effortRes.json();
      if (Array.isArray(data) && data.length > 0) {
        realEffortData = data;
      }
    }

    return { skills: realSkills, jobs: realJobs, effortData: realEffortData };
  } catch (error) {
    console.error('Failed to fetch trend scores or jobs:', error);
    return { skills: [], jobs: [], effortData: effortRewardData };
  }
}

export default async function TrendingPage() {
  const { skills: trendSkills, jobs: trendJobs, effortData } = await getTrendScores();

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden selection:bg-purple-500/30">

      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <PageWrapper>
        <main className="container mx-auto px-4 pt-24 sm:pt-32 pb-16 relative z-10 space-y-12 sm:space-y-20">



          {/* 1 & 4. Chart Sections (Client-only via dynamic import) */}
          <TrendingClientSections skills={trendSkills} effortData={effortData} />

          {/* 2. Breakdown & Insights */}
          <SkillRoleMappingSection
            skillMappings={skillRoleMappings}
            roleMappings={roleSkillMappings}
          />
          <MarketInsightsSection insights={marketInsights} />

        </main>
      </PageWrapper>
    </div>
  );
}
