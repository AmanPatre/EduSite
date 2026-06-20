import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import redis from '@/lib/redis';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes — long running job

// ─────────────────────────────────────────────
// SKILL DEFINITIONS
// ─────────────────────────────────────────────
import { skillDetectionRules } from '@/lib/skillDetectionRules';

const skillsToTrack: Record<string, { category: string; github: string; youtube: string }> = Object.fromEntries(
    Object.entries(skillDetectionRules).map(([k, v]) => [
        k,
        { category: v.category, github: v.github.query, youtube: v.youtube }
    ])
);

// ─────────────────────────────────────────────
// GITHUB FETCHER
// ─────────────────────────────────────────────
async function fetchGitHubData(query: string) {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

        const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+created:>=${dateStr}&sort=stars&order=desc&per_page=100`, {
            headers: { 'Authorization': `token ${process.env.GITHUB_TOKEN}` }
        });

        const json = await res.json();
        const items = json.items || [];
        const totalRepoCount = json.total_count || 0;
        const sampleSize = items.length;

        const totalStars = items.reduce((sum: number, i: any) => sum + i.stargazers_count, 0);
        const totalForks = items.reduce((sum: number, i: any) => sum + i.forks_count, 0); // total, not avg — matches seed script
        const avgStars = sampleSize > 0 ? totalStars / sampleSize : 0;

        return { totalRepoCount, avgStars, totalForks, sampleSize };
    } catch (e) {
        console.error(`[GitHub Error]`, e);
        return { totalRepoCount: 0, avgStars: 0, totalForks: 0, sampleSize: 0 };
    }
}

// ─────────────────────────────────────────────
// YOUTUBE FETCHER
// ─────────────────────────────────────────────
async function fetchYouTubeData(query: string) {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const searchRes = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&publishedAfter=${thirtyDaysAgo.toISOString()}&maxResults=50&order=relevance&key=${process.env.YOUTUBE_API_KEY}`
        );
        const searchJson = await searchRes.json();
        const videos = searchJson.items || [];
        if (videos.length === 0) return { videoCount: 0, totalViews: 0, avgEngagement: 0 };

        const ids = videos.map((v: any) => v.id.videoId).filter(Boolean).join(',');
        const statsRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}&key=${process.env.YOUTUBE_API_KEY}`
        );
        const statsJson = await statsRes.json();
        const statsItems = statsJson.items || [];

        const totalViews = statsItems.reduce((sum: number, v: any) => sum + parseInt(v.statistics.viewCount || '0'), 0);
        const videoCount = statsItems.length;

        let totalEngagement = 0;
        statsItems.forEach((v: any) => {
            const views = parseInt(v.statistics.viewCount) || 1;
            const likes = parseInt(v.statistics.likeCount) || 0;
            totalEngagement += likes / views;
        });
        const avgEngagement = videoCount > 0 ? (totalEngagement / videoCount) * 1000 : 0;

        return { videoCount, totalViews, avgEngagement };
    } catch (e) {
        console.error(`[YouTube Error]`, e);
        return null;
    }
}

// ─────────────────────────────────────────────
// NORMALIZATION
// ─────────────────────────────────────────────
function normalize(value: number, allValues: number[]): number {
    const max = Math.max(...allValues, 1);
    const min = Math.min(...allValues);
    if (max === min) return 50;
    return ((value - min) / (max - min)) * 100;
}

// ─────────────────────────────────────────────
// CRON HANDLER
// ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
    // 🔒 Security check — only Vercel cron or requests with secret can trigger this
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON] Starting weekly trend refresh...');
    const startTime = Date.now();

    const skills = Object.keys(skillsToTrack);
    const rawDataMap: Record<string, any> = {};

    let apiFailureDetected = false;
    let failureReason = "";

    // Phase 1: Fetch all data (Batched parallel processing)
    const BATCH_SIZE = 5;
    for (let i = 0; i < skills.length; i += BATCH_SIZE) {
        const batch = skills.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (skill) => {
            const def = skillsToTrack[skill];
            const gData = await fetchGitHubData(def.github);
            const yData = await fetchYouTubeData(def.youtube);

            const githubRawScore = (gData.totalRepoCount * 0.5) + (gData.avgStars * 5) + (gData.totalForks * 0.2); // matches seed script formula
            const youtubeRawScore = yData
                ? (yData.videoCount * 10) + (yData.totalViews / 1000) + (yData.avgEngagement * 50)
                : 0;

            rawDataMap[skill] = { category: def.category, gData, yData, githubRawScore, youtubeRawScore };

            // API SAFETY CHECK (Matches seed script)
            if (gData.totalRepoCount === 0 && def.github) {
                apiFailureDetected = true;
                failureReason = `GitHub Limit/Error on ${skill}`;
            }
        }));

        if (apiFailureDetected) break; // Stop processing further batches

        await new Promise(r => setTimeout(r, 500)); // rate limit buffer between batches
    }

    if (apiFailureDetected) {
        console.error(`[CRON] ❌ ABORTING: API FETCH FAILED (${failureReason}). DB not updated to prevent corruption.`);
        return NextResponse.json({ error: `Aborted: ${failureReason}` }, { status: 500 });
    }

    // Phase 2: Category normalization + save
    const byCategory: Record<string, { gScores: number[]; yScores: number[] }> = {};

    for (const skill of skills) {
        const cat = rawDataMap[skill].category;
        if (!byCategory[cat]) byCategory[cat] = { gScores: [], yScores: [] };
        byCategory[cat].gScores.push(rawDataMap[skill].githubRawScore);
        if (rawDataMap[skill].yData) byCategory[cat].yScores.push(rawDataMap[skill].youtubeRawScore);
    }

    let saved = 0;
    for (const skill of skills) {
        const data = rawDataMap[skill];
        const cat = byCategory[data.category];

        const normG = normalize(data.githubRawScore, cat.gScores);
        const normY = data.yData && cat.yScores.length > 0 ? normalize(data.youtubeRawScore, cat.yScores) : 0;

        // Adaptive weights — dynamically assigns trust based on global ecosystem volume
        const hasGithub = data.gData.totalRepoCount > 50;
        const hasYouTube = data.yData !== null && (data.yData.videoCount ?? 0) > 15;
        const wG = hasGithub && hasYouTube ? 0.50
            : hasGithub && !hasYouTube ? 0.80
                : !hasGithub && hasYouTube ? 0.20
                    : 0.50;
        const wY = 1 - wG;

        const trendScore = Math.round(Math.max(0, Math.min(100, (normG * wG) + (normY * wY))));

        // Upsert score
        await prisma.trendScore.upsert({
            where: { skillName: skill },
            update: {
                trendScore,
                githubScore: data.gData.totalRepoCount,
                youtubeScore: data.yData?.totalViews ?? 0,
                githubWeight: wG,
                youtubeWeight: wY,
                githubSampleSize: data.gData.sampleSize,
                youtubeSampleSize: data.yData?.videoCount ?? 0,
                updatedAt: new Date(),
            },
            create: {
                skillName: skill,
                category: data.category,
                trendScore,
                githubScore: data.gData.totalRepoCount,
                youtubeScore: data.yData?.totalViews ?? 0,
                githubWeight: wG,
                youtubeWeight: wY,
                githubSampleSize: data.gData.sampleSize,
                youtubeSampleSize: data.yData?.videoCount ?? 0,
            }
        });

        // Update history (rolling 6 entries)
        const existing = await prisma.trendHistory.findUnique({ where: { skillName: skill } });
        let scores: number[] = existing ? [...(existing.scores as number[])] : [];
        let dates: string[] = (existing as any)?.dates ? [...((existing as any).dates as string[])] : [];

        scores.push(trendScore);
        dates.push(new Date().toISOString());

        if (scores.length > 6) {
            scores = scores.slice(-6);
            dates = dates.slice(-6);
        }

        await (prisma.trendHistory.upsert as any)({
            where: { skillName: skill },
            update: { scores, dates, updatedAt: new Date() },
            create: { skillName: skill, scores, dates }
        });

        saved++;
    }

    // Phase 3: Refresh AI-powered Snapshots & Flush Redis cache
    try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

        // Trigger refreshes for AI snapshots
        await Promise.allSettled([
            fetch(`${baseUrl}/api/effort-demand`, { method: 'POST', headers: { 'Authorization': authHeader || '' } }),
            fetch(`${baseUrl}/api/market-insights`, { method: 'POST', headers: { 'Authorization': authHeader || '' } })
        ]);

        await redis?.del('trend:scores:all');
        console.log('[CRON] Redis cache flushed and AI snapshots refreshed.');
    } catch (e) {
        console.warn('[CRON] Post-processing failed:', e);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[CRON] Done. ${saved} skills updated in ${duration}s`);

    return NextResponse.json({
        success: true,
        skillsUpdated: saved,
        durationSeconds: parseFloat(duration),
    });
}
