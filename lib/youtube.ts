import axios from "axios";

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
export async function fetchYouTubeVideos(query: string) {
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
export async function fetchYouTubePlaylists(query: string) {
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
