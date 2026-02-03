import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    if (!topic) return NextResponse.json({ error: "Topic is required" }, { status: 400 });

    const normalizedTopic = topic.trim().toLowerCase();
    const CACHE_KEY = `roadmap:${normalizedTopic}`;

    // 1. REDIS CACHE CHECK (Speed Layer)
    try {
      const cachedRedis = await redis?.get(CACHE_KEY);
      if (cachedRedis) {
        console.log(`[CACHE HIT] Roadmap '${topic}' (Redis)`);
        return NextResponse.json({ roadmap: JSON.parse(cachedRedis) });
      }
    } catch (e) {
      console.warn("[ERROR] Redis Read:", e);
    }

    // 2. MONGODB CACHE CHECK (Persistence Layer)
    // We reuse the 'SearchCache' model but prefix the query to avoid collisions
    const dbQueryKey = `roadmap:${normalizedTopic}`;
    const cachedDb = await prisma.searchCache.findUnique({
      where: { query: dbQueryKey }
    });

    if (cachedDb) {
      // Check freshness (e.g., 30 days for roadmaps as they change slowly)
      const isFresh = (Date.now() - new Date(cachedDb.updatedAt).getTime()) < 30 * 24 * 60 * 60 * 1000;
      if (isFresh && cachedDb.data) {
        console.log(`[CACHE HIT] Roadmap '${topic}' (DB)`);

        // Populate Redis for next time
        try {
          await redis?.set(CACHE_KEY, JSON.stringify(cachedDb.data), 'EX', 24 * 60 * 60); // 24 hours in RAM
        } catch (e) { }

        return NextResponse.json({ roadmap: cachedDb.data });
      }
    }

    // 3. GENERATE NEW CONTENT (AI)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
            Create a detailed, step-by-step learning roadmap for: "${topic}".
            
            REQUIREMENTS:
            - Return ONLY a pure JSON array.
            - The JSON must be valid and parsable.
            
            JSON STRUCTURE:
            Array of objects: [{ step: 1, title: "", description: "", tools: [], project: "" }]
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const roadmap = JSON.parse(text);

    // 4. SAVE TO MONGODB (Persistence)
    await prisma.searchCache.upsert({
      where: { query: dbQueryKey },
      update: { data: roadmap },
      create: {
        query: dbQueryKey,
        data: roadmap
      }
    });

    // 5. SAVE TO REDIS (Speed)
    try {
      await redis?.set(CACHE_KEY, JSON.stringify(roadmap), 'EX', 24 * 60 * 60); // 1 Day
    } catch (e) {
      console.warn("[ERROR] Redis Write:", e);
    }

    return NextResponse.json({ roadmap });

  } catch (error) {
    console.error("[ERROR] Roadmap Gen:", error);
    return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
  }
}