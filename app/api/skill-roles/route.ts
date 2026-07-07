import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getGeminiModel, EXPERIMENTAL_MODEL } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const { skill } = await req.json();
        if (!skill) return NextResponse.json({ error: "Skill required" }, { status: 400 });

        const cached = await prisma.skillRoleMap.findUnique({ where: { skillName: skill } });

        if (cached) {
            const isFresh = (new Date().getTime() - new Date(cached.updatedAt).getTime()) < 24 * 60 * 60 * 1000;
            if (isFresh) return NextResponse.json(cached.roles);
        }

        const model = getGeminiModel(EXPERIMENTAL_MODEL);
        const prompt = `Act as a career coach. For the technical skill "${skill}", list the top 5 job roles a student could apply for. Return JSON ONLY: [{ "roleId": "", "roleName": "", "matchPercentage": 95, "alignment": "Strong", "demandScore": 9, "reason": "" }]`;

        const startTime = Date.now();
        const result = await model.generateContent(prompt);
        const latency = Date.now() - startTime;
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const rolesData = JSON.parse(text);


        (async () => {
            try {
                await prisma.aIInteraction.create({
                    data: {
                        modelUsed: EXPERIMENTAL_MODEL,
                        feature: "SKILL_ROLES",
                        prompt: `Roles for ${skill}`,
                        response: rolesData,
                        latency,
                    }
                });
            } catch (logError) {
                console.warn("[ERROR] AI Log Failed:", logError);
            }
        })();

        await prisma.skillRoleMap.upsert({
            where: { skillName: skill },
            create: { skillName: skill, roles: rolesData },
            update: { roles: rolesData }
        });

        return NextResponse.json(rolesData);

    } catch (error) {
        console.error("AI Mapping Error:", error);
        return NextResponse.json({ error: "Failed to map skills" }, { status: 500 });
    }
}