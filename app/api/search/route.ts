import { NextResponse } from "next/server";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "./../../../lib/prisma";
import redis from "@/lib/redis";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ----------------------------------------------------
// HELPER: Parse ISO 8601 Duration (e.g., PT1H2M10S -> 1h 2m 10s)
// ----------------------------------------------------
function parseISODuration(isoDuration: string): string {
  if (!isoDuration) return "Unknown";
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return "Unknown";

  const hours = (match[1] || "").replace("H", "h");
  const minutes = (match[2] || "").replace("M", "m");
  const seconds = (match[3] || "").replace("S", "s");

  return [hours, minutes, seconds].filter(Boolean).join(" ") || "0s";
}

// ----------------------------------------------------
// FETCH ONE-SHOT YOUTUBE VIDEOS (WITH ACTUAL DURATION)
// ----------------------------------------------------
async function fetchYouTubeVideos(query: string) {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;

    // STEP 1: Search for videos to get IDs
    const searchResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: query,
          type: "video",
          maxResults: 10,
          key: API_KEY,
        },
      }
    );

    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      return [];
    }

    // Extract Video IDs for the second call
    const videoIds = searchResponse.data.items
      .map((item: any) => item.id.videoId)
      .join(",");

    // STEP 2: Fetch Video Details to get 'contentDetails' (Duration)
    const detailsResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "contentDetails",
          id: videoIds,
          key: API_KEY,
        },
      }
    );

    // Create a map of ID -> Formatted Duration
    const durationMap: Record<string, string> = {};
    detailsResponse.data.items.forEach((item: any) => {
      durationMap[item.id] = parseISODuration(item.contentDetails.duration);
    });

    // STEP 3: Merge Snippet Data with Duration
    return searchResponse.data.items.map((item: any) => ({
      type: "video",
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      channel: item.snippet.channelTitle,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url,
      duration: durationMap[item.id.videoId] || "Unknown", // <--- Real Duration
    }));
  } catch (err) {
    console.error("YouTube Video Fetch Error:", err);
    return [];
  }
}

// ----------------------------------------------------
// FETCH YOUTUBE PLAYLISTS (WITH ACTUAL VIDEO COUNT)
// ----------------------------------------------------
async function fetchYouTubePlaylists(query: string) {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;

    // STEP 1: Search for playlists (Get IDs)
    const searchResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: query,
          type: "playlist",
          maxResults: 10,
          key: API_KEY,
        },
      }
    );

    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      return [];
    }

    // Extract Playlist IDs
    const playlistIds = searchResponse.data.items
      .map((item: any) => item.id.playlistId)
      .join(",");

    // STEP 2: Fetch Playlist Details (Get Item Count)
    const detailsResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/playlists",
      {
        params: {
          part: "contentDetails", // <--- This contains itemCount
          id: playlistIds,
          key: API_KEY,
        },
      }
    );

    // Create a map of ID -> Item Count
    const countMap: Record<string, number> = {};
    detailsResponse.data.items.forEach((item: any) => {
      countMap[item.id] = item.contentDetails.itemCount;
    });

    // STEP 3: Merge Data
    return searchResponse.data.items.map((item: any) => ({
      type: "playlist",
      title: item.snippet.title,
      url: `https://www.youtube.com/playlist?list=${item.id.playlistId}`,
      channel: item.snippet.channelTitle,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url,
      totalVideos: countMap[item.id.playlistId] || 0, // <--- Real Count
    }));
  } catch (err) {
    console.error("YouTube Playlist Fetch Error:", err);
    return [];
  }
}

// ----------------------------------------------------
// MAIN API HANDLER
// ----------------------------------------------------
export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query?.trim()) {
      return NextResponse.json(
        { error: "Query cannot be empty" },
        { status: 400 }
      );
    }

    const sanitizedQuery = query.trim().toLowerCase();
    const cacheKey = `search:youtube:${sanitizedQuery}`;

    // --- Cache Check (Redis) ---
    try {
      const cacheData = await redis?.get(cacheKey);
      if (cacheData) {
        console.log(`Cache HIT for "${sanitizedQuery}" from REDIS`);
        return NextResponse.json(JSON.parse(cacheData));
      }
    } catch (error) {
      console.warn("Redis read error:", error);
    }

    console.log("Cache MISS - calling YouTube API...");

    // --------------------------------
    // Fetch both videos and playlists (with real stats)
    // --------------------------------
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
      await redis?.set(cacheKey, JSON.stringify(finalResponse), "EX", 3600);
    } catch (error) {
      console.warn("Redis write error", error);
    }

    return NextResponse.json(finalResponse);
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
