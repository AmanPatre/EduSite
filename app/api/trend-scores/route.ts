import { NextResponse } from 'next/server';
import { skillDetectionRules } from '../../../lib/skillDetectionRules';
import { fetchGitHubActivities, getLast30Days } from '../../../lib/github/fetchActivity';
import { fetchYouTubeActivity } from '../../../lib/youtube/fetchActivity';
import { calculateTrendScore } from '../../../lib/trending/calculateScore';
import { prisma } from '../../../lib/prisma';
import { saveTrendScores } from '../../../lib/trending/saveTrendScores';
import redis from '../../../lib/redis';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
    try {
        const CACHE_KEY = 'trend:scores:all';

        // 0. REDIS CACHE CHECK (Speed Layer)
        // Check if we have the full response cached in RAM
        try {
            const cachedRedis = await redis?.get(CACHE_KEY);
            if (cachedRedis) {
                console.log('[CACHE HIT] Trend Scores (Redis)');
                return NextResponse.json(JSON.parse(cachedRedis));
            }
        } catch (e) {
            console.warn('[ERROR] Redis Read:', e);
        }

        // 1. Check Cache (Database)
        // We only refresh if data is older than 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Check if we have ANY data that is fresh
        // Ideally we check per skill, but checking "React" is a good proxy for the batch
        const cachedData = await prisma.trendScore.findMany({
            where: {
                updatedAt: { gt: twentyFourHoursAgo }
            }
        });

        const skills = Object.keys(skillDetectionRules);

        // If we have cached data for most skills, return it!
        if (cachedData.length >= skills.length * 0.8) {
            console.log('[CACHE HIT] Trend Scores (DB)');

            const results = cachedData.map(c => ({
                name: c.skillName,
                category: c.category,
                trendScore: c.trendScore,
                breakdown: {
                    github: c.githubScore,
                    youtube: c.youtubeScore,
                    weights: {
                        github: c.githubWeight,
                        youtube: c.youtubeWeight
                    }
                },
                metadata: {
                    githubSampleSize: c.githubSampleSize,
                    youtubeSampleSize: c.youtubeSampleSize
                }
            }));

            // Sort by trend score
            results.sort((a, b) => b.trendScore - a.trendScore);

            // SAVE TO REDIS (24 Hours) - Even if it came from DB, cache it in Redis for faster subsequent detailed access
            try {
                await redis?.set(CACHE_KEY, JSON.stringify(results), 'EX', 86400); // 1 Day
            } catch (e) {
                console.warn('Redis write error:', e);
            }

            return NextResponse.json(results);
        }

        // 2. Cache MISS - Fetch Fresh Data
        console.log('[CACHE MISS] Trend Scores - Fetching fresh data...');

        // CRITICAL FIX: "Touch" the existing records immediately to prevent race conditions.
        // If Request A starts deciding to fetch, we update timestamps so Request B sees them as "Fresh"
        // and returns the old data instead of triggering a parallel quota-heavy fetch.
        if (cachedData.length > 0) {
            await prisma.trendScore.updateMany({
                where: { id: { in: cachedData.map(c => c.id) } },
                data: { updatedAt: new Date() }
            });
            console.log('[CONCURRENCY] Touched existing records to prevent race conditions.');
        }

        const dateRange = getLast30Days();

        // Fetch GitHub (GraphQL Batch)
        const githubDataMap = await fetchGitHubActivities(skills, dateRange);

        // Fetch YouTube (Parallel)
        // Note: This WILL consume quota, but only once per day due to caching above
        const youtubeDataList = await Promise.all(
            skills.map(async (skill) => {
                try {
                    return await fetchYouTubeActivity(skillDetectionRules[skill].youtube);
                } catch (error) {
                    console.error(`Error fetching YouTube data for ${skill}:`, error);
                    return { videoCount: 0, totalViews: 0, avgEngagement: 0, sampleSize: 0 };
                }
            })
        );

        const youtubeDataMap: Record<string, any> = {};
        skills.forEach((skill, index) => {
            youtubeDataMap[skill] = youtubeDataList[index];
        });

        // Score Calculation
        const allSkillsData: Record<string, { githubScore: number; youtubeScore: number }> = {};

        skills.forEach(skill => {
            const g = githubDataMap[skill];
            const y = youtubeDataMap[skill];

            // Use type assertions or simplified score function access
            // Ideally export these from calculateScore.ts but inline is fine for now
            // Recalculating raw scores for normalization context
            const githubScore = (g.repoCount * 2.0) + (g.avgStars * 0.5) + (g.totalForks * 0.1);
            const youtubeScore = (y.videoCount * 10) + (y.totalViews / 1000) + (y.avgEngagement * 500);

            allSkillsData[skill] = {
                githubScore: isNaN(githubScore) ? 0 : githubScore,
                youtubeScore: isNaN(youtubeScore) ? 0 : youtubeScore
            };
        });

        // Final Scores
        const results = skills.map(skill => {
            const github = githubDataMap[skill];
            const youtube = youtubeDataMap[skill];

            const scoreData = calculateTrendScore(
                skill,
                github,
                youtube,
                allSkillsData
            );

            return {
                name: skillDetectionRules[skill].name,
                category: skillDetectionRules[skill].category,
                trendScore: scoreData.trendScore,
                breakdown: scoreData.breakdown,
                metadata: {
                    githubSampleSize: github.sampleSize,
                    youtubeSampleSize: youtube.sampleSize
                }
            };
        });

        // 3. Save to Database (Cache)
        await saveTrendScores(results);

        // Sort and Return
        results.sort((a, b) => b.trendScore - a.trendScore);
        console.log(`[DB UPDATE] Refreshed ${results.length} trend scores`);

        // SAVE TO REDIS (24 Hours)
        try {
            await redis?.set(CACHE_KEY, JSON.stringify(results), 'EX', 86400); // 1 Day
        } catch (e) {
            console.warn('Redis write error:', e);
        }

        return NextResponse.json(results);

    } catch (error) {
        console.error('Trend scores API error:', error);
        return NextResponse.json(
            { error: 'Failed to calculate trend scores', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
