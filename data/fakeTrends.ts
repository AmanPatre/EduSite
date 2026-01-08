// --- 1. The Detailed List (Used by [skill]/page.tsx) ---
export const fakeTrends = [
  {
    skill: "Next.js",
    slug: "nextjs",
    category: "Frontend",
    score: 82,
    growthPercent: 28,
    direction: "UP",
    reason: "Rising job demand and strong learning content growth",
    roles: ["Frontend Engineer", "Full Stack Developer"],
    learnTime: "2–3 months",
    usedIn: ["SaaS", "Web Apps"],
  },
  {
    skill: "React",
    slug: "react",
    category: "Frontend",
    score: 88,
    growthPercent: 24,
    direction: "UP",
    reason: "Still the most widely used frontend library",
    roles: ["Frontend Engineer"],
    learnTime: "2–3 months",
    usedIn: ["Web Apps", "Dashboards"],
  },
  {
    skill: "AI Engineering",
    slug: "ai-engineering",
    category: "AI",
    score: 98,
    growthPercent: 41,
    direction: "UP",
    reason: "Exploding adoption across startups and enterprises",
    roles: ["AI Engineer", "ML Engineer"],
    learnTime: "3–4 months",
    usedIn: ["Chatbots", "Automation"],
  },
  {
    skill: "Rust",
    slug: "rust",
    category: "Backend",
    score: 85,
    growthPercent: 15,
    direction: "UP",
    reason: "High performance systems programming",
    roles: ["Systems Engineer"],
    learnTime: "5-6 months",
    usedIn: ["Infrastructure", "Tooling"],
  },
  {
    skill: "Kubernetes",
    slug: "kubernetes",
    category: "DevOps",
    score: 81,
    growthPercent: 21,
    direction: "UP",
    reason: "Standard for container orchestration",
    roles: ["DevOps Engineer", "SRE"],
    learnTime: "3-4 months",
    usedIn: ["Cloud Infrastructure"],
  },
  // Added to prevent errors if you click these specific items
  {
    skill: "DevOps",
    slug: "devops",
    category: "DevOps",
    score: 90,
    growthPercent: 19,
    direction: "UP",
    reason: "General term for the booming infrastructure industry",
    roles: ["DevOps Engineer"],
    learnTime: "6 months",
    usedIn: ["Cloud"],
  },
  {
    skill: "Go (Golang)",
    slug: "golang",
    category: "Backend",
    score: 88,
    growthPercent: 18,
    direction: "UP",
    reason: "The language of the cloud.",
    roles: ["Backend Engineer"],
    learnTime: "3 months",
    usedIn: ["Microservices"],
  }
];

// --- 2. The Dashboard Structure (Used by trending/page.tsx) ---
export const GLOBAL_TRENDS = {
  lastUpdated: "Just now",
  
  // Top Cards
  snapshot: [
    {
      id: "1",
      name: "AI Engineering",
      slug: "ai-engineering",
      growth: "+38%",
      trend: "up",
      velocity: "Explosive", 
      sparklineData: [10, 25, 18, 30, 45, 38, 55, 60],
      color: "text-purple-400",
      borderColor: "border-purple-500/50"
    },
    {
      id: "2",
      name: "Next.js (App Router)",
      slug: "nextjs",
      growth: "+24%",
      trend: "up",
      velocity: "High",
      sparklineData: [15, 20, 25, 30, 28, 35, 42, 48],
      color: "text-blue-400",
      borderColor: "border-blue-500/50"
    },
    {
      id: "3",
      name: "DevOps & Kubernetes",
      slug: "kubernetes", // Fixed slug to match fakeTrends
      growth: "+19%",
      trend: "up",
      velocity: "Stable",
      sparklineData: [40, 42, 41, 44, 46, 45, 48, 50],
      color: "text-green-400",
      borderColor: "border-green-500/50"
    }
  ],

  // Tabbed Lists
  categories: {
    frontend: [
      { name: "Next.js", slug: "nextjs", demand: "Critical", learners: "Very High", salary: "$120k" },
      { name: "React", slug: "react", demand: "High", learners: "High", salary: "$130k" },
      { name: "TypeScript", slug: "typescript", demand: "Standard", learners: "High", salary: "$115k" }
    ],
    backend: [
      { name: "Rust", slug: "rust", demand: "Very High", learners: "Medium", salary: "$140k" },
      { name: "Go (Golang)", slug: "golang", demand: "High", learners: "High", salary: "$135k" },
      { name: "Supabase", slug: "supabase", demand: "Rising", learners: "High", salary: "$110k" }
    ],
    ai: [
      { name: "AI Engineering", slug: "ai-engineering", demand: "Explosive", learners: "High", salary: "$160k" },
      { name: "LangChain", slug: "langchain", demand: "High", learners: "High", salary: "$145k" },
      { name: "Vector DBs", slug: "vector-db", demand: "High", learners: "Medium", salary: "$140k" }
    ]
  },

  // Winning Stacks
  stacks: [
    { name: "T3 Stack", components: ["Next.js", "TRPC", "Tailwind"], trend: "up" },
    { name: "MERN", components: ["Mongo", "Express", "React", "Node"], trend: "flat" },
    { name: "Modern AI", components: ["Next.js", "OpenAI", "Pinecone"], trend: "up" }
  ],

  // Analyst Insights
  insights: [
    {
      type: "prediction",
      title: "The Full Stack Shift",
      text: "AI API skills are becoming mandatory for Frontend Devs. Pure UI roles are shrinking."
    },
    {
      type: "warning",
      title: "Oversaturated Market",
      text: "Entry-level React roles without Next.js/Backend knowledge have 500+ applicants per job."
    },
    {
      type: "opportunity",
      title: "Rising Niche",
      text: "Rust for tooling and WebAssembly is seeing a 40% year-over-year hiring increase."
    }
  ]
};