import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const { role } = await req.json();
        if (!role) return NextResponse.json({ error: "Role required" }, { status: 400 });

        const normalizedRole = role.toLowerCase().trim();
        const CACHE_KEY = `role:skills:${normalizedRole}`;

        // 0. CHECK REDIS
        try {
            const cachedRedis = await redis?.get(CACHE_KEY);
            if (cachedRedis) {
                return NextResponse.json(JSON.parse(cachedRedis));
            }
        } catch (e) {
            console.warn('[ERROR] Redis Read:', e);
        }

        // 1. Check Cache (DB)
        const cached = await prisma.roleSkillMap.findUnique({ where: { roleName: role } });

        if (cached) {
            const isFresh = (new Date().getTime() - new Date(cached.updatedAt).getTime()) < 24 * 60 * 60 * 1000;
            if (isFresh) {
                // Save to Redis since we found it in DB
                try {
                    await redis?.set(CACHE_KEY, JSON.stringify(cached.skills), 'EX', 604800); // 7 Days
                } catch (e) { }

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

        // 4. Save to Redis
        try {
            await redis?.set(CACHE_KEY, JSON.stringify(skillsData), 'EX', 604800); // 7 Days
        } catch (e) {
            console.warn('[ERROR] Redis Write:', e);
        }

        return NextResponse.json(skillsData);

    } catch (error) {
        console.error("[ERROR] AI Role Mapping:", error);
        return NextResponse.json({ error: "Failed to map roles to skills" }, { status: 500 });
    }
}