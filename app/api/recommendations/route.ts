import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { fetchYouTubeVideos } from "@/lib/youtube";
import { fetchTrustedDocs } from "@/lib/docs";

// --- EXTENSIVE TRENDING LIST ---
const TRENDING_TOPICS = [
  // Original
  "Web Development Roadmap",
  "React.js for Beginners",
  "Python Automation",
  "Artificial Intelligence Basics",
  "Data Structures and Algorithms",
  "Next.js 14 Tutorial",

  // Web & Frontend
  "HTML5 Advanced Concepts",
  "CSS Grid and Flexbox Mastery",
  "Tailwind CSS Advanced Patterns",
  "JavaScript ES2025 Features",
  "TypeScript for Large Applications",
  "Frontend System Design",
  "Responsive Web Design Best Practices",
  "Accessibility (a11y) in Web Development",
  "Web Performance Optimization",
  "Progressive Web Apps (PWA)",
  "Micro-Frontend Architecture",
  "Vite vs Webpack",
  "React Performance Optimization",
  "React Server Components",
  "State Management with Redux Toolkit",
  "Zustand vs Redux",
  "Framer Motion Animations",
  "Shadcn UI Components",
  "Modern UI/UX Design Principles",

  // Backend & APIs
  "Node.js Backend Roadmap",
  "Express.js Deep Dive",
  "REST API Best Practices",
  "GraphQL Fundamentals",
  "API Rate Limiting Strategies",
  "Authentication with JWT",
  "OAuth 2.0 and OpenID Connect",
  "Session vs Token Authentication",
  "Backend System Design",
  "Scalable Backend Architecture",
  "API Caching Strategies",
  "Idempotent APIs",
  "WebSockets and Real-Time Apps",
  "Microservices Architecture",
  "Monolith vs Microservices",

  // Databases
  "MongoDB Complete Guide",
  "MongoDB Aggregation Framework",
  "Indexing Strategies in MongoDB",
  "SQL vs NoSQL Databases",
  "PostgreSQL for Developers",
  "Database Normalization",
  "Redis for Caching",
  "Redis vs Memcached",
  "Database Sharding",
  "Transactions in Databases",

  // MERN Stack
  "MERN Stack Roadmap",
  "Full Stack MERN Project Ideas",
  "Authentication in MERN Apps",
  "Optimizing MERN Applications",
  "Deploying MERN Apps",
  "MERN with Next.js",

  // DevOps & Cloud
  "Git and GitHub Mastery",
  "CI/CD Pipelines Explained",
  "Docker for Beginners",
  "Dockerizing MERN Applications",
  "Kubernetes Basics",
  "AWS for Developers",
  "Cloud Deployment Strategies",
  "Serverless Architecture",
  "Edge Computing with Vercel",
  "Monitoring and Logging Systems",

  // AI & ML
  "Machine Learning Roadmap",
  "Deep Learning Fundamentals",
  "Neural Networks Explained",
  "Generative AI Basics",
  "Large Language Models (LLMs)",
  "Prompt Engineering",
  "AI in Web Development",
  "AI Chatbot Development",
  "Computer Vision Basics",
  "Natural Language Processing (NLP)",
  "AI Model Deployment",
  "Ethics in Artificial Intelligence",

  // Interviews
  "DSA Roadmap for Interviews",
  "Dynamic Programming Patterns",
  "Graph Algorithms",
  "Greedy Algorithms",
  "Recursion and Backtracking",
  "Time and Space Complexity",
  "Competitive Programming Basics",
  "System Design for Interviews",
  "Low-Level Design (LLD)",
  "High-Level Design (HLD)",

  // Career
  "Open Source Contribution Guide",
  "Hackathon Preparation",
  "Building Resume Projects",
  "Software Engineering Career Roadmap",
  "Backend Developer Roadmap",
  "Frontend Developer Roadmap",
  "Full Stack Developer Roadmap",
  "AI Engineer Roadmap",
  "Remote Developer Skills",
  "Tech Interview Preparation",
];

// Helper to mix arrays (e.g., A1, B1, C1, A2, B2, C2...)
function interleaveResults(...arrays: any[][]) {
  const maxLength = Math.max(...arrays.map((arr) => arr.length));
  const result = [];
  for (let i = 0; i < maxLength; i++) {
    for (const arr of arrays) {
      if (arr[i]) result.push(arr[i]);
    }
  }
  return result;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    let topics: string[] = [];
    let reason = "Trending Mix";

    // 1. Get User's Last 3 UNIQUE Searches
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (user) {
        // Fetch last 20 to ensure we find enough unique ones to fill 3 slots
        const historyItems = await prisma.searchHistory.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 20,
        });

        // Get unique strings, slice top 3
        const uniqueQueries = Array.from(
          new Set(historyItems.map((h) => h.query))
        );
        topics = uniqueQueries.slice(0, 3);

        if (topics.length > 0) {
          reason = "Based on your recent history";
        }
      }
    }

    // 2. Fill gaps with Random Trending Topics
    if (topics.length < 3) {
      const needed = 3 - topics.length;

      const randomTrending = [...TRENDING_TOPICS]
        .sort(() => 0.5 - Math.random())
        .slice(0, needed);

      topics = [...topics, ...randomTrending];

      if (topics.length === 3 && needed === 3) {
        reason = "Popular Topics for You";
      }
    }

    // 3. GRANULAR CACHING & FETCHING
    // Instead of checking one big key, we process each topic individually
    const results = await Promise.all(
      topics.map(async (topic) => {
        const cleanTopic = topic.trim();
        // Individual cache key per topic
        const singleCacheKey = `rec:single:${cleanTopic.toLowerCase()}`;

        // A. Check Cache for THIS specific topic
        try {
          const cached = await redis?.get(singleCacheKey);
          if (cached) {
            // console.log(`HIT: Found ${cleanTopic} in cache`);
            return JSON.parse(cached);
          }
        } catch (e) {
          console.warn("Redis read error", e);
        }

        // B. Fetch Fresh Data (if missing)
        // console.log(`MISS: Fetching fresh data for ${cleanTopic}`);
        const [v, d] = await Promise.all([
          fetchYouTubeVideos(cleanTopic),
          fetchTrustedDocs(cleanTopic),
        ]);

        const topicData = {
          videos: v.slice(0, 4), // Top 4 videos
          docs: d.slice(0, 2), // Top 2 docs
        };

        // C. Save to Cache (1 hour)
        try {
          await redis?.set(
            singleCacheKey,
            JSON.stringify(topicData),
            "EX",
            3600
          );
        } catch (e) {
          console.warn("Redis write error", e);
        }

        return topicData;
      })
    );

    // 4. Mix Logic (Interleave)
    // Combine the separate topic results into one feed
    const mixedVideos = interleaveResults(
      results[0].videos,
      results[1].videos,
      results[2].videos
    );
    const mixedDocs = interleaveResults(
      results[0].docs,
      results[1].docs,
      results[2].docs
    );

    const responseData = {
      topic: "Personalized Feed",
      reason,
      videos: mixedVideos,
      docs: mixedDocs,
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Rec API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
