
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { trendingSkills, TrendingSkill } from '@/data/trendingData';

// Cache configuration
const CACHE_FILE = path.join(process.cwd(), 'data', 'insights-cache.json');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function POST() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        // 1. Check Cache
        if (fs.existsSync(CACHE_FILE)) {
            const cacheRaw = fs.readFileSync(CACHE_FILE, 'utf-8');
            const cache = JSON.parse(cacheRaw);
            const now = Date.now();

            if (now - cache.timestamp < CACHE_DURATION) {
                return NextResponse.json(cache.data);
            }
        }

        if (!apiKey) {
            return NextResponse.json(
                { error: "Missing GEMINI_API_KEY" },
                { status: 500 }
            );
        }

        // 2. Prepare Prompt with Skill Mapping ONLY
        // We only provide the ID mapping so Gemini knows which ID belongs to "React", "Rust", etc.
        const skillContext = trendingSkills.map((s: TrendingSkill) => `${s.name} (ID: ${s.id})`).join(', ');

        const prompt = `
            You are a Market Trends Analyst for the Software Engineering industry.
            Using your own comprehensive knowledge of the Global Tech Market in 2024-2025, generate 9 diverse and realistic market insights.
            
            CONTEXT:
            Map your insights to these specific skill IDs where relevant:
            ${skillContext}
            
            DISTRIBUTION:
            -  Trends (Current major market shifts) - create 3  impact : high, medium, low
            -  Warnings (Techniques or roles facing decline/saturation)  - create 3  impact : high, medium, low
            -  Opportunities (Niche or high-growth areas with low supply) - create 3  impact : high, medium, low
            
            FORMAT REQUIREMENTS:
            - Return ONLY a pure JSON array (no markdown code blocks).
            - Each object must have:
              - id: string (e.g. 'insight-1')
              - type: 'trend' | 'warning' | 'opportunity'
              - title: string (Punchy 3-5 word headline)
              - description: string (2 sentences max, include specific % or figures if known)
              - relatedSkills: string array (Use the IDs provided above, e.g. ['skill-5'])
              - impact: 'High' | 'Medium' | 'Low'
              - timeframe: string (e.g. 'Next 6 months', 'Q3 2025')
              
            EXAMPLE OUTPUT:
        [
            {
                "id": "insight-1",
                "type": "opportunity",
                "title": "Rust for Infrastructure",
                "description": "Rust adoption in cloud-native tooling is booming with 58% YoY growth.",
                "relatedSkills": ["skill-5"],
                "impact": "High",
                "timeframe": "Next 12 months"
            }
        ]
            `;

        // 3. Call Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Cleanup Markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const insights = JSON.parse(text);

        // 4. Save to Cache
        fs.writeFileSync(CACHE_FILE, JSON.stringify({
            timestamp: Date.now(),
            data: insights
        }, null, 2));

        return NextResponse.json(insights);

    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { error: "Failed to generate insights" },
            { status: 500 }
        );
    }
}
