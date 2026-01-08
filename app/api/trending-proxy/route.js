import { NextResponse } from 'next/server';

const skills = [
    { term: "nextjs", display: "Next.js", category: "Frontend" },
    { term: "react", display: "React", category: "Frontend" },
    { term: "python", display: "Python", category: "Backend" },
    { term: "rust", display: "Rust", category: "Backend" },
    { term: "docker", display: "Docker", category: "DevOps" },
    { term: "kubernetes", display: "Kubernetes", category: "DevOps" },
    { term: "machine-learning", display: "Machine Learning", category: "AI" },
    { term: "tensorflow", display: "TensorFlow", category: "AI" }
];

// Helper delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get date ranges
function getMonthRanges(limit) {
    const ranges = [];
    for (let i = limit - 1; i >= 0; i--) {
        const start = new Date();
        start.setMonth(start.getMonth() - i);
        start.setDate(1);

        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);

        ranges.push({
            label: start.toLocaleString('default', { month: 'short' }),
            queryDate: `${start.toISOString().split('T')[0]}..${end.toISOString().split('T')[0]}`
        });
    }
    return ranges;
}

export async function GET() {
    try {
        const token = process.env.GITHUB_TOKEN;
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            ...(token ? { 'Authorization': `token ${token}` } : {})
        };

        // SAFETY: If no token, limit to 1 month (6 requests) to stay safe under 10 req/min limit
        // If token exists, do 3 months (18 requests)
        const historyLimit = token ? 3 : 1;

        // Debug Log
        console.log(`API Fetching: Token=${token ? 'YES' : 'NO'}, History=${historyLimit} months`);

        const monthRanges = getMonthRanges(historyLimit);
        const activeSkills = skills.slice(0, 6);

        const results = [];

        // Sequential processing to be nice to API
        for (const skill of activeSkills) {
            const historyResults = [];

            for (const range of monthRanges) {
                // Small delay to prevent burst rate limits
                if (historyLimit > 1) await delay(200);

                const query = `topic:${skill.term} created:${range.queryDate}`;
                const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}`;

                try {
                    const res = await fetch(url, { headers, next: { revalidate: 3600 } });

                    if (!res.ok) {
                        const txt = await res.text();
                        console.error(`❌ GitHub [${res.status}]: ${txt}`);
                        historyResults.push({ total_count: 0 });
                        continue;
                    }

                    const data = await res.json();
                    historyResults.push(data);
                } catch (err) {
                    console.error(`❌ Network Error:`, err);
                    historyResults.push({ total_count: 0 });
                }
            }

            const trend = historyResults.map(h => h.total_count || 0);

            // Metrics Logic
            const currentCount = trend[trend.length - 1] || 0;
            // If historical data exists, compare. Else 0.
            const prevCount = trend.length > 1 ? (trend[trend.length - 2] || 0) : 0;

            let growthPercent = 0;
            if (prevCount > 0) {
                growthPercent = Math.round(((currentCount - prevCount) / prevCount) * 100);
            } else if (currentCount > 0 && prevCount === 0 && trend.length > 1) {
                // Only claim 100% growth if we genuinely have previous data that is 0
                // If we only fetched 1 month, we can't calculate growth.
                growthPercent = 100;
            }

            results.push({
                id: `skill-${skill.term}`,
                name: skill.display,
                category: skill.category,
                currentLearners: currentCount * 50,
                growthRate: growthPercent,
                learningTrend: trend,
                isRealData: true
            });
        }

        return NextResponse.json(results);

    } catch (error) {
        console.error("API Critical Error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}