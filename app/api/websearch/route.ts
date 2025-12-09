import { NextResponse } from "next/server";
import { googleSearch } from "@/lib/googleSearch";
import { duckSearch } from "@/lib/duckSearch";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query || !query.trim()) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    const q = query.trim();

    // 1️⃣ Try Google Search first
    let results = await googleSearch(q);

    // 2️⃣ If Google returns nothing → use DuckDuckGo
    if (results.length === 0) {
      console.log("Google returned no results → using DuckDuckGo");
      results = await duckSearch(q);
    }

    // return response
    return NextResponse.json({
      query: q,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Search API Error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
