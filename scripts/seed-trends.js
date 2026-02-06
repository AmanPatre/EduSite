// scripts/seed-trends.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { google } = require('googleapis');
const axios = require('axios');

const prisma = new PrismaClient();

// === CONFIGURATION ===
// Using "require" for local script compatibility
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Hardcoded Top 40 Skills (The ones we want to track)
const skillsToTrack = {
    // Frontend
    "React": { name: "React", category: "Frontend", github: "react language:TypeScript", youtube: "react tutorial" },
    "Next.js": { name: "Next.js", category: "Frontend", github: "nextjs language:TypeScript", youtube: "nextjs tutorial" },
    "Vue.js": { name: "Vue.js", category: "Frontend", github: "vue language:TypeScript", youtube: "vuejs tutorial" },
    "Angular": { name: "Angular", category: "Frontend", github: "angular language:TypeScript", youtube: "angular tutorial" },
    "TypeScript": { name: "TypeScript", category: "Frontend", github: "language:TypeScript", youtube: "typescript tutorial" },
    "Tailwind CSS": { name: "Tailwind CSS", category: "Frontend", github: "tailwindcss", youtube: "tailwind css tutorial" },
    "Redux": { name: "Redux", category: "Frontend", github: "redux language:TypeScript", youtube: "redux toolkit tutorial" },
    "Three.js": { name: "Three.js", category: "Frontend", github: "threejs", youtube: "threejs tutorial" },

    // Backend
    "Node.js": { name: "Node.js", category: "Backend", github: "nodejs language:JavaScript", youtube: "nodejs tutorial" },
    "Python": { name: "Python", category: "Backend", github: "language:Python", youtube: "python programming" },
    "Go": { name: "Go", category: "Backend", github: "language:Go", youtube: "golang tutorial" },
    "Java": { name: "Java", category: "Backend", github: "language:Java", youtube: "java spring boot tutorial" },
    "C#": { name: "C#", category: "Backend", github: "language:C#", youtube: "c# generic host .net" },
    "Rust": { name: "Rust", category: "Backend", github: "language:Rust", youtube: "rust lang tutorial" },
    "PHP": { name: "PHP", category: "Backend", github: "language:PHP", youtube: "php laravel tutorial" },
    "NestJS": { name: "NestJS", category: "Backend", github: "nestjs", youtube: "nestjs tutorial" },

    // DevOps
    "Docker": { name: "Docker", category: "DevOps", github: "docker", youtube: "docker tutorial" },
    "Kubernetes": { name: "Kubernetes", category: "DevOps", github: "kubernetes", youtube: "kubernetes tutorial" },
    "AWS": { name: "AWS", category: "DevOps", github: "aws", youtube: "aws certified cloud practitioner" },
    "Azure": { name: "Azure", category: "DevOps", github: "azure", youtube: "microsoft azure tutorial" },
    "Terraform": { name: "Terraform", category: "DevOps", github: "terraform", youtube: "terraform tutorial" },
    "Linux": { name: "Linux", category: "DevOps", github: "linux", youtube: "linux for developers" },

    // AI/ML
    "Machine Learning": { name: "Machine Learning", category: "AI/ML", github: "machine-learning", youtube: "machine learning course" },
    "Generative AI": { name: "Generative AI", category: "AI/ML", github: "generative-ai", youtube: "generative ai llm" },
    "TensorFlow": { name: "TensorFlow", category: "AI/ML", github: "tensorflow", youtube: "tensorflow tutorial" },
    "PyTorch": { name: "PyTorch", category: "AI/ML", github: "pytorch", youtube: "pytorch tutorial" },
    "LangChain": { name: "LangChain", category: "AI/ML", github: "langchain", youtube: "langchain tutorial" },
    "OpenCV": { name: "OpenCV", category: "AI/ML", github: "opencv", youtube: "opencv python" },
    "Data Science": { name: "Data Science", category: "AI/ML", github: "data-science", youtube: "data science roadmap" },

    // Mobile
    "React Native": { name: "React Native", category: "Mobile", github: "react-native", youtube: "react native tutorial" },
    "Flutter": { name: "Flutter", category: "Mobile", github: "flutter", youtube: "flutter tutorial" },
    "Swift": { name: "Swift", category: "Mobile", github: "language:Swift", youtube: "swift ios tutorial" },
    "Kotlin": { name: "Kotlin", category: "Mobile", github: "language:Kotlin", youtube: "kotlin android tutorial" },

    // Design
    "Figma": { name: "Figma", category: "Design", github: "figma", youtube: "figma tutorial" },
    "UI/UX": { name: "UI/UX", category: "Design", github: "ui-ux", youtube: "ui ux design course" },
    "Blender": { name: "Blender", category: "Design", github: "topic:blender", youtube: "blender 3d tutorial" }
};

// Helper to get date 30 days ago
const getThirtyDaysAgo = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
};

async function fetchGitHubData(query) {
    try {
        const thirtyDaysAgo = getThirtyDaysAgo().toISOString().split('T')[0];
        // Add "created:>=DATE" to find NEW repos from last 30 days
        const timeQuery = `${query} created:>=${thirtyDaysAgo}`;

        const response = await axios.get(`https://api.github.com/search/repositories`, {
            params: { q: timeQuery, sort: 'stars', order: 'desc', per_page: 5 },
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });
        const items = response.data.items || [];
        const totalForks = items.reduce((sum, item) => sum + item.forks_count, 0);
        const avgStars = items.length > 0 ? items.reduce((sum, item) => sum + item.stargazers_count, 0) / items.length : 0;

        // Return stats specifically for these NEW repos
        return { repoCount: response.data.total_count, totalForks, avgStars, sampleSize: items.length };
    } catch (e) {
        console.error(`GitHub Error (${query}):`, e.message);
        return { repoCount: 0, totalForks: 0, avgStars: 0, sampleSize: 0 };
    }
}

async function fetchYouTubeData(query) {
    try {
        const thirtyDaysAgo = getThirtyDaysAgo().toISOString();
        const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });

        // Search for videos published in the last 30 days
        const response = await youtube.search.list({
            part: 'snippet',
            q: query,
            type: 'video',
            publishedAfter: thirtyDaysAgo, // <--- CRITICAL: 30-day filter
            maxResults: 50, // Match original API logic (fetch up to 50)
            order: 'relevance'
        });

        const videoIds = response.data.items.map(item => item.id.videoId).join(',');

        if (!videoIds) return { videoCount: 0, totalViews: 0, avgEngagement: 0, sampleSize: 0 };

        const statsResponse = await youtube.videos.list({
            part: 'statistics', id: videoIds
        });

        const videos = statsResponse.data.items;
        const totalViews = videos.reduce((sum, v) => sum + parseInt(v.statistics.viewCount || 0), 0);
        const totalLikes = videos.reduce((sum, v) => sum + parseInt(v.statistics.likeCount || 0), 0);
        const totalComments = videos.reduce((sum, v) => sum + parseInt(v.statistics.commentCount || 0), 0);

        // Avoid division by zero
        const avgEngagement = videos.length > 0 ? (totalLikes + totalComments) / videos.length : 0;

        // Note: response.data.pageInfo.totalResults is often an estimate, but usable
        return { videoCount: response.data.pageInfo.totalResults, totalViews, avgEngagement, sampleSize: videos.length };
    } catch (e) {
        console.error(`YouTube Error (${query}):`, e.message);
        return { videoCount: 0, totalViews: 0, avgEngagement: 0, sampleSize: 0 };
    }
}

function calculateScore(github, youtube) {
    // === REVISED THRESHOLDS FOR 30-DAY GROWTH ===
    // Since these are MONTHLY stats, numbers will be roughly 1/100th of "All-Time" stats.

    // Max new repos created in a month for a hot topic
    const MAX_REPO_COUNT = 2000;
    // Max avg stars on *brand new* repos in their first month
    const MAX_STARS = 500;

    // Max views on NEW tutorials in the last 30 days
    const MAX_VIEWS = 2000000; // 2M views/month is viral
    // Max engagement on new videos
    const MAX_ENGAGEMENT = 5000;

    // GitHub Score (50%)
    const gScore = ((github.repoCount / MAX_REPO_COUNT) * 40) + ((github.avgStars / MAX_STARS) * 60);

    // YouTube Score (50%)
    const yScore = ((youtube.totalViews / MAX_VIEWS) * 70) + ((youtube.avgEngagement / MAX_ENGAGEMENT) * 30);

    // Weighted Total
    let total = (Math.min(gScore, 100) * 0.5) + (Math.min(yScore, 100) * 0.5);
    return Math.round(total * 10) / 10;
}

async function main() {
    console.log("🚀 Starting Seed Script...");

    if (!YOUTUBE_API_KEY || !GITHUB_TOKEN) {
        console.error("❌ Missing API Keys in .env");
        return;
    }

    const skills = Object.keys(skillsToTrack);

    for (const skill of skills) {
        console.log(`Processing: ${skill}...`);

        const gData = await fetchGitHubData(skillsToTrack[skill].github);
        const yData = await fetchYouTubeData(skillsToTrack[skill].youtube);
        const trendScore = calculateScore(gData, yData);

        await prisma.trendScore.upsert({
            where: { skillName: skill },
            update: {
                category: skillsToTrack[skill].category,
                trendScore: trendScore,
                githubScore: gData.repoCount, // Store raw count or normalized score depending on schema expectations
                youtubeScore: yData.totalViews,
                githubWeight: 0.5,
                youtubeWeight: 0.5,
                githubSampleSize: gData.sampleSize,
                youtubeSampleSize: yData.sampleSize,
                updatedAt: new Date()
            },
            create: {
                skillName: skill,
                category: skillsToTrack[skill].category,
                trendScore: trendScore,
                githubScore: gData.repoCount,
                youtubeScore: yData.totalViews,
                githubWeight: 0.5,
                youtubeWeight: 0.5,
                githubSampleSize: gData.sampleSize,
                youtubeSampleSize: yData.sampleSize
            }
        });

        // Sleep 1s to respect rate limits
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log("✅ Seed Complete! All skills updated in MongoDB.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());