import { NextResponse } from "next/server";
import axios from "axios";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import redis from "@/lib/redis"; // <--- IMPORT ADDED
import {fetchTrustedDocs} from "@/lib/docs";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);



function manualFallback(results: any[]) {
  return results.slice(0, 6).map((item) => {
    let category = "Tutorial";
    const url = item.url.toLowerCase();
    if (
      url.includes("react.dev") ||
      url.includes("mozilla.org") ||
      url.includes("docs")
    ) {
      category = "Official Docs";
    } else if (url.includes("stackoverflow")) {
      category = "Forum";
    }
    return { ...item, category };
  });
}

// 4. MAIN ROUTE
export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query?.trim())
      return NextResponse.json({ error: "Query required" }, { status: 400 });

    const sanitQuery = query.trim().toLowerCase();
    const cachKey = `docs:${sanitQuery}`;

    // --- Cache Check ---
    try {
      const cachedData = await redis?.get(cachKey);
      if (cachedData) {
        console.log(`🚀 HIT: Serving Docs for "${sanitQuery}" from Redis`);
        return NextResponse.json(JSON.parse(cachedData));
      }
    } catch (e) {
      console.warn("Redis Check Error (proceeding to fetch):", e);
    }

   const rawResults = await fetchTrustedDocs(query);

    if (rawResults.length === 0) {
      return NextResponse.json({ success: false, message: "No results found" });
    }

    // DECLARE VARIABLE OUTSIDE TRY/CATCH TO AVOID SHADOWING
    let finalData;

    // Step B: Use Gemini 1.5 Flash (STABLE)
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      });

const prompt = `
Context: A student wants to learn "${query}".
Raw Search Results: ${JSON.stringify(rawResults)}

Task:
1. Select the best 5 resources.
2. Analyze the Title and Snippet.
3. WRITE A NEW SNIPPET: Clear, 1-2 sentence summary.
4. EXTRACT TAGS: Identify 2-3 key concepts.
5. ESTIMATE DIFFICULTY: "Beginner", "Intermediate", or "Advanced".

Return STRICT JSON: 
{ 
  "bestDocs": [
    { 
      "title": "...", 
      "url": "...", 
      "snippet": "...", 
      "source": "...",  // <--- ADDED BACK
      "category": "Official Docs", 
      "tags": ["Tag1", "Tag2"], 
      "difficulty": "Beginner" 
    }
  ] 
}
`;

      const result = await model.generateContent(prompt);
      const text = result.response
        .text()
        .replace(/```json/g, "")
        .replace(/```/g, "");
      const processed = JSON.parse(text);

      // ASSIGNMENT WITHOUT 'const'
      finalData = { success: true, data: processed.bestDocs };
    } catch (aiError: any) {
      console.log("🔥 GEMINI ERROR:", aiError.message);
      // Fallback
      const manualData = manualFallback(rawResults);
      // ASSIGNMENT WITHOUT 'const'
      finalData = { success: true, data: manualData };
    }

    // --- Save to Redis ---
    if (finalData && finalData.success) {
      try {
        // CORRECTED SYNTAX: "EX" is a separate argument to redis.set
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
