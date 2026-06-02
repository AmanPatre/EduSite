import { NextResponse } from 'next/server';
import { trendingSkills, TrendingSkill } from '@/data/trendingData';
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { getGeminiModel, EXPERIMENTAL_MODEL } from "@/lib/gemini";

export const dynamic = "force-dynamic";

async function handleMarketAnalytics() {
    try {
        const CACHE_KEY = "market:insights:global";

        // 1. REDIS CACHE CHECK
        try {
            const cachedRedis = await redis?.get(CACHE_KEY);
            if (cachedRedis) return NextResponse.json(JSON.parse(cachedRedis));
        } catch (e) {
            console.warn('[ERROR] Redis Read:', e);
        }

        // 2. MONGODB CACHE CHECK
        const cachedDb = await prisma.searchCache.findUnique({
            where: { query: CACHE_KEY }
        });

        if (cachedDb) {
            const isFresh = (Date.now() - new Date(cachedDb.updatedAt).getTime()) < 24 * 60 * 60 * 1000;
            if (isFresh && cachedDb.data) {
                try {
                    await redis?.set(CACHE_KEY, JSON.stringify(cachedDb.data), 'EX', 86400);
                } catch (e) { }
                return NextResponse.json(cachedDb.data);
            }
        }

        // 3. GENERATE NEW CONTENT (AI)
        const skillContext = trendingSkills.map((s: TrendingSkill) => `${s.name} (ID: ${s.id})`).join(', ');

        const prompt = `Analyze Tech Market 2024-2025. Generate 9 insights (3 trends, 3 warnings, 3 opportunities) matching these IDs: ${skillContext}. Output EXACT JSON array: [{ id: "", type: "", title: "", description: "", relatedSkills: [], impact: "", timeframe: "" }]`;

        const model = getGeminiModel(EXPERIMENTAL_MODEL);
        const startTime = Date.now();
        const result = await model.generateContent(prompt);
        const latency = Date.now() - startTime;
        let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const insights = JSON.parse(text);

        // Log AI Interaction
        (async () => {
            try {
                await prisma.aIInteraction.create({
                    data: {
                        modelUsed: EXPERIMENTAL_MODEL,
                        feature: "MARKET_ANALYTICS",
                        prompt: "Market Insights Global",
                        response: insights,
                        latency,
                    }
                });
            } catch (logError) {
                console.warn("[ERROR] AI Log Failed:", logError);
            }
        })();

        // 4. SAVE TO MONGODB
        await prisma.searchCache.upsert({
            where: { query: CACHE_KEY },
            update: { data: insights },
            create: {
                query: CACHE_KEY,
                data: insights
            }
        });

        // 5. SAVE TO REDIS
        try {
            await redis?.set(CACHE_KEY, JSON.stringify(insights), 'EX', 86400);
        } catch (e) {
            console.warn('[ERROR] Redis Write:', e);
        }

        return NextResponse.json(insights);

    } catch (error: any) {
        console.error('[ERROR] Gemini API:', error);
        return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
    }
}

export async function GET() {
    return handleMarketAnalytics();
}

export async function POST() {
    return handleMarketAnalytics();
}
