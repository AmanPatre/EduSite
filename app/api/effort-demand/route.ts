import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const skillQuery = searchParams.get('skill');

        // IF SEARCHING FOR SPECIFIC SKILL
        if (skillQuery) {
            const normalizedQuery = skillQuery.toLowerCase().trim();
            const CACHE_KEY = `search:skill:${normalizedQuery}`;

            // 0. REDIS CACHE CHECK
            try {
                const cachedRedis = await redis?.get(CACHE_KEY);
                if (cachedRedis) {
                    return NextResponse.json(JSON.parse(cachedRedis));
                }
            } catch (e) { console.warn('[ERROR] Redis Read:', e); }

            // 1. CHECK CACHE FIRST (DB)
            const cachedSearch = await prisma.searchCache.findUnique({
                where: { query: normalizedQuery }
            });

            if (cachedSearch) {
                const isFresh = (new Date().getTime() - new Date(cachedSearch.updatedAt).getTime()) < 7 * 24 * 60 * 60 * 1000; // 7 days freshness
                if (isFresh) {
                    // SAVE TO REDIS (7 Days) - Even if it came from DB
                    try { await redis?.set(CACHE_KEY, JSON.stringify(cachedSearch.data), 'EX', 604800); } catch (e) { }
                    return NextResponse.json(cachedSearch.data);
                }
            }

            // 2. ASK GEMINI (If not cached or stale)
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const prompt = `
                Analyze this specific technical skill from the perspective of the **Indian Job Market**: ${skillQuery}.
                
                Provide:
                1. Learning Effort (1-10): 1 = Easy (1 month), 10 = Very Hard (12+ months).
                2. Market Demand (1-10): 1 = Low, 10 = Extremely high in India.
                3. Average Salary: strings like "₹8-12 LPA" or "₹25 LPA" (Indian Rupees).
                4. Category: (Frontend, Backend, DevOps, AI/ML, Mobile, etc).
                5. Placement Reason: A short, concise sentence (max 20 words) explaining WHY it has this effort/demand level in India.
                
                Return JSON ONLY in this structure (Array with 1 item):
                [
                    {
                        "skillId": "kebab-case-name",
                        "skillName": "Name",
                        "effortLevel": 5, // 1-10
                        "demandLevel": 8, // 1-10
                        "avgSalary": "₹12 LPA",
                        "category": "Frontend",
                        "learningMonths": "1-2 (Number only)",
                        "placementReason": "High demand in Bangalore startups, moderate learning curve."
                    }
                ]
            `;

            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json/g, "").replace(/```/g, "");
            let analysisData = JSON.parse(text);

            // Calculate ROI & Normalize
            analysisData = analysisData.map((item: any) => {
                let roi = 'Medium';
                if (item.demandLevel >= 7 && item.effortLevel <= 5) roi = 'High';
                if (item.demandLevel <= 4 && item.effortLevel >= 7) roi = 'Low';

                // Ensure learningMonths exists if LLM missed it
                if (!item.learningMonths) {
                    item.learningMonths = item.effortLevel <= 3 ? "< 1" : item.effortLevel <= 6 ? "2-5" : "6+";
                }

                return {
                    ...item,
                    roi,
                    // Use demand * 1500 as a proxy for job openings relative size
                    jobOpenings: item.demandLevel * 1500
                };
            });

            // 3. CACHE THE RESULT (DB + Redis)
            await prisma.searchCache.upsert({
                where: { query: normalizedQuery },
                update: { data: analysisData },
                create: {
                    query: normalizedQuery,
                    data: analysisData
                }
            });

            try {
                await redis?.set(CACHE_KEY, JSON.stringify(analysisData), 'EX', 604800); // 7 Days
            } catch (e) {
                console.warn('[ERROR] Redis Write:', e);
            }

            return NextResponse.json(analysisData);
        }

        // DEFAULT BEHAVIOR (Snapshot)
        const SNAPSHOT_KEY = 'effort:demand:snapshot';

        // 0. CHECK REDIS SNAPSHOT
        try {
            const cachedRedis = await redis?.get(SNAPSHOT_KEY);
            if (cachedRedis) {
                return NextResponse.json(JSON.parse(cachedRedis));
            }
        } catch (e) { console.warn('[ERROR] Redis Read:', e); }

        // 1. Check for valid cache (less than 24 hours old)
        const cached = await prisma.effortDemandSnapshot.findFirst();
        if (cached) {
            const isFresh = (new Date().getTime() - new Date(cached.updatedAt).getTime()) < 24 * 60 * 60 * 1000;
            if (isFresh) {
                // Fix: Normalize cached data to ensure newer fields like 'learningMonths' exist
                let data = cached.data as any[];

                // Safety check if data is string (sometimes happens with JSON in specific adapters)
                if (typeof data === 'string') {
                    try { data = JSON.parse(data); } catch (e) { }
                }

                if (Array.isArray(data)) {
                    // Force Refresh Check: If data contains '$' (USD), it's old non-localized data.
                    const isLocalized = !JSON.stringify(data).includes('$');
                    if (isLocalized) {
                        data = data.map(item => {
                            if (!item.learningMonths) {
                                item.learningMonths = item.effortLevel <= 3 ? "< 1" : item.effortLevel <= 6 ? "2-5" : "6+";
                            }
                            return item;
                        });

                        // Save to Redis since we found it in DB
                        try { await redis?.set(SNAPSHOT_KEY, JSON.stringify(data), 'EX', 86400); } catch (e) { }

                        return NextResponse.json(data);
                    }
                }
            }
        }

        // 2. If no cache, fetch trending skills to analyze
        // We limit to top 15 to keep the chart readable
        const topSkills = await prisma.trendScore.findMany({
            orderBy: { trendScore: 'desc' },
            take: 15,
            select: { skillName: true, category: true }
        });

        const skillNames = topSkills.map(s => s.skillName).join(", ");

        // If no skills in DB yet, use a fallback list
        const skillsToAnalyze = skillNames || "React, Python, Node.js, Docker, AWS, TypeScript, Go, Rust, Kubernetes, Swift";

        // 3. Ask Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
            Analyze these technical skills from the perspective of the **Indian Job Market**: ${skillsToAnalyze}.
            
            For EACH skill, provide:
            1. Learning Effort (1-10): 1 = Easy (1 month), 10 = Very Hard (12+ months).
            2. Market Demand (1-10): 1 = Low demand, 10 = Extremely high demand in India.
            3. Average Salary: strings like "₹12 LPA" or "₹8-15 LPA".
            4. Category: (Frontend, Backend, DevOps, AI/ML, Mobile, etc).
            5. Placement Reason: A short, concise sentence (max 20 words) explaining placement in Indian market.
            
            Return JSON ONLY in this structure:
            [
                {
                    "skillId": "kebab-case-name",
                    "skillName": "Name",
                    "effortLevel": 5, // 1-10
                    "demandLevel": 8, // 1-10
                    "avgSalary": "₹12 LPA",
                    "category": "Frontend",
                    "learningMonths": "3-4 (Only tell the number like if 3-4 months then 3-4)",
                    "placementReason": "Reason text..."
                }
            ]
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "");
        const analysisData = JSON.parse(text);

        // Calculate ROI internally
        const processedData = analysisData.map((item: any) => {
            let roi = 'Medium';
            if (item.demandLevel >= 7 && item.effortLevel <= 5) roi = 'High';
            if (item.demandLevel <= 4 && item.effortLevel >= 7) roi = 'Low';

            // Fallback for learningMonths
            if (!item.learningMonths) {
                item.learningMonths = item.effortLevel <= 3 ? "< 1" : item.effortLevel <= 6 ? "2-5" : "6+";
            }

            return {
                ...item,
                roi,
                jobOpenings: item.demandLevel * 1200 + (Math.floor(Math.random() * 2000))
            };
        });

        // 4. Save to DB (Update existing or create new)
        if (cached) {
            await prisma.effortDemandSnapshot.update({
                where: { id: cached.id },
                data: { data: processedData }
            });
        } else {
            await prisma.effortDemandSnapshot.create({
                data: { data: processedData }
            });
        }

        // Save to Redis
        try {
            await redis?.set(SNAPSHOT_KEY, JSON.stringify(processedData), 'EX', 86400);
        } catch (e) {
            console.warn('[ERROR] Redis Write:', e);
        }

        return NextResponse.json(processedData);
    } catch (error) {
        console.error("[ERROR] AI Effort-Demand:", error);
        return NextResponse.json({ error: "Failed to analyze data" }, { status: 500 });
    }
}