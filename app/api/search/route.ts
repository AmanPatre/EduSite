import { NextResponse } from "next/server";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "./../../../lib/prisma";
import redis from "@/lib/redis";
import { fetchYouTubePlaylists, fetchYouTubeVideos } from "@/lib/youtube";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { use } from "react";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    let { query } = await req.json();
    query += " full course";

    if (!query?.trim()) {
      return NextResponse.json(
        { error: "Query cannot be empty" },
        { status: 400 }
      );
    }
    const sanitizedQuery = query.trim().toLowerCase();
    (async () => {
      try {
        const session = await getServerSession(authOptions);
        if (session?.user?.email) {
          const user = await prisma.user.findUnique({
            where: { email: session.user.email },
          });
          if (user) {
            await prisma.searchHistory.create({
              data: {
                userId: user.id,
                query: query.trim(),
              },
            });
          }
        }
      } catch (error) {
        console.error("[ERROR] History Log Failed:", error);
      }

      // Log as Activity for Skill Balance
      try {
        const session = await getServerSession(authOptions);
        if (session?.user?.email) {
          const user = await prisma.user.findUnique({ where: { email: session.user.email } });
          if (user) {
            await prisma.activity.create({
              data: {
                userId: user.id,
                action: "SEARCHED_TOPIC",
                topic: query.trim(),
                metadata: { source: "learn_search" }
              }
            });
          }
        }
      } catch (error) {
        console.warn("[ERROR] Activity Log Failed:", error);
      }
    })();

    const cacheKey = `search:youtube:${sanitizedQuery}`;

    // --- Cache Check (Redis) ---
    try {
      const cacheData = await redis?.get(cacheKey);
      if (cacheData) {
        console.log(`[CACHE HIT] Search '${sanitizedQuery}' (Redis)`);
        return NextResponse.json(JSON.parse(cacheData));
      }
    } catch (error) {
      console.warn("Redis read error:", error);
    }

    console.log("[CACHE MISS] Search - Calling YouTube API...");

    const videoResults = await fetchYouTubeVideos(query);
    const playlistResults = await fetchYouTubePlaylists(query);

    // --------------------------------
    // Initialize Gemini Model
    // --------------------------------
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // AI Ranking Prompt
    const prompt = `
You are an AI that ranks YouTube learning content.

Topic: ${query}

Rank videos and playlists separately.
Analyze quality, clarity, channel authority, depth, and learning structure.
The ranking should not be only view-based. Consider how effectively the video teaches, the quality of explanations, and channel reputation.
Select the 10 best videos ans 10 best playlist.

Videos to rank (Includes ACTUAL duration):
${JSON.stringify(videoResults)}

Playlists to rank (Includes ACTUAL video counts):
${JSON.stringify(playlistResults)}

Instructions:
1. Select the best content from the lists provided.
2. **VIDEOS**: Use the provided "duration" field for "estimatedDuration". Do NOT guess.
3. **PLAYLISTS**: Use the provided "totalVideos" field. Do NOT guess.

Return JSON ONLY in this format:

{
  "topic": "${query}",
  "rankedVideos": [
    {
      "title": "Exact video title",
      "url": "YouTube URL",
      "channel": "Channel Name",
      "why": "Specific reason why this is good for learning this topic.",
      "difficulty": "Beginner/Intermediate/Advanced",
      "estimatedDuration": "Use the 'duration' field provided (e.g., '1h 2m')",
      "thumbnail": "Thumbnail URL"
    }
  ],
  "rankedPlaylists": [
    {
      "title": "Playlist Title",
      "url": "Playlist URL",
      "channel": "Channel Name",
      "why": "Why this playlist is comprehensive.",
      "difficulty": "Beginner/Intermediate/Advanced",
      "totalVideos": "Use the 'totalVideos' field provided (e.g., 15)",
      "thumbnail": "Thumbnail URL"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // Remove markdown formatting
    text = text.replace(/```json/g, "").replace(/```/g, "");

    const ranked = JSON.parse(text);

    // Return final structured output
    const finalResponse = {
      success: true,
      videos: ranked.rankedVideos,
      playlists: ranked.rankedPlaylists,
    };

    // --- Save to Redis ---
    try {
      await redis?.set(cacheKey, JSON.stringify(finalResponse), "EX", 86400); // 24 Hours
    } catch (error) {
      console.warn("[ERROR] Redis Write:", error);
    }

    return NextResponse.json(finalResponse);
  } catch (error: any) {
    console.error("[ERROR] Search API:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
