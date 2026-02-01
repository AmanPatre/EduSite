import { NextResponse } from 'next/server';
import { skillDetectionRules } from '../../../lib/skillDetectionRules';
import { fetchGitHubActivities, getLast30Days } from '../../../lib/github/fetchActivity';
import { fetchYouTubeActivity } from '../../../lib/youtube/fetchActivity';
import { calculateTrendScore } from '../../../lib/trending/calculateScore';
import { prisma } from '../../../lib/prisma';
import { saveTrendScores } from '../../../lib/trending/saveTrendScores';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
    try {
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
            console.log('Serving from DB Cache (0 API Quota used)');

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
            return NextResponse.json(results);
        }

        // 2. Cache MISS - Fetch Fresh Data
        console.log('Cache Stale or Empty. Fetching fresh API data...');

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
        console.log(`Successfully refreshed and cached ${results.length} trend scores`);

        return NextResponse.json(results);

    } catch (error) {
        console.error('Trend scores API error:', error);
        return NextResponse.json(
            { error: 'Failed to calculate trend scores', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
