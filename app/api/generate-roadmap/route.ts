import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  const CACHE_FILE = path.join(process.cwd(), 'data', 'roadmap-cache.json');
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  try {
    const { topic } = await req.json();

    // 1. Sanitize the Key (so "React" and "react" are the same)
    const cacheKey = topic.trim().toLowerCase();

    let cache: Record<string, any> = {};

    // 2. Read existing cache if it exists
    if (fs.existsSync(CACHE_FILE)) {
      try {
        const fileContent = fs.readFileSync(CACHE_FILE, 'utf-8');
        cache = JSON.parse(fileContent);

        // Check if THIS SPECIFIC TOPIC is cached and fresh
        if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_DURATION)) {
          console.log(`Serving '${topic}' from cache ⚡`);
          return NextResponse.json({ roadmap: cache[cacheKey].data });
        }
      } catch (e) {
        // If file is corrupt, ignore and overwrite later
        console.warn("Cache file corrupted, starting fresh.");
      }
    }

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

    // 3. Update the specific topic in the cache (don't delete other topics)
    cache[cacheKey] = {
      timestamp: Date.now(),
      data: roadmap
    };

    // 4. Write the WHOLE dictionary back to disk
    // Ensure "data" folder exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));

    return NextResponse.json({ roadmap });

  } catch (error) {
    console.error("Roadmap Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
  }
}