import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getGeminiModel, EXPERIMENTAL_MODEL } from "@/lib/gemini";

export const dynamic = "force-dynamic";

async function handleEffortDemand(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const skill = searchParams.get('skill');

        if (skill) {
            // Logic for specific skill search
            const model = getGeminiModel(EXPERIMENTAL_MODEL);
            const prompt = `Provide market data for the skill: "${skill}". Return JSON ONLY as a flat array with 1 object: [{ "skillName": "${skill}", "effort": 0-10, "demand": 0-10, "salary": "e.g. $120k", "roi": "High/Medium/Low", "effortLevel": 0-10, "demandLevel": 0-10, "jobOpenings": 1000, "avgSalary": "$120,000" }]`;

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
        const prompt = `Generate a realistic effort vs demand dataset for 20 popular software skills. Return JSON ONLY as a flat array: [{ "skillName": "", "effort": 70, "demand": 85, "salary": 120000, "roi": 8.5 }]`;

        const startTime = Date.now();
        const result = await model.generateContent(prompt);
        const latency = Date.now() - startTime;
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const snapshotData = JSON.parse(text);

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