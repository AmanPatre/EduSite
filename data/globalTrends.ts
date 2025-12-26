export const GLOBAL_TRENDS = {
  lastUpdated: "Just now",
  
  // 1. Top of Page - The "Big Movers"
  snapshot: [
    {
      id: "1",
      name: "AI Engineering",
      slug: "ai-engineering",
      growth: "+38%",
      trend: "up", // up | down | flat
      velocity: "Explosive", // High | Medium | Explosive
      sparklineData: [10, 25, 18, 30, 45, 38, 55, 60], // For the mini-chart
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
      name: "DevOps & Kubernetis",
      slug: "devops",
      growth: "+19%",
      trend: "up",
      velocity: "Stable",
      sparklineData: [40, 42, 41, 44, 46, 45, 48, 50],
      color: "text-green-400",
      borderColor: "border-green-500/50"
    }
  ],

  // 2. Tabbed Sections (Frontend, Backend, etc.)
  categories: {
    frontend: [
      { name: "React Server Components", slug: "rsc", demand: "High", learners: "Very High", salary: "$120k" },
      { name: "Shadcn UI", slug: "shadcn", demand: "Medium", learners: "Explosive", salary: "N/A" },
      { name: "TypeScript", slug: "typescript", demand: "Critical", learners: "High", salary: "$115k" }
    ],
    backend: [
      { name: "Go (Golang)", slug: "golang", demand: "Very High", learners: "Medium", salary: "$140k" },
      { name: "Supabase / Firebase", slug: "supabase", demand: "High", learners: "High", salary: "$105k" },
      { name: "PostgreSQL", slug: "postgresql", demand: "Stable", learners: "Medium", salary: "$110k" }
    ],
    ai: [
      { name: "LangChain", slug: "langchain", demand: "High", learners: "High", salary: "$150k" },
      { name: "Vector Databases", slug: "vector-db", demand: "Medium", learners: "High", salary: "$145k" },
      { name: "Python", slug: "python", demand: "Critical", learners: "Very High", salary: "$125k" }
    ]
  },

  // 3. Insights & Warnings
  insights: [
    {
      type: "prediction",
      title: "The Full Stack Shift",
      text: "AI API skills are becoming mandatory for Frontend Devs. Pure UI roles are shrinking.",
      icon: "brain"
    },
    {
      type: "warning",
      title: "Oversaturated Market",
      text: "Entry-level React roles without Next.js/Backend knowledge have 500+ applicants per job.",
      icon: "alert"
    },
    {
      type: "opportunity",
      title: "Rising Niche",
      text: "Rust for tooling and WebAssembly is seeing a 40% year-over-year hiring increase.",
      icon: "sprout"
    }
  ],

  // 4. Tech Stacks
  stacks: [
    { name: "T3 Stack", components: ["Next.js", "TRPC", "Tailwind"], trend: "up" },
    { name: "MERN", components: ["Mongo", "Express", "React", "Node"], trend: "flat" },
    { name: "Modern AI", components: ["Next.js", "OpenAI", "Pinecone"], trend: "up" }
  ]
};