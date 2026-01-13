import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const skills = [
    // Frontend (Modern)
    { term: "react", display: "React.js", category: "Frontend" },
    { term: "nextjs", display: "Next.js", category: "Frontend" },
    { term: "vite", display: "Vite", category: "Frontend" },
    { term: "sass", display: "Sass", category: "Frontend" },
    { term: "shadcn-ui", display: "shadcn/ui", category: "Frontend" },
    { term: "framer-motion", display: "Framer Motion", category: "Frontend" },
    { term: "web-accessibility", display: "Web Accessibility (a11y)", category: "Frontend" },

    // Backend
    { term: "nestjs", display: "NestJS", category: "Backend" },
    { term: "graphql", display: "GraphQL", category: "Backend" },
    { term: "prisma", display: "Prisma ORM", category: "Backend" },
    { term: "redis", display: "Redis", category: "Backend" },
    { term: "socketio", display: "Socket.io", category: "Backend" },
    { term: "auth", display: "Authentication & Authorization", category: "Backend" },
    { term: "microservices", display: "Microservices", category: "Backend" },

    // DevOps / Cloud
    { term: "docker", display: "Docker", category: "DevOps" },
    { term: "kubernetes", display: "Kubernetes", category: "DevOps" },
    { term: "vercel", display: "Vercel", category: "DevOps" },
    { term: "firebase", display: "Firebase", category: "DevOps" },
    { term: "cloudflare", display: "Cloudflare", category: "DevOps" },
    { term: "ci-cd", display: "CI/CD Pipelines", category: "DevOps" },
    { term: "terraform", display: "Terraform", category: "DevOps" },

    // AI / Data
    { term: "machine-learning", display: "Machine Learning", category: "AI/ML" },
    { term: "llms", display: "Large Language Models (LLMs)", category: "AI/ML" },
    { term: "generative-ai", display: "Generative AI", category: "AI/ML" },
    { term: "langchain", display: "LangChain", category: "AI/ML" },
    { term: "vector-database", display: "Vector Databases", category: "AI/ML" },
    { term: "data-analysis", display: "Data Analysis", category: "AI/ML" },
    { term: "computer-vision", display: "Computer Vision", category: "AI/ML" },

    // Tools / Productivity
    { term: "postman", display: "Postman", category: "Tools" },
    { term: "swagger", display: "Swagger / OpenAPI", category: "Tools" },
    { term: "jest", display: "Jest", category: "Tools" },
    { term: "cypress", display: "Cypress", category: "Tools" },
    { term: "eslint", display: "ESLint", category: "Tools" },
    { term: "prettier", display: "Prettier", category: "Tools" },
    { term: "jira", display: "Jira", category: "Tools" },

    { term: "tensorflow", display: "TensorFlow", category: "AI" },
    { term: "scikit-learn", display: "Scikit-learn", category: "AI" },
    { term: "nlp", display: "Natural Language Processing (NLP)", category: "AI" },
    { term: "huggingface", display: "Hugging Face", category: "AI" },
    { term: "mlops", display: "MLOps", category: "AI" },

    // Mobile Development
    { term: "react-native", display: "React Native", category: "Mobile" },
    { term: "flutter", display: "Flutter", category: "Mobile" },
    { term: "android", display: "Android Development", category: "Mobile" },
    { term: "ios", display: "iOS Development", category: "Mobile" },
    { term: "expo", display: "Expo", category: "Mobile" },

    // Design / UI-UX
    { term: "figma", display: "Figma", category: "Design" },
    { term: "ui-ux", display: "UI/UX Design", category: "Design" },
    { term: "design-systems", display: "Design Systems", category: "Design" },
    { term: "wireframing", display: "Wireframing", category: "Design" },
    { term: "prototyping", display: "Prototyping", category: "Design" }

];

// Helper to get date ranges (0 = Current Month, 5 = 5 months ago)
function getMonthRanges() {
    const ranges = [];
    for (let i = 5; i >= 0; i--) {
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
                const query = `topic:${skill.term} created:${range.queryDate}`;

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