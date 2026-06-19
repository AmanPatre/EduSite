import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getGeminiModel, EXPERIMENTAL_MODEL } from "@/lib/gemini";
import { marketInsights as fallbackData } from "@/data/trendingData";

export const dynamic = "force-dynamic";

async function handleMarketInsights(req: Request) {
    try {
        const method = req.method;

        // 1. Check DB Cache for global snapshot (24-hour expiration)
        // Bypass cache check if it's a POST request (used by Cron or Force Refresh)
        const cached = await prisma.marketInsightsSnapshot.findFirst({
            orderBy: { updatedAt: 'desc' }
        });

        if (cached && method === 'GET') {
            const isFresh = (Date.now() - new Date(cached.updatedAt).getTime()) < 24 * 60 * 60 * 1000;
            if (isFresh) return NextResponse.json(cached.data);
        }

        // 2. Ask AI to generate realistic market insights
        const model = getGeminiModel(EXPERIMENTAL_MODEL);
        const prompt = `Generate exactly 9 fresh, realistic software engineering market insights. 
        Each insight must have the following exact JSON schema:
        [{
          "id": "unique-string",
          "type": "trend" OR "warning" OR "opportunity",
          "title": "Short punchy title",
          "description": "Around 150-200 chars describing the insight.",
          "relatedSkills": ["skill-1", "skill-2"],
          "impact": "High" OR "Medium" OR "Low",
          "timeframe": "Current" OR "Next 6 months" OR etc.
        }]
        
        Use generic skill IDs like "skill-1", "skill-2" from the list of common frontend/backend/cloud skills. Make them highly relevant for tech job seekers today. Return JSON ONLY as a flat array of 9 objects. Do NOT use markdown code blocks like \`\`\`json.`;

        const startTime = Date.now();
        const result = await model.generateContent(prompt);
        const latency = Date.now() - startTime;
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        let snapshotData = JSON.parse(text);

        // Validation mapping
        snapshotData = snapshotData.map((item: any, index: number) => ({
            id: item.id || `insight-${Date.now()}-${index}`,
            type: ['trend', 'warning', 'opportunity'].includes(item.type?.toLowerCase()) ? item.type.toLowerCase() : 'trend',
            title: item.title || `Market Insight ${index + 1}`,
            description: item.description || "The market is evolving. Key strategic focus is recommended for these sectors.",
            relatedSkills: Array.isArray(item.relatedSkills) ? item.relatedSkills : ['skill-1'],
            impact: ['High', 'Medium', 'Low'].includes(item.impact) ? item.impact : 'Medium',
            timeframe: item.timeframe || 'Current'
        }));

        // Log the AI Interaction safely
        (async () => {
            try {
                await prisma.aIInteraction.create({
                    data: {
                        modelUsed: EXPERIMENTAL_MODEL,
                        feature: "MARKET_INSIGHTS_GENERATE",
                        prompt: prompt,
                        response: snapshotData,
                        latency,
                    }
                });
            } catch (e) { console.error('Failed to log AI interaction', e); }
        })();

        // 3. Save generated data to DB Cache
        await prisma.marketInsightsSnapshot.create({
            data: { data: snapshotData }
        });

        // 4. Also delete old ones to keep DB small
        if (cached) {
            await prisma.marketInsightsSnapshot.deleteMany({
                where: { id: { not: cached.id } }
            });
        }

        return NextResponse.json(snapshotData);

    } catch (error: any) {
        console.error("Market Insights Error:", error);
        return NextResponse.json(fallbackData); // Fallback to hardcoded constants if AI or Parsing fails
    }
}

export async function GET(req: Request) {
    return handleMarketInsights(req);
}

export async function POST(req: Request) {
    return handleMarketInsights(req);
}
