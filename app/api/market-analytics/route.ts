import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { trendingSkills, TrendingSkill } from '@/data/trendingData';
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";

export async function POST() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const CACHE_KEY = "market:insights:global";

        // 1. REDIS CACHE CHECK (Speed)
        try {
            const cachedRedis = await redis?.get(CACHE_KEY);
            if (cachedRedis) {
                console.log('[CACHE HIT] Market Analytics (Redis)');
                return NextResponse.json(JSON.parse(cachedRedis));
            }
        } catch (e) {
            console.warn('[ERROR] Redis Read:', e);
        }

        // 2. MONGODB CACHE CHECK (Persistence)
        const cachedDb = await prisma.searchCache.findUnique({
            where: { query: CACHE_KEY }
        });

        if (cachedDb) {
            // Check freshness (24 hours)
            const isFresh = (Date.now() - new Date(cachedDb.updatedAt).getTime()) < 24 * 60 * 60 * 1000;
            if (isFresh && cachedDb.data) {
                console.log('[CACHE HIT] Market Analytics (DB)');

                // Refill Redis
                try {
                    await redis?.set(CACHE_KEY, JSON.stringify(cachedDb.data), 'EX', 24 * 60 * 60);
                } catch (e) { }

                return NextResponse.json(cachedDb.data);
            }
        }

        if (!apiKey) {
            return NextResponse.json(
                { error: "Missing GEMINI_API_KEY" },
                { status: 500 }
            );
        }

        // 3. GENERATE NEW CONTENT (AI)
        const skillContext = trendingSkills.map((s: TrendingSkill) => `${s.name} (ID: ${s.id})`).join(', ');

        const prompt = `
            You are a Market Trends Analyst for the Software Engineering industry.
            Using your own comprehensive knowledge of the Global Tech Market in 2024-2025, generate 9 diverse and realistic market insights.
            
            CONTEXT:
            Map your insights to these specific skill IDs where relevant:
            ${skillContext}
            
            DISTRIBUTION:
            -  Trends (Current major market shifts) - create 3  impact : high, medium, low
            -  Warnings (Techniques or roles facing decline/saturation)  - create 3  impact : high, medium, low
            -  Opportunities (Niche or high-growth areas with low supply) - create 3  impact : high, medium, low
            
            FORMAT REQUIREMENTS:
            - Return ONLY a pure JSON array (no markdown code blocks).
            - Each object must have:
              - id: string (e.g. 'insight-1')
              - type: 'trend' | 'warning' | 'opportunity'
              - title: string (Punchy 3-5 word headline)
              - description: string (2 sentences max, include specific % or figures if known)
              - relatedSkills: string array (Use the IDs provided above, e.g. ['skill-5'])
              - impact: 'High' | 'Medium' | 'Low'
              - timeframe: string (e.g. 'Next 6 months', 'Q3 2025')
              
            EXAMPLE OUTPUT:
        [
            {
                "id": "insight-1",
                "type": "opportunity",
                "title": "Rust for Infrastructure",
                "description": "Rust adoption in cloud-native tooling is booming with 58% YoY growth.",
                "relatedSkills": ["skill-5"],
                "impact": "High",
                "timeframe": "Next 12 months"
            }
        ]
            `;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const insights = JSON.parse(text);

        // 4. SAVE TO MONGODB (Persistence)
        await prisma.searchCache.upsert({
            where: { query: CACHE_KEY },
            update: { data: insights },
            create: {
                query: CACHE_KEY,
                data: insights
            }
        });

        // 5. SAVE TO REDIS (Speed)
        try {
            await redis?.set(CACHE_KEY, JSON.stringify(insights), 'EX', 24 * 60 * 60); // 1 Day
        } catch (e) {
            console.warn('[ERROR] Redis Write:', e);
        }

        return NextResponse.json(insights);

    } catch (error) {
        console.error('[ERROR] Gemini API:', error);
        return NextResponse.json(
            { error: "Failed to generate insights" },
            { status: 500 }
        );
    }
}
