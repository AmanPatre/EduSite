import { NextResponse } from 'next/server';
import { skillDetectionRules } from '@/lib/skillDetectionRules';

export const dynamic = 'force-dynamic';

const skills = Object.entries(skillDetectionRules).map(([key, def]) => ({
    term: key,
    display: def.name,
    category: def.category,
    githubQuery: def.github.query
}));

// Helper to get date ranges (0 = Current Month, 5 = 5 months ago)
function getMonthRanges() {
    const ranges = [];
    // Use full months only to ensure accurate growth comparison
    // i=6 (6 months ago) to i=1 (last full month)
    // We skip i=0 (current month) because it's incomplete and skews growth negative
    for (let i = 6; i >= 1; i--) {
        const start = new Date();
        start.setMonth(start.getMonth() - i);
        start.setDate(1);

        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);

        ranges.push({
            // Format: YYYY-MM-DD
            queryDate: `${start.toISOString().split('T')[0]}..${end.toISOString().split('T')[0]}`
        });
    }
    return ranges;
}

export async function GET() {
    try {
        const token = process.env.GITHUB_TOKEN;
        if (!token) throw new Error("Missing GITHUB_TOKEN");

        const endpoint = "https://api.github.com/graphql";
        const monthRanges = getMonthRanges();
        const activeSkills = skills.slice(0, 50); // Fetch ALL skills (Graph QL can handle it!)      // 1. DYNAMIC QUERY BUILDING
        // We construct a massive GraphQL query with "Aliases"
        // Format: skillName_monthIndex: search(...)
        let queryParts = [];

        activeSkills.forEach((skill, skillIndex) => {
            monthRanges.forEach((range, monthIndex) => {
                // Alias must be alphanumeric, so we perform simple replacement
                const alias = `skill_${skillIndex}_month_${monthIndex}`;
                // Use the exact Github Query syntax defined in the Rules rather than hardcoded "topic:"
                const query = `${skill.githubQuery} created:${range.queryDate}`;

                // The GraphQL Search Node
                queryParts.push(`
                ${alias}: search(query: "${query}", type: REPOSITORY) {
                    repositoryCount
                }
            `);
            });
        });

        // Wrap it in the main query block
        const graphqlQuery = `
        query {
            ${queryParts.join('\n')}
        }
    `;

        // 2. FETCH (One Single Request!)
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: graphqlQuery }),
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!res.ok) {
            const txt = await res.text();
            console.error("GraphQL Error:", txt);
            return NextResponse.json({ error: "GitHub API Error" }, { status: 500 });
        }

        const json = await res.json();

        // Check for GraphQL specific errors
        if (json.errors) {
            console.error("GraphQL Query Error:", json.errors);
            return NextResponse.json({ error: "Query Failed" }, { status: 500 });
        }

        // 3. PARSE RESULTS
        // The data comes back flat: { skill_0_month_0: { repositoryCount: 120 }, ... }
        // We need to group it back into our shape.

        const structuredResults = activeSkills.map((skill, skillIndex) => {
            const trend = [];

            monthRanges.forEach((_, monthIndex) => {
                const alias = `skill_${skillIndex}_month_${monthIndex}`;
                const count = json.data[alias]?.repositoryCount || 0;
                trend.push(count);
            });

            // Metrics Calculation
            const currentCount = trend[trend.length - 1];
            const prevCount = trend[trend.length - 2] || 0;
            let growthPercent = 0;

            if (prevCount > 0) {
                growthPercent = Math.round(((currentCount - prevCount) / prevCount) * 100);
            } else if (currentCount > 0) {
                growthPercent = 100;
            }

            return {
                id: `skill-${skill.term}`,
                name: skill.display,
                category: skill.category,
                currentLearners: currentCount * 50, // Scale for UI
                growthRate: growthPercent,
                learningTrend: trend,
                isRealData: true
            };
        });

        return NextResponse.json(structuredResults);

    } catch (error) {
        console.error("Critical API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}