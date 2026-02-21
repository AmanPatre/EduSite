// scripts/seed-trends.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); // Explicitly load from root
const { PrismaClient } = require('@prisma/client');
const { google } = require('googleapis');
const axios = require('axios');

const prisma = new PrismaClient();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Debug Logs
console.log("---------------------------------------------------");
console.log("🔑 API Key Debug:");
console.log(`   YOUTUBE_API_KEY: ${YOUTUBE_API_KEY ? YOUTUBE_API_KEY.substring(0, 10) + '...' : 'MISSING'}`);
console.log(`   GITHUB_TOKEN:    ${GITHUB_TOKEN ? 'Loaded' : 'MISSING'}`);
console.log("---------------------------------------------------");

// 1. Skill Definitions (with Category)
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

const getThirtyDaysAgo = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
};

// 2. Data Fetchers (Advanced with Sampling)
async function fetchGitHubData(query) {
    try {
        const thirtyDaysAgo = getThirtyDaysAgo().toISOString().split('T')[0];
        // Improved Query: Fetch NEW repos from last 30 days
        const timeQuery = `${query} created:>=${thirtyDaysAgo}`;

        // Fetch TOP 100 for heavy sampling
        const response = await axios.get(`https://api.github.com/search/repositories`, {
            params: { q: timeQuery, sort: 'stars', order: 'desc', per_page: 100 },
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });

        const items = response.data.items || [];
        const sampleSize = items.length;

        // Calculate Advanced Metrics
        const totalStars = items.reduce((sum, item) => sum + item.stargazers_count, 0);
        const totalForks = items.reduce((sum, item) => sum + item.forks_count, 0);
        const avgStars = sampleSize > 0 ? totalStars / sampleSize : 0;

        // Log Volume reduction for broad queries
        let volume = response.data.total_count;
        // Cap volume effect to avoid "TypeScript 600k" dominating everything else
        // Logarithmic scale for volume: log10(650000) = 5.8 -> scale to 0-100 range? 
        // For now, let's just assume massive volume isn't 100x better than 10k volume.

        return {
            repoCount: volume,
            avgStars,
            totalForks,
            sampleSize
        };
    } catch (e) {
        console.error(`GitHub Error (${query}):`, e.message);
        return { repoCount: 0, totalStars: 0, totalForks: 0, avgStars: 0, sampleSize: 0 };
    }
}

async function fetchYouTubeData(query) {
    try {
        const thirtyDaysAgo = getThirtyDaysAgo().toISOString();
        const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });

        const response = await youtube.search.list({
            part: 'snippet',
            q: query,
            type: 'video',
            publishedAfter: thirtyDaysAgo,
            maxResults: 50,
            order: 'relevance'
        });

        const videos = response.data.items || [];
        // If API key is invalid/quota exceeded, this might throw or return partial data

        const videoIds = videos.map(item => item.id.videoId).join(',');

        if (!videoIds) return { videoCount: 0, totalViews: 0, avgEngagement: 0, sampleSize: 0 };

        const statsResponse = await youtube.videos.list({
            part: 'statistics', id: videoIds
        });

        const statsItems = statsResponse.data.items || [];

        const totalViews = statsItems.reduce((sum, v) => sum + parseInt(v.statistics.viewCount || 0), 0);
        const videoCount = statsItems.length;

        // Calculate engagement (Likes / Views)
        let totalEngagementRatio = 0;
        statsItems.forEach(v => {
            const views = parseInt(v.statistics.viewCount) || 1;
            const likes = parseInt(v.statistics.likeCount) || 0;
            totalEngagementRatio += (likes / views);
        });
        const avgEngagement = videoCount > 0 ? (totalEngagementRatio / videoCount) * 1000 : 0; // Scaled up

        return { videoCount, totalViews, avgEngagement, sampleSize: videoCount };
    } catch (e) {
        console.error(`YouTube Error (${query}):`, e.message || e);
        // CRITICAL FIX: Return NULL to indicate API failure, not just "0 videos found"
        return null;
    }
}

// 3. Normalization & Scoring Logic
function normalizeWithProtection(value, allValues) {
    if (allValues.length === 0) return 0;
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);

    // Edge case: If all scores are the same (e.g., only 1 skill in category or all 0), return 50
    if (max === min) return 50;

    return ((value - min) / (max - min)) * 100;
}

function calculateAdaptiveWeights(githubData, youtubeData) {
    // If YouTube data is NULL (Api Failed), trust GitHub 100%
    if (youtubeData === null) {
        return { github: 1.0, youtube: 0.0 };
    }

    // If GitHub data is weak (few repos), trust YouTube more
    const hasGithub = githubData.sampleSize > 5;
    const hasYouTube = youtubeData.sampleSize > 3;

    if (hasGithub && hasYouTube) return { github: 0.50, youtube: 0.50 }; // Balanced
    if (hasGithub && !hasYouTube) return { github: 0.80, youtube: 0.20 };
    if (!hasGithub && hasYouTube) return { github: 0.20, youtube: 0.80 };
    return { github: 0.50, youtube: 0.50 };
}

// 4. Main Execution
async function main() {
    console.log("🚀 Starting Advanced Trend Seed Script (Fixed)...");

    if (!YOUTUBE_API_KEY) console.warn("⚠️ WARNING: YOUTUBE_API_KEY is missing. Scores will rely on GitHub.");

    const skills = Object.keys(skillsToTrack);
    const rawDataMap = {}; // Store raw data first: { "React": { github: {...}, youtube: {...}, category: "Frontend" } }

    // Phase 1: Gather ALL Data
    for (const skill of skills) {
        console.log(`📡 Fetching Data: ${skill}...`);
        const gData = await fetchGitHubData(skillsToTrack[skill].github);
        const yData = await fetchYouTubeData(skillsToTrack[skill].youtube);

        // Raw Score Calculation (Proprietary Formula from Plan)
        // GitHub: (Count * 2) + (AvgStars * 0.5) + (Forks * 0.1)
        // Scaled down repoCount mostly, trust the quality metrics more
        const githubRawScore = (gData.repoCount * 0.5) + (gData.avgStars * 5) + (gData.totalForks * 0.2);

        // YouTube: (Count * 10) + (Views / 1000) + (AvgEngagement * 500)
        // Handle NULL (Api Failure)
        let youtubeRawScore = 0;
        if (yData) {
            youtubeRawScore = (yData.videoCount * 10) + (yData.totalViews / 1000) + (yData.avgEngagement * 50);
        }

        rawDataMap[skill] = {
            category: skillsToTrack[skill].category,
            gData,
            yData,
            githubRawScore,
            youtubeRawScore
        };

        // Slight delay to be safe
        await new Promise(r => setTimeout(r, 500));
    }

    // Phase 2: Category Normalization
    console.log("⚖️  Normalizing Scores within Categories...");
    const skillsByCategory = {};

    // Group by category
    Object.keys(rawDataMap).forEach(skill => {
        const cat = rawDataMap[skill].category;
        if (!skillsByCategory[cat]) skillsByCategory[cat] = { names: [], gScores: [], yScores: [] };

        skillsByCategory[cat].names.push(skill);
        skillsByCategory[cat].gScores.push(rawDataMap[skill].githubRawScore);

        // Only push YouTube scores if valid
        if (rawDataMap[skill].yData) {
            skillsByCategory[cat].yScores.push(rawDataMap[skill].youtubeRawScore);
        }
    });

    // Calculate Final Scores
    for (const skill of skills) {
        const data = rawDataMap[skill];
        const catGroup = skillsByCategory[data.category];

        // Normalize
        const normGithub = normalizeWithProtection(data.githubRawScore, catGroup.gScores);

        let normYouTube = 0;
        // Only isolate comparison if others in category have data
        if (data.yData && catGroup.yScores.length > 0) {
            normYouTube = normalizeWithProtection(data.youtubeRawScore, catGroup.yScores);
        }

        // Adaptive Weighting
        const weights = calculateAdaptiveWeights(data.gData, data.yData);

        // Final Score
        let trendScore = (normGithub * weights.github) + (normYouTube * weights.youtube);
        trendScore = Math.round(Math.max(0, Math.min(100, trendScore)));

        console.log(`✅ ${skill}: Score ${trendScore} (G:${Math.round(normGithub)} Y:${data.yData ? Math.round(normYouTube) : 'N/A'}) - Weights: G${weights.github}/Y${weights.youtube}`);

        // Phase 3: Save to Database
        const currentScoreObj = await prisma.trendScore.upsert({
            where: { skillName: skill },
            update: {
                category: data.category,
                trendScore: trendScore,
                githubScore: data.gData.repoCount, // Store actual metrics for display
                youtubeScore: data.yData ? data.yData.totalViews : 0,
                githubWeight: weights.github,
                youtubeWeight: weights.youtube,
                githubSampleSize: data.gData.sampleSize,
                youtubeSampleSize: data.yData ? data.yData.sampleSize : 0,
                updatedAt: new Date()
            },
            create: {
                skillName: skill,
                category: data.category,
                trendScore: trendScore,
                githubScore: data.gData.repoCount,
                youtubeScore: data.yData ? data.yData.totalViews : 0,
                githubWeight: weights.github,
                youtubeWeight: weights.youtube,
                githubSampleSize: data.gData.sampleSize,
                youtubeSampleSize: data.yData ? data.yData.sampleSize : 0
            }
        });

        // Phase 4: History Backfill (Real Append Logic)
        // 1. Fetch existing history
        const existingHistory = await prisma.trendHistory.findUnique({
            where: { skillName: skill }
        });

        let historyScores = existingHistory ? [...(existingHistory.scores || [])] : [];

        // 2. Append Current Score (Real Data Only)
        historyScores.push(trendScore);

        // 3. Keep max 6 entries (Rolling Window - latest 6 runs)
        if (historyScores.length > 6) {
            historyScores = historyScores.slice(historyScores.length - 6);
        }

        await prisma.trendHistory.upsert({
            where: { skillName: skill },
            update: { scores: historyScores, updatedAt: new Date() },
            create: { skillName: skill, scores: historyScores }
        });
    }

    console.log("🏁 Seed Complete! DB Updated with Advanced Metrics.");

    // Phase 5: Flush Redis Cache (Server-Side)
    console.log("🧹 Flushing API Cache (Redis)...");
    try {
        const Redis = require('ioredis');
        if (process.env.REDIS_URL) {
            const redis = new Redis(process.env.REDIS_URL);
            await redis.del('trend:scores:all');
            console.log("✅ API Cache Invalidated ('trend:scores:all')");
            await redis.quit();
        } else {
            console.warn("⚠️ REDIS_URL missing, skipping cache flush.");
        }
    } catch (e) {
        console.warn("⚠️ Failed to flush Redis cache:", e.message);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());