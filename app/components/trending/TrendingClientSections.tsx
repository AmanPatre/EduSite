"use client";

// Client wrapper for all Recharts-based sections.
// ssr:false is only allowed inside Client Components in Next.js App Router.
import dynamic from 'next/dynamic';
import { EffortRewardData } from '@/data/trendingData';

const TrendingSkillsSection = dynamic(
    () => import('./TrendingSkillsSection'),
    { ssr: false, loading: () => <div className="h-64 bg-slate-800/50 animate-pulse rounded-2xl" /> }
);

const IndustryDemandSection = dynamic(
    () => import('./IndustryDemandSection'),
    { ssr: false, loading: () => <div className="h-64 bg-slate-800/50 animate-pulse rounded-2xl" /> }
);

const EffortRewardSection = dynamic(
    () => import('./EffortRewardSection'),
    { ssr: false, loading: () => <div className="h-64 bg-slate-800/50 animate-pulse rounded-2xl" /> }
);

interface Props {
    skills: any[];
    effortData: EffortRewardData[];
}

export default function TrendingClientSections({ skills, effortData }: Props) {
    return (
        <>
            <TrendingSkillsSection skills={skills} />
            <EffortRewardSection data={effortData} />
        </>
    );
}
