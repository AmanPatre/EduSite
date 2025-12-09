// app/api/docs/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ---------- config ----------
const BING_ENDPOINT = "https://api.bing.microsoft.com/v7.0/search";
const MAX_BING_RESULTS = 20; // number of web results to fetch from Bing
const MAX_CANDIDATES = 30; // cap candidates sent to Gemini
const MAX_SNIPPET_LEN = 800; // shorten snippet before sending to Gemini
const SCRAPE_TIMEOUT = 8000;

// domains we prefer (not strict): prioritized learning resources
const PREFERRED_DOMAINS = [
  "react.dev",
  "developer.mozilla.org",
  "freecodecamp.org",
  "w3schools.com",
  "geeksforgeeks.org",
  "dev.to",
  "medium.com",
  "cplusplus.com",
  "en.cppreference.com",
  "programiz.com",
  "tutorialspoint.com",
  "mongodb.com",
  "docs.python.org",
];

function hostFromUrl(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// ---------- utilities ----------
async function fetchHtml(url: string, timeout = SCRAPE_TIMEOUT) {
  try {
    const res = await axios.get(url, {
      timeout,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LearnifyBot/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      maxRedirects: 5,
    });
    return res.data as string;
  } catch (err) {
    console.warn("fetchHtml failed:", url, (err as any)?.message ?? err);
    return null;
  }
}

function extractSnippetFromHtml(
  html: string,
  selectors: string[] = ["meta[name='description']", "article p", "p"]
) {
  try {
    const $ = cheerio.load(html);
    const meta =
      $("meta[name='description']").attr("content") ||
      $("meta[property='og:description']").attr("content");
    if (meta && meta.trim().length > 20) return meta.trim();
    // first meaningful paragraph
    for (const sel of selectors) {
      const el = $(sel).first();
      if (el && el.text() && el.text().trim().length > 40) {
        return el.text().trim().slice(0, 1000);
      }
    }
    const title = $("title").text();
    return (title || "").trim().slice(0, 500);
  } catch {
    return "";
  }
}

function uniqueByUrl(items: any[]) {
  const seen = new Set<string>();
  const out: any[] = [];
  for (const it of items) {
    if (!it?.url) continue;
    const u = it.url.split("#")[0].replace(/\/$/, "");
    if (!seen.has(u)) {
      seen.add(u);
      out.push(it);
    }
  }
  return out;
}

// simple relevance check for pre-filtering (soft)
function likelyRelevant(
  title = "",
  snippet = "",
  normalizedTopic = "",
  keywords: string[] = []
) {
  const t = (title || "").toLowerCase();
  const s = (snippet || "").toLowerCase();
  const q = (normalizedTopic || "").toLowerCase();
  if (!t && !s) return false;
  if (q && (t.includes(q) || s.includes(q))) return true;
  for (const k of keywords) {
    const kk = (k || "").toLowerCase();
    if (!kk) continue;
    if (t.includes(kk) || s.includes(kk)) return true;
  }
  // weak domain-based allowance (if domain contains root token)
  return false;
}

// ---------- Bing search ----------
async function bingWebSearch(query: string, count = MAX_BING_RESULTS) {
  const key = process.env.BING_API_KEY;
  if (!key) throw new Error("BING_API_KEY not set in environment");
  try {
    const resp = await axios.get(BING_ENDPOINT, {
      params: {
        q: query,
        count,
        textDecorations: true,
        textFormat: "Raw",
      },
      headers: {
        "Ocp-Apim-Subscription-Key": key,
      },
      timeout: 8000,
    });
    // resp.data.webPages.value is the usual structure
    const webPages = resp.data?.webPages?.value || [];
    return webPages.map((w: any) => ({
      title: w.name || "",
      url: w.url || "",
      snippet: (w.snippet || w.summary || "").trim(),
      source: hostFromUrl(w.url) || "web",
      raw: w,
    }));
  } catch (err) {
    console.warn("Bing search failed:", (err as any)?.message ?? err);
    return [];
  }
}

// ---------- optional: official docs map (quick wins) ----------
const officialDocsMap: Record<string, string> = {
  react: "https://react.dev/learn",
  "react hooks": "https://react.dev/reference/react/useState",
  nextjs: "https://nextjs.org/docs",
  node: "https://nodejs.org/en/docs",
  python: "https://docs.python.org/3/",
  cpp: "https://en.cppreference.com/w/",
  "c++": "https://en.cppreference.com/w/",
  mongodb: "https://www.mongodb.com/docs/",
  tailwind: "https://tailwindcss.com/docs",
};

// ---------- AI helper: extract keywords from query (small fallback) ----------
function simpleKeywordsFromQuery(q: string, limit = 4) {
  const tokens = q
    .toLowerCase()
    .replace(/[^\w\s\+\-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const uniq = Array.from(new Set(tokens));
  return uniq.slice(0, limit);
}

// ---------- MAIN API HANDLER ----------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = (body?.query || "").toString().trim();
    if (!query)
      return NextResponse.json({ error: "Query is required" }, { status: 400 });

    // Normalize topic and produce fallback keywords:
    // We'll use a cheap local normalization + a quick AI call could be added later.
    const normalizedTopic = query; // could call AI to normalize; keep simple for now
    const keywords = simpleKeywordsFromQuery(query, 4);

    // 1) Include official docs if obvious
    const candidates: any[] = [];
    const keyLower = normalizedTopic.toLowerCase();
    for (const k of Object.keys(officialDocsMap)) {
      if (keyLower.includes(k)) {
        const url = officialDocsMap[k];
        const html = await fetchHtml(url);
        candidates.push({
          source: "Official",
          site: hostFromUrl(url),
          title: extractSnippetFromHtml(html || "") || `${k} — Official Docs`,
          url,
          snippet: extractSnippetFromHtml(html || ""),
        });
      }
    }

    // 2) Use Bing to get search results (broad web search)
    const bingResults = await bingWebSearch(query, MAX_BING_RESULTS);

    // 3) Prioritize preferred domains (reorder) — but keep all for now
    // put preferred results first
    bingResults.sort((a: any, b: any) => {
      const aPref = PREFERRED_DOMAINS.includes(a.source) ? 0 : 1;
      const bPref = PREFERRED_DOMAINS.includes(b.source) ? 0 : 1;
      if (aPref !== bPref) return aPref - bPref;
      // if both same, prefer having snippet
      const aHas = a.snippet ? 0 : 1;
      const bHas = b.snippet ? 0 : 1;
      return aHas - bHas;
    });

    // 4) Turn Bing results into candidate items (cap)
    for (const r of bingResults.slice(0, MAX_BING_RESULTS)) {
      candidates.push({
        source: r.source || hostFromUrl(r.url) || "web",
        site: hostFromUrl(r.url),
        title: r.title || r.url,
        url: r.url,
        snippet: r.snippet || "",
      });
    }

    // 5) dedupe & cap
    let unique = uniqueByUrl(candidates).slice(0, MAX_CANDIDATES);

    // 6) Enrich: ensure snippet present (fetch page and extract)
    const enriched = await Promise.all(
      unique.map(async (it) => {
        if (!it.snippet || it.snippet.length < 40) {
          const html = await fetchHtml(it.url);
          it.snippet = html ? extractSnippetFromHtml(html) : it.snippet || "";
        }
        return {
          source: it.source || it.site || "web",
          site: it.site || (it.url ? hostFromUrl(it.url) : "unknown"),
          title: it.title || (it.url ? it.url.split("/").pop() : "Untitled"),
          url: it.url,
          snippet: it.snippet || "",
          fetchedAt: new Date().toISOString(),
        };
      })
    );

    // 7) Soft-filter: keep items that are likely relevant (but be permissive; allow preferred domains)
    const softFiltered = enriched.filter((c) => {
      // always keep preferred domains
      if (PREFERRED_DOMAINS.includes(c.site)) return true;
      // if title/snippet contains any keyword or the normalized topic
      return likelyRelevant(c.title, c.snippet, normalizedTopic, keywords);
    });

    const finalCandidates = softFiltered.length >= 6 ? softFiltered : enriched;
    if (finalCandidates.length === 0) {
      return NextResponse.json({ topic: normalizedTopic, docs: [] });
    }

    // 8) Prepare payload for AI ranking (limit to 20 to keep prompt small)
    const payloadForAI = finalCandidates
      .map((e) => ({
        source: e.source,
        site: e.site,
        title: e.title,
        url: e.url,
        snippet: e.snippet
          ? e.snippet.length > MAX_SNIPPET_LEN
            ? e.snippet.slice(0, MAX_SNIPPET_LEN) + "..."
            : e.snippet
          : "",
      }))
      .slice(0, 20);

    // 9) Rank with Gemini (same structure as earlier)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
You are an expert tutoring assistant who ranks documentation/tutorial resources for learners.

Topic: "${normalizedTopic}"
Keywords: ${JSON.stringify(keywords)}

Return EXACT valid JSON only with this structure:
{
  "topic": "",
  "rankedDocs": [
    {
      "source": "",
      "site": "",
      "title": "",
      "url": "",
      "shortSnippet": "",
      "score": 0,
      "reason": "",
      "level": "",
      "confidence": 0
    }
  ]
}

Rules:
- Prefer authoritative official docs when relevant.
- Prefer readable tutorials and pages with examples.
- Score 0-100, confidence 0-1.
- If level can't be determined, use "intermediate".
- Return up to 7 best docs sorted best -> worst.
- Do NOT output any commentary, only JSON.

Candidates:
${JSON.stringify(payloadForAI, null, 2)}
`;

    const genResp = await model.generateContent(prompt);
    let text = genResp.response.text();
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let rankedJson: any;
    try {
      rankedJson = JSON.parse(text);
    } catch (err) {
      console.warn(
        "Failed to parse AI JSON, using fallback ordering:",
        (err as any)?.message ?? err
      );
      const fallback = payloadForAI.slice(0, 7).map((e: any, idx: number) => ({
        source: e.source,
        site: e.site,
        title: e.title,
        url: e.url,
        shortSnippet: e.snippet ? e.snippet.slice(0, 200) : "",
        score: Math.round(100 - idx * 5),
        reason: "Fallback ranking",
        level: "intermediate",
        confidence: 0.5,
      }));
      return NextResponse.json({ topic: normalizedTopic, docs: fallback });
    }

    const docs = (rankedJson.rankedDocs || []).slice(0, 7);
    return NextResponse.json({ topic: normalizedTopic, keywords, docs });
  } catch (error: any) {
    console.error("Docs API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal error" },
      { status: 500 }
    );
  }
}
