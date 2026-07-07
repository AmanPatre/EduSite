import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { getGeminiModel, EXPERIMENTAL_MODEL } from "@/lib/gemini";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

import { validateTopic } from "@/lib/topicGuard";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    if (!topic) return NextResponse.json({ error: "Topic is required" }, { status: 400 });

    const validation = await validateTopic(topic, 'LEARNING');
    if (!validation.isValid) {
      return NextResponse.json({ error: "Invalid Topic", message: validation.reason }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    const normalizedTopic = topic.trim().toLowerCase();
    const CACHE_KEY = `roadmap:${normalizedTopic}`;


    try {
      const cachedRedis = await redis?.get(CACHE_KEY);
      if (cachedRedis) {
        return NextResponse.json({ roadmap: JSON.parse(cachedRedis) });
      }
    } catch (e) {
      console.warn("[ERROR] Redis Read:", e);
    }


    const dbQueryKey = `roadmap:${normalizedTopic}`;
    const cachedDb = await prisma.searchCache.findUnique({
      where: { query: dbQueryKey }
    });

    if (cachedDb) {
      const isFresh = (Date.now() - new Date(cachedDb.updatedAt).getTime()) < 30 * 24 * 60 * 60 * 1000;
      if (isFresh && cachedDb.data) {
        try {
          await redis?.set(CACHE_KEY, JSON.stringify(cachedDb.data), 'EX', 86400);
        } catch (e) { }
        return NextResponse.json({ roadmap: cachedDb.data });
      }
    }


    const model = getGeminiModel(EXPERIMENTAL_MODEL);
    const prompt = `Create a step-by-step learning roadmap for: "${topic}". Return ONLY a pure JSON array of objects: [{ step: 1, title: "", description: "", tools: [], project: "" }]`;

    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const latency = Date.now() - startTime;
    let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const roadmap = JSON.parse(text);


    (async () => {
      try {
        const user = userEmail ? await prisma.user.findUnique({ where: { email: userEmail } }) : null;
        await prisma.aIInteraction.create({
          data: {
            userId: user?.id,
            modelUsed: EXPERIMENTAL_MODEL,
            feature: "ROADMAP",
            prompt: `Roadmap for ${topic}`,
            response: roadmap,
            latency,
          }
        });
      } catch (logError) {
        console.warn("[ERROR] AI Log Failed:", logError);
      }
    })();


    await prisma.searchCache.upsert({
      where: { query: dbQueryKey },
      update: { data: roadmap },
      create: {
        query: dbQueryKey,
        data: roadmap
      }
    });


    try {
      await redis?.set(CACHE_KEY, JSON.stringify(roadmap), 'EX', 86400);
    } catch (e) {
      console.warn("[ERROR] Redis Write:", e);
    }

    return NextResponse.json({ roadmap });

  } catch (error: any) {
    console.error("[ERROR] Roadmap Gen:", error);
    return NextResponse.json({ error: error.message || "Failed to generate roadmap" }, { status: 500 });
  }
}