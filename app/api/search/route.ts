import { NextResponse } from "next/server";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ----------------------------------------------------
// FETCH ONE-SHOT YOUTUBE VIDEOS
// ----------------------------------------------------
async function fetchYouTubeVideos(query: string) {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;

    const response = await axios.get(
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

    return response.data.items.map((item: any) => ({
      type: "video",
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      channel: item.snippet.channelTitle,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url,
    }));
  } catch (err) {
    console.error("YouTube Video Fetch Error:", err);
    return [];
  }
}

// ----------------------------------------------------
// FETCH YOUTUBE PLAYLISTS
// ----------------------------------------------------
async function fetchYouTubePlaylists(query: string) {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;

    const response = await axios.get(
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

    return response.data.items.map((item: any) => ({
      type: "playlist",
      title: item.snippet.title,
      url: `https://www.youtube.com/playlist?list=${item.id.playlistId}`,
      channel: item.snippet.channelTitle,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url,
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

    // --------------------------------
    // Fetch both videos + playlists
    // --------------------------------
    const videoResults = await fetchYouTubeVideos(query);
    const playlistResults = await fetchYouTubePlaylists(query);

    // --------------------------------
    // Initialize Gemini Model
    // --------------------------------
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    // AI Ranking Prompt
    const prompt = `
You are an AI that ranks YouTube learning content.

Topic: ${query}

Rank videos and playlists separately.
Analyze quality, clarity, channel authority, depth, and learning structure.The ranking should not be only view based, how best the yt video provides the info , how best it teaches , how good comments it has got and how good are the reponses that it has got.

Videos to rank:
${JSON.stringify(videoResults)}

Playlists to rank:
${JSON.stringify(playlistResults)}

Return JSON ONLY in this format:

{
  "topic": "",
  "rankedVideos": [
    {
      "title": "",
      "url": "",
      "channel": "",
      "why": "",
      "difficulty": "",
      "estimatedDuration": "",
      "thumbnail": ""
    }
  ],
  "rankedPlaylists": [
    {
      "title": "",
      "url": "",
      "channel": "",
      "why": "",
      "difficulty": "",
      "totalVideos": "",
      "thumbnail": ""
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
    return NextResponse.json({
      success: true,
      videos: ranked.rankedVideos,
      playlists: ranked.rankedPlaylists,
    });

  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
