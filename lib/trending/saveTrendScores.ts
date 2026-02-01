import { prisma } from '@/lib/prisma';

export interface TrendScoreResult {
    name: string;
    category: string;
    trendScore: number;
    breakdown: {
        github: number;
        youtube: number;
        weights: {
            github: number;
            youtube: number;
        };
    };
    metadata: {
        githubSampleSize: number;
        youtubeSampleSize: number;
    };
}

export async function saveTrendScores(results: TrendScoreResult[]) {
    console.log(`Saving ${results.length} trend scores to database...`);

    for (const result of results) {
        try {
            // 1. Update/Upsert the current score
            await prisma.trendScore.upsert({
                where: { skillName: result.name },
                create: {
                    skillName: result.name,
                    category: result.category,
                    trendScore: result.trendScore,
                    githubScore: result.breakdown.github,
                    youtubeScore: result.breakdown.youtube,
                    githubWeight: result.breakdown.weights.github,
                    youtubeWeight: result.breakdown.weights.youtube,
                    githubSampleSize: result.metadata.githubSampleSize,
                    youtubeSampleSize: result.metadata.youtubeSampleSize
                },
                update: {
                    trendScore: result.trendScore,
                    githubScore: result.breakdown.github,
                    youtubeScore: result.breakdown.youtube,
                    githubWeight: result.breakdown.weights.github,
                    youtubeWeight: result.breakdown.weights.youtube,
                    githubSampleSize: result.metadata.githubSampleSize,
                    youtubeSampleSize: result.metadata.youtubeSampleSize,
                    updatedAt: new Date()
                }
            });

            // 2. Update History for Growth Calculation
            // We only want to push to history occasionally (e.g., if different from last entry or once per week)
            // For simplicity, we'll push every update provided the update is at least 24h apart from the last
            await updateTrendHistory(result.name, result.trendScore);

        } catch (error) {
            console.error(`Failed to save trend score for ${result.name}:`, error);
        }
    }

    console.log('Finished saving trend scores.');
}

async function updateTrendHistory(skillName: string, newScore: number) {
    const existing = await prisma.trendHistory.findUnique({
        where: { skillName }
    });

    // Initialize scores array
    let scores: number[] = existing ? (existing.scores as number[]) : [];

    // Simple logic: Always push the new score (limits will be handled by slicing)
    // In a real prod app, checking dates would be better to avoid spamming history on multi-refresh
    scores.push(newScore);

    // Keep only last 6 entries (e.g., last 6 weeks/months)
    if (scores.length > 6) {
        scores = scores.slice(-6);
    }

    await prisma.trendHistory.upsert({
        where: { skillName },
        create: { skillName, scores },
        update: { scores }
    });
}
