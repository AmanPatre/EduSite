import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { fetchYouTubeVideos } from "@/lib/youtube";
import { fetchTrustedDocs } from "@/lib/docs";

// Fallback topics for new users
const TRENDING_TOPICS = [
  "Web Development Roadmap",
  "React.js for Beginners",
  "Python Automation",
  "Artificial Intelligence Basics",
  "Data Structures and Algorithms",
  "Next.js 14 Tutorial"
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    let searchTopic = "";
    let reason = "Trending now";

    // 1. Try to get the user's last search from DB
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (user) {
        const lastSearch = await prisma.searchHistory.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        });

        if (lastSearch) {
          searchTopic = lastSearch.query;
          reason = "Because you searched for " + searchTopic;
        }
      }
    }

    // 2. If no history, pick a random trending topic
    if (!searchTopic) {
      searchTopic = TRENDING_TOPICS[Math.floor(Math.random() * TRENDING_TOPICS.length)];
      reason = "Popular choice for learners";
    }

    // 3. Check Cache (Lightweight caching for recommendations)
    const cacheKey = `rec:${searchTopic.toLowerCase().trim()}`;
    try {
      const cached = await redis?.get(cacheKey);
      if (cached) {
        console.log("Cache hit returning Cached Response")
        return NextResponse.json(JSON.parse(cached));
      }
    } catch (e) {
      console.warn("Redis error", e);
    }

    // 4. Fetch Content (Parallel)
    // We fetch fewer items (e.g., 4) just for the recommendation cards
    const [videos, docs] = await Promise.all([
      fetchYouTubeVideos(searchTopic),
      fetchTrustedDocs(searchTopic),
    ]);

    const responseData = {
      topic: searchTopic,
      reason,
      videos: videos.slice(0, 4), // Limit to top 4
      docs: docs.slice(0, 4),     // Limit to top 4
    };

    // 5. Cache for 1 hour
    try {
      await redis?.set(cacheKey, JSON.stringify(responseData), "EX", 3600);
    } catch (e) {
      console.warn("Redis write error", e);
    }

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error("Recommendation API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
