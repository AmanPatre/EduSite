import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getGeminiModel, EXPERIMENTAL_MODEL } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const { role } = await req.json();
        if (!role) return NextResponse.json({ error: "Role required" }, { status: 400 });

        const cached = await prisma.roleSkillMap.findUnique({ where: { roleName: role } });

        if (cached) {
            const isFresh = (new Date().getTime() - new Date(cached.updatedAt).getTime()) < 24 * 60 * 60 * 1000;
            if (isFresh) return NextResponse.json(cached.skills);
        }

        const model = getGeminiModel(EXPERIMENTAL_MODEL);
        const prompt = `Act as a Technical Hiring Manager. For the role "${role}", list the top 5 essential skills. Return JSON ONLY: [{ "skillName": "", "importance": "Critical", "matchPercentage": 90, "reason": "" }]`;

        const startTime = Date.now();
        const result = await model.generateContent(prompt);
        const latency = Date.now() - startTime;
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const skillsData = JSON.parse(text);

        // Log AI Interaction
        (async () => {
            try {
                await prisma.aIInteraction.create({
                    data: {
                        modelUsed: EXPERIMENTAL_MODEL,
                        feature: "ROLE_SKILLS",
                        prompt: `Skills for ${role}`,
                        response: skillsData,
                        latency,
                    }
                });
            } catch (logError) {
                console.warn("[ERROR] AI Log Failed:", logError);
            }
        })();

        await prisma.roleSkillMap.upsert({
            where: { roleName: role },
            create: { roleName: role, skills: skillsData },
            update: { skills: skillsData }
        });

        return NextResponse.json(skillsData);

    } catch (error) {
        console.error("AI Mapping Error:", error);
        return NextResponse.json({ error: "Failed to map roles" }, { status: 500 });
    }
}