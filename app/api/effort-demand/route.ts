import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getGeminiModel, EXPERIMENTAL_MODEL } from "@/lib/gemini";
import { validateTopic } from "@/lib/topicGuard";

import redis from "@/lib/redis";

export const dynamic = "force-dynamic";

async function handleEffortDemand(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const skill = searchParams.get('skill');

        if (skill) {
            const cacheKey = `effort:skill:${skill.toLowerCase()}`;
            try {
                const cachedData = await redis?.get(cacheKey);
                if (cachedData) return NextResponse.json(JSON.parse(cachedData));
            } catch (e) {
                console.warn("[ERROR] Redis effort read:", e);
            }

            // Topic Guard: Prevent non-tech skills
            const validation = await validateTopic(skill, 'TECH_SKILL');
            if (!validation.isValid) {
                return NextResponse.json({
                    error: "Invalid Skill",
                    message: `"${skill}" does not appear to be a technical or professional software skill. Synapse only analyzes industry-relevant learning paths.`,
                    reason: validation.reason
                }, { status: 400 });
            }

            // Logic for specific skill search
            const model = getGeminiModel(EXPERIMENTAL_MODEL);
            const prompt = `Provide market data for the skill: "${skill}". 
            IMPORTANT: Include a "placementReason" field which is a one-sentence clever AI insight explaining why this skill has these levels.
            Return JSON ONLY as a flat array with 1 object: [{ "skillName": "${skill}", "effortLevel": 0-10, "demandLevel": 0-10, "jobOpenings": 1000, "avgSalary": "$120,000", "roi": "High/Medium/Low", "placementReason": "reason here" }]`;

            const startTime = Date.now();
            const result = await model.generateContent(prompt);
            const latency = Date.now() - startTime;
            const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(text);

            // Log AI Interaction
            (async () => {
                try {
                    await prisma.aIInteraction.create({
                        data: {
                            modelUsed: EXPERIMENTAL_MODEL,
                            feature: "EFFORT_DEMAND_SEARCH",
                            prompt: `Search for ${skill}`,
                            response: data,
                            latency,
                        }
                    });
                } catch (e) { }
                try {
                    await redis?.set(cacheKey, JSON.stringify(data), 'EX', 86400); // 24h cache
                } catch (e) {
                    console.warn("[ERROR] Redis effort write:", e);
                }
            })();

            return NextResponse.json(data);
        }

        // 1. Check DB Cache for global snapshot
        const cached = await prisma.effortDemandSnapshot.findFirst({
            orderBy: { updatedAt: 'desc' }
        });

        if (cached) {
            const isFresh = (Date.now() - new Date(cached.updatedAt).getTime()) < 24 * 60 * 60 * 1000;
            if (isFresh) return NextResponse.json(cached.data);
        }

        // 2. Ask AI
        const model = getGeminiModel(EXPERIMENTAL_MODEL);
        const prompt = `Generate a realistic effort vs demand dataset for 20 popular software skills. 
        IMPORTANT: For each skill, include a "placementReason" field which is a one-sentence clever AI insight (e.g., "Python's dominance in AI makes it a high-demand, medium-effort powerhouse").
        Return JSON ONLY as a flat array: [{ "skillName": "", "category": "Frontend/Backend/etc", "effortLevel": 5, "demandLevel": 8, "jobOpenings": 150000, "avgSalary": "$120k", "roi": "High", "placementReason": "" }]`;

        const startTime = Date.now();
        const result = await model.generateContent(prompt);
        const latency = Date.now() - startTime;
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        let snapshotData = JSON.parse(text);

        // Map data to ensure skillId and slug exist and properties are strictly typed as Numbers
        snapshotData = snapshotData.map((item: any, i: number) => {
            const rawEffort = item.effortLevel || item.effort || item.effortScore || 5;
            const rawDemand = item.demandLevel || item.demand || item.demandScore || 5;
            let finalEffort = Number(rawEffort);
            let finalDemand = Number(rawDemand);

            // If they were given on a 0-100 scale, scale down
            if (finalEffort > 10) finalEffort = Math.round(finalEffort / 10);
            if (finalDemand > 10) finalDemand = Math.round(finalDemand / 10);

            // Job openings might have commas or be strings like "100k"
            let jobs = item.jobOpenings || item.jobs || 10000;
            if (typeof jobs === 'string') {
                jobs = parseInt(jobs.replace(/,/g, '').replace(/k/gi, '000').match(/\d+/)?.[0] || '10000');
            }

            return {
                ...item,
                skillId: item.skillId || `ai-skill-${i}-${Date.now()}`,
                slug: item.slug || item.skillName?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `skill-${i}`,
                effortLevel: Math.min(Math.max(finalEffort, 0), 10),
                demandLevel: Math.min(Math.max(finalDemand, 0), 10),
                jobOpenings: typeof jobs === 'number' && !isNaN(jobs) ? jobs : 10000,
                roi: item.roi || 'Medium'
            };
        });

        // 3. Save to DB
        await prisma.effortDemandSnapshot.create({
            data: { data: snapshotData }
        });

        return NextResponse.json(snapshotData);

    } catch (error: any) {
        console.error("Effort-Demand Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate market data" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    return handleEffortDemand(req);
}

export async function POST(req: Request) {
    return handleEffortDemand(req);
}