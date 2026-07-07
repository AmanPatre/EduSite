import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { fetchYouTubePlaylists, fetchYouTubeVideos } from "@/lib/youtube";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getGeminiModel, EXPERIMENTAL_MODEL } from "@/lib/gemini";
import { validateTopic } from "@/lib/topicGuard";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let { query } = await req.json();
    if (!query?.trim()) {
      return NextResponse.json(
        { error: "Query cannot be empty" },
        { status: 400 }
      );
    }


    const validation = await validateTopic(query, 'LEARNING');
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: "Non-Educational Content",
        message: `"${query}" is not categorized as an educational or professional learning topic. Synapse is dedicated to career growth and technical skill-building only.`
      }, { status: 400 });
    }

    query += " full course";

    const sanitizedQuery = query.trim().toLowerCase();

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;


    (async () => {
      try {
        if (userEmail) {
          const user = await prisma.user.findUnique({
            where: { email: userEmail },
          });
          if (user) {
            await prisma.searchHistory.create({
              data: {
                userId: user.id,
                query: query.trim(),
              },
            });
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
        console.error("[ERROR] History/Activity Log Failed:", error);
      }
    })();

    const cacheKey = `search:youtube:${sanitizedQuery}`;


    try {
      const cacheData = await redis?.get(cacheKey);
      if (cacheData) {
        console.log(`[CACHE HIT] Search '${sanitizedQuery}' (Redis)`);
        return NextResponse.json(JSON.parse(cacheData));
      }
    } catch (error) {
      console.warn("Redis read error (proceeding):", error);
    }



    const videoResults = await fetchYouTubeVideos(query);
    const playlistResults = await fetchYouTubePlaylists(query);

    if (videoResults.length === 0 && playlistResults.length === 0) {
      console.warn("[WARN] YouTube returned no results.");
      return NextResponse.json(
        { success: false, videos: [], playlists: [], error: "No results found or YouTube API quota exhausted." },
        { status: 200 }
      );
    }


    const model = getGeminiModel(EXPERIMENTAL_MODEL);


    const prompt = `
You are an AI that ranks YouTube learning content.
Topic: ${query}
Rank videos and playlists separately.
Analyze quality, clarity, channel authority, depth, and learning structure.
Select the 10 best videos and 10 best playlists.

Videos: ${JSON.stringify(videoResults)}
Playlists: ${JSON.stringify(playlistResults)}

Return JSON ONLY:
{
  "rankedVideos": [{ "title": "", "url": "", "channel": "", "why": "", "difficulty": "", "estimatedDuration": "", "thumbnail": "" }],
  "rankedPlaylists": [{ "title": "", "url": "", "channel": "", "why": "", "difficulty": "", "totalVideos": 0, "thumbnail": "" }]
}
`;

    let finalResponse;

    try {
      const startTime = Date.now();
      const result = await model.generateContent(prompt);
      const latency = Date.now() - startTime;
      let text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();

      const ranked = JSON.parse(text);


      (async () => {
        try {
          const user = userEmail ? await prisma.user.findUnique({ where: { email: userEmail } }) : null;
          await prisma.aIInteraction.create({
            data: {
              userId: user?.id,
              modelUsed: EXPERIMENTAL_MODEL,
              feature: "SEARCH",
              prompt: prompt.substring(0, 500),
              response: ranked,
              latency,
            }
          });
        } catch (logError) {
          console.warn("[ERROR] AI Log Failed:", logError);
        }
      })();

      finalResponse = {
        success: true,
        videos: ranked.rankedVideos || [],
        playlists: ranked.rankedPlaylists || [],
      };
    } catch (aiError: any) {
      console.warn("[WARN] Gemini failed. Falling back to raw results.");
      finalResponse = {
        success: true,
        aiRanked: false,
        videos: videoResults.slice(0, 10).map((v: any) => ({
          title: v.title,
          url: v.url,
          channel: v.channel,
          why: "Direct YouTube result (AI ranking unavailable).",
          difficulty: "Unknown",
          estimatedDuration: v.duration || "N/A",
          thumbnail: v.thumbnail,
        })),
        playlists: playlistResults.slice(0, 10).map((p: any) => ({
          title: p.title,
          url: p.url,
          channel: p.channel,
          why: "Direct YouTube result (AI ranking unavailable).",
          difficulty: "Unknown",
          totalVideos: p.totalVideos || 0,
          thumbnail: p.thumbnail,
        })),
      };
    }


    try {
      if (redis && finalResponse.success) {
        const ttl = finalResponse.aiRanked === false ? 300 : 86400;
        await redis.set(cacheKey, JSON.stringify(finalResponse), "EX", ttl);
      }
    } catch (error) {
      console.warn("[ERROR] Redis Write:", error);
    }

    return NextResponse.json(finalResponse);
  } catch (error: any) {
    console.error("[ERROR] Search API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
