import axios from "axios";
import * as cheerio from "cheerio";

export async function duckSearch(query: string) {
  try {
    const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const $ = cheerio.load(res.data);
    const results: any[] = [];

    $(".result").each((i, el) => {
      if (i >= 10) return;
      const title = $(el).find(".result__title").text().trim();
      const url = $(el).find(".result__a").attr("href") || "";
      const snippet = $(el).find(".result__snippet").text().trim();

      results.push({
        title,
        url,
        snippet,
        source: "DuckDuckGo",
      });
    });

    return results;
  } catch (err) {
    console.error("DuckDuckGo Error:", err);
    return [];
  }
}
    