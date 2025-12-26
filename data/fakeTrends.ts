// --- 1. The Detailed List (Used by [skill]/page.tsx AND TrendCards) ---
export const fakeTrends = [
  {
    id: "1",
    skill: "AI Engineering",
    category: "AI",
    slug: "ai-engineering",
    direction: "up", // ✅ Added this back
    reason: "The rise of LLMs (GPT-4, Claude) has created a massive demand for engineers who can integrate AI models into applications.",
    score: 98,
    growthPercent: 38,
    learnTime: "6 Months",
    roles: ["AI Solutions Architect", "ML Engineer", "AI Product Manager"],
    usedIn: ["Chatbots", "Automation", "Data Analysis", "Healthcare"],
    salary: "$140k - $220k",
    demand: "Explosive"
  },
  {
    id: "2",
    skill: "Next.js (App Router)",
    category: "Frontend",
    slug: "nextjs",
    direction: "up", // ✅ Added this back
    reason: "Next.js has become the default React framework. The new App Router and Server Components are shifting how we build web apps.",
    score: 95,
    growthPercent: 24,
    learnTime: "3 Months",
    roles: ["Frontend Engineer", "Full Stack Developer", "UX Engineer"],
    usedIn: ["E-commerce", "SaaS Dashboards", "Marketing Sites"],
    salary: "$110k - $160k",
    demand: "High"
  },
  {
    id: "3",
    skill: "Rust Systems Dev",
    category: "Backend",
    slug: "rust",
    direction: "up", // ✅ Added this back
    reason: "Rust is replacing C++ in performance-critical infrastructure. It is loved for memory safety and is now entering web development via Wasm.",
    score: 88,
    growthPercent: 15,
    learnTime: "5-6 Months",
    roles: ["Systems Engineer", "Blockchain Developer", "Backend Performance Engineer"],
    usedIn: ["Cloud Infrastructure", "Game Engines", "Browser Engines"],
    salary: "$130k - $190k",
    demand: "Stable"
  },
  {
    id: "4",
    skill: "DevOps & Kubernetes",
    category: "DevOps",
    slug: "devops",
    direction: "up", // ✅ Added this back
    reason: "Companies need scalable infrastructure. Kubernetes is the OS of the cloud.",
    score: 92,
    growthPercent: 19,
    learnTime: "6 Months",
    roles: ["DevOps Engineer", "Platform Engineer", "SRE"],
    usedIn: ["Cloud Computing", "Enterprise Apps", "FinTech"],
    salary: "$120k - $180k",
    demand: "High"
  },
  {
    id: "5",
    skill: "React Server Components",
    category: "Frontend",
    slug: "rsc",
    direction: "up", // ✅ Added this back
    reason: "A paradigm shift in React allowing components to render exclusively on the server.",
    score: 90,
    growthPercent: 28,
    learnTime: "1 Month",
    roles: ["Frontend Lead", "React Specialist"],
    usedIn: ["High Performance Web Apps"],
    salary: "$125k+",
    demand: "High"
  },
  {
    id: "6",
    skill: "Legacy PHP / jQuery",
    category: "Backend",
    slug: "legacy-php",
    direction: "down", // ✅ Added a "down" example
    reason: "Modern frameworks are replacing legacy stacks in new projects.",
    score: 45,
    growthPercent: -12,
    learnTime: "3 Months",
    roles: ["Legacy Maintainer", "Wordpress Dev"],
    usedIn: ["Old Enterprise Apps"],
    salary: "$60k - $90k",
    demand: "Falling"
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
      slug: "devops",
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
      { name: "React Server Components", slug: "rsc", demand: "High", learners: "High", salary: "$130k" },
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