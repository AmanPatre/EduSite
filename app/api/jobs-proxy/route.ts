import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// --- 1. DEFINE MAPPINGS ---
// We map Keywords -> Subcategories
const roleDefinitions: { [key: string]: string[] } = {
    // SDE Roles
    "sde-1": ["frontend", "react", "nextjs", "vue", "angular", "javascript", "typescript"],
    "sde-2": ["backend", "nodejs", "python", "java", "golang", "rust", "api", "database"],
    "sde-3": ["full stack", "fullstack", "mern", "mean"],

    // Data & AI
    "ai-1": ["ai engineer", "machine learning", "deep learning", "pytorch", "tensorflow", "llm", "gpt"],
    "ai-2": ["data scientist", "data analysis", "pandas", "numpy"],
    "ai-3": ["data engineer", "etl", "spark", "hadoop", "airflow"],

    // Cloud
    "cloud-1": ["devops", "ci/cd", "jenkins", "gitlab", "terraform"],
    "cloud-2": ["cloud architect", "aws", "azure", "gcp"],
    "cloud-3": ["sre", "reliability engineer", "observability"],

    // Security
    "sec-1": ["security engineer", "cyber security", "network security"],
    "sec-2": ["penetration tester", "ethical haker", "pentest"],
    "sec-3": ["security analyst", "soc", "siem"],

    // Design
    "design-1": ["ui/ux", "user interface", "user experience", "figma"],
    "design-2": ["product designer", "web design"],
    "design-3": ["design system"]
};

// --- 2. TEMPLATE STRUCTURE (Matches frontend expectation exactly) ---
const industryTemplate = [
    {
        id: 'role-cat-1',
        category: 'SDE Roles',
        totalJobs: 0,
        growth: 28,
        color: '#3b82f6',
        subcategories: [
            { id: 'sde-1', name: 'Frontend Engineer', jobs: 0, growth: 32, avgSalary: '$125k' },
            { id: 'sde-2', name: 'Backend Engineer', jobs: 0, growth: 25, avgSalary: '$135k' },
            { id: 'sde-3', name: 'Full Stack Engineer', jobs: 0, growth: 28, avgSalary: '$140k' }
        ]
    },
    {
        id: 'role-cat-2',
        category: 'Data & AI Roles',
        totalJobs: 0,
        growth: 65,
        color: '#a855f7',
        subcategories: [
            { id: 'ai-1', name: 'AI/ML Engineer', jobs: 0, growth: 78, avgSalary: '$160k' },
            { id: 'ai-2', name: 'Data Scientist', jobs: 0, growth: 55, avgSalary: '$145k' },
            { id: 'ai-3', name: 'Data Engineer', jobs: 0, growth: 62, avgSalary: '$140k' }
        ]
    },
    {
        id: 'role-cat-3',
        category: 'System & Cloud Roles',
        totalJobs: 0,
        growth: 42,
        color: '#06b6d4',
        subcategories: [
            { id: 'cloud-1', name: 'DevOps Engineer', jobs: 0, growth: 45, avgSalary: '$138k' },
            { id: 'cloud-2', name: 'Cloud Architect', jobs: 0, growth: 48, avgSalary: '$165k' },
            { id: 'cloud-3', name: 'SRE', jobs: 0, growth: 35, avgSalary: '$155k' }
        ]
    },
    {
        id: 'role-cat-4',
        category: 'Security Roles',
        totalJobs: 0,
        growth: 52,
        color: '#ef4444',
        subcategories: [
            { id: 'sec-1', name: 'Security Engineer', jobs: 0, growth: 58, avgSalary: '$150k' },
            { id: 'sec-2', name: 'Penetration Tester', jobs: 0, growth: 45, avgSalary: '$130k' },
            { id: 'sec-3', name: 'Security Analyst', jobs: 0, growth: 50, avgSalary: '$120k' }
        ]
    },
    {
        id: 'role-cat-5',
        category: 'Product Design Roles',
        totalJobs: 0,
        growth: 35,
        color: '#ec4899',
        subcategories: [
            { id: 'design-1', name: 'UI/UX Designer', jobs: 0, growth: 38, avgSalary: '$110k' },
            { id: 'design-2', name: 'Product Designer', jobs: 0, growth: 32, avgSalary: '$125k' },
            { id: 'design-3', name: 'Design Systems', jobs: 0, growth: 35, avgSalary: '$135k' }
        ]
    }
];

export async function GET() {
    try {
        console.log("Fetching Jobs from Remotive...");
        // 1. Fetch EVERYTHING (1 Request)
        const res = await fetch('https://remotive.com/api/remote-jobs', {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!res.ok) {
            console.error("Remotive API Error");
            return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
        }

        const data = await res.json();
        const allJobs = data.jobs || [];
        console.log(`Fetched ${allJobs.length} jobs completely.`);

        // 2. Process Data into Categories
        // Deep copy the template so we don't mutate the const
        const results = JSON.parse(JSON.stringify(industryTemplate));

        results.forEach((category: any) => {
            let catTotal = 0;

            category.subcategories.forEach((sub: any) => {
                const keywords = roleDefinitions[sub.id] || [];

                // Count basic keyword matches
                const rawCount = allJobs.filter((job: any) => {
                    const text = (job.title + " " + job.tags.join(" ")).toLowerCase();
                    // Match IF text contains ANY of the keywords
                    return keywords.some((k: string) => text.includes(k));
                }).length;

                // 3. APPLY MULTIPLIER (Remote x 6 = Estimated Total)
                // Remotive only shows strictly remote jobs. 
                // We estimate the full market is ~6x larger (Hybrid + Onsite).
                const estimatedTotal = rawCount * 6;

                sub.jobs = estimatedTotal;
                catTotal += estimatedTotal;
            });

            category.totalJobs = catTotal;
        });

        return NextResponse.json(results);

    } catch (error) {
        console.error("Job Proxy Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
