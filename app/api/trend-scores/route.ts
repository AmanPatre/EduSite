import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import redis from '../../../lib/redis';

// Force dynamic - this API must not be statically generated, 
// but it is "fast dynamic" because it reads from DB only.
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const CACHE_KEY = 'trend:scores:all';

        // 1. Try Redis Cache (Fastest - 24 hours)
        try {
            const cachedRedis = await redis?.get(CACHE_KEY);
            if (cachedRedis) {
                console.log('[CACHE HIT] Serving from Redis');
                return NextResponse.json(JSON.parse(cachedRedis));
            }
        } catch (e) {
            console.warn('Redis read error (skipping):', e);
        }

        // 2. Fetch from MongoDB (Fast - Permanent Cache)
        // Data is seeded via "scripts/seed-trends.js". 
        // We do NOT fetch from YouTube/GitHub here to prevent Timeouts (504).
        console.log('[DB READ] Fetching from MongoDB Permanent Cache');

        const results = await prisma.trendScore.findMany({
            orderBy: { trendScore: 'desc' }
        });

        if (results.length === 0) {
            console.warn('⚠️ No data in DB. Please run "npm run seed-trends" locally.');
            return NextResponse.json(
                { error: 'Trend data is being generated. Please try again in 5 minutes.' },
                { status: 503 }
            );
        }

        // 3. Format Response
        const formattedResults = results.map(c => ({
            name: c.skillName,
            category: c.category,
            trendScore: c.trendScore,
            breakdown: {
                github: c.githubScore,
                youtube: c.youtubeScore,
                weights: {
                    github: c.githubWeight || 0.5,
                    youtube: c.youtubeWeight || 0.5
                }
            },
            metadata: {
                githubSampleSize: c.githubSampleSize,
                youtubeSampleSize: c.youtubeSampleSize
            }
        }));

        // 4. Save to Redis
        try {
            await redis?.set(CACHE_KEY, JSON.stringify(formattedResults), 'EX', 86400);
        } catch (e) {
            console.warn('Redis set error:', e);
        }

        return NextResponse.json(formattedResults);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
