import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
    try {
        const { skill } = await req.json();
        if (!skill) return NextResponse.json({ error: "Skill required" }, { status: 400 });

        // 1. Check Cache (DB)
        const cached = await prisma.skillRoleMap.findUnique({ where: { skillName: skill } });

        if (cached) {
            const isFresh = (new Date().getTime() - new Date(cached.updatedAt).getTime()) < 24 * 60 * 60 * 1000;
            if (isFresh) {
                console.log(`Cache HIT for ${skill}`);
                return NextResponse.json(cached.roles);
            }
        }

        console.log(`Cache MISS for ${skill}. Asking Gemini...`);

        // 2. Ask Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
            Act as a career coach. For the technical skill "${skill}", list the top 5 job roles a student could apply for if they master this skill.
            
            Return JSON ONLY in this format:
                {
                    "roleId": "unique-id",
                    "roleName": "Role Title",
                    "matchPercentage": 95,
                    "alignment": "Strong", // "Strong", "Medium", or "Weak"
                    "demandScore": 9, // 1-10
                    "reason": "Short 2-line explanation of why this skill is critical for this role."
                }
            ]
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "");
        const rolesData = JSON.parse(text);

        // 3. Save to DB
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