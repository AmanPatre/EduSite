import { NextResponse } from "next/server";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import redis from "@/lib/redis";
import { fetchTrustedDocs } from "@/lib/docs";
import { prisma } from "@/lib/prisma";
import { getGeminiModel, EXPERIMENTAL_MODEL } from "@/lib/gemini";
import { validateTopic } from "@/lib/topicGuard";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

function manualFallback(results: any[]) {
  return results.slice(0, 10).map((item) => {
    let category = "Tutorial";
    const url = item.url.toLowerCase();
    if (url.includes("react.dev") || url.includes("mozilla.org") || url.includes("docs")) {
      category = "Official Docs";
    } else if (url.includes("stackoverflow")) {
      category = "Forum";
    }
    return { ...item, category };
  });
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query?.trim()) return NextResponse.json({ error: "Query required" }, { status: 400 });

    // Topic Guard: Prevent non-educational content
    const validation = await validateTopic(query, 'LEARNING');
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: "Non-Educational Content",
        message: `"${query}" is not categorized as an educational or professional learning topic. Synapse is dedicated to documentation and technical study only.`
      }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    const sanitQuery = query.trim().toLowerCase();
    const cachKey = `docs:${sanitQuery}`;

    try {
      const cachedData = await redis?.get(cachKey);
      if (cachedData) return NextResponse.json(JSON.parse(cachedData));
    } catch (e) {
      console.warn("Redis Check Error:", e);
    }

    const rawResults = await fetchTrustedDocs(query);
    if (rawResults.length === 0) return NextResponse.json({ success: false, message: "No results found" });

    let finalData;

    try {
      const model = getGeminiModel(EXPERIMENTAL_MODEL);
      // Add custom safety settings if needed, but getGeminiModel returns the base instance
      // We can override settings here if getGeminiModel allowed it, but for now we'll stick to defaults or update lib/gemini.ts if needed.

      const prompt = `Student learning "${query}". Search results: ${JSON.stringify(rawResults)}. Return STRICT JSON: { "bestDocs": [{ "title": "", "url": "", "snippet": "", "source": "", "category": "", "tags": [], "difficulty": "" }] }`;

      const startTime = Date.now();
      const result = await model.generateContent(prompt);
      const latency = Date.now() - startTime;
      const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
      const processed = JSON.parse(text);

      // Log AI Interaction
      (async () => {
        try {
          const user = userEmail ? await prisma.user.findUnique({ where: { email: userEmail } }) : null;
          await prisma.aIInteraction.create({
            data: {
              userId: user?.id,
              modelUsed: EXPERIMENTAL_MODEL,
              feature: "DOCS",
              prompt: `Docs for ${query}`,
              response: processed,
              latency,
            }
          });
        } catch (logError) {
          console.warn("[ERROR] AI Log Failed:", logError);
        }
      })();

      finalData = { success: true, data: processed.bestDocs };
    } catch (aiError: any) {
      console.warn("🔥 GEMINI ERROR:", aiError.message);
      finalData = { success: true, data: manualFallback(rawResults) };
    }

    if (finalData && finalData.success) {
      try {
        await redis?.set(cachKey, JSON.stringify(finalData), "EX", 3600);
      } catch (writeError) {
        console.warn("Redis Write Failed:", writeError);
      }
    }

    return NextResponse.json(finalData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
