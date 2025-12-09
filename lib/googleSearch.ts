import axios from "axios";

export async function googleSearch(query: string) {
  const key = process.env.GOOGLE_CSE_KEY!;
  const cx = process.env.GOOGLE_CSE_CX!;

  const url = "https://www.googleapis.com/customsearch/v1";

  try {
    const res = await axios.get(url, {
      params: {
        key,
        cx,
        q: query,
        num: 10,
      },
    });

    return (res.data.items || []).map((item: any) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet || "",
      source: "Google",
    }));
  } catch (err) {
    console.error("Google Search Error:", err);
    return [];
  }
}
