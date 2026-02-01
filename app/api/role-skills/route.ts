import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
    try {
        const { role } = await req.json();
        if (!role) return NextResponse.json({ error: "Role required" }, { status: 400 });

        // 1. Check Cache
        const cached = await prisma.roleSkillMap.findUnique({ where: { roleName: role } });

        if (cached) {
            const isFresh = (new Date().getTime() - new Date(cached.updatedAt).getTime()) < 24 * 60 * 60 * 1000;
            if (isFresh) {
                return NextResponse.json(cached.skills);
            }
        }

        // 2. Ask Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
            Act as a CTO hiring for the role "${role}". List the top 5 technical skills required for this job.
            
            Return JSON ONLY in this format:
            [
                {
                    "skillId": "unique-kebab-case-id",
                    "skillName": "Skill Name",
                    "priority": "Critical", // "Critical", "Important", or "Bonus"
                    "reason": "Short explanation of why this skill is needed for this role (max 1 sentence)."
                }
            ]
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "");
        const skillsData = JSON.parse(text);

        // 3. Save to DB
        await prisma.roleSkillMap.upsert({
            where: { roleName: role },
            create: { roleName: role, skills: skillsData },
            update: { skills: skillsData }
        });

        return NextResponse.json(skillsData);

    } catch (error) {
        console.error("AI Role-Skill Mapping Error:", error);
        return NextResponse.json({ error: "Failed to map roles to skills" }, { status: 500 });
    }
}