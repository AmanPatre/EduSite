
export interface TrendingSkill {
  id: string;
  name: string;
  slug: string;
  category: 'Frontend' | 'Backend' | 'AI/ML' | 'DevOps' | 'Mobile' | 'Design';
  icon: string; // emoji or icon name
  learningTrend: number[]; // Monthly learner count for last 6 months
  currentLearners: number;
  growthRate: number; // percentage
  monthlyGrowth: number; // month-over-month
}

export interface IndustryRole {
  id: string;
  category: string; // "SDE", "Data & AI", etc.
  totalJobs: number;
  growth: number; // percentage
  color: string;
  subcategories: {
    id: string;
    name: string; // "Frontend", "Backend", etc.
    jobs: number;
    growth: number;
    avgSalary: string;
  }[];
}

export interface SkillRoleMapping {
  skillId: string;
  skillName: string;
  roles: {
    roleId: string;
    roleName: string;
    alignment: 'Strong' | 'Medium' | 'Weak' | 'Critical';
    matchPercentage: number; // 0-100
    demandScore: number; // 1-10
  }[];
}

export interface RoleSkillMapping {
  roleId: string;
  roleName: string;
  requiredSkills: {
    skillId: string;
    skillName: string;
    priority: 'Critical' | 'Important' | 'Nice to Have';
    proficiencyLevel: string; // "Beginner", "Intermediate", "Advanced"
  }[];
}

export interface EffortRewardData {
  skillId: string;
  skillName: string;
  slug: string;
  effortLevel: number; // 1-10 scale (learning difficulty/time)
  demandLevel: number; // 1-10 scale (job demand)
  roi: 'High' | 'Medium' | 'Low';
  learningMonths: number;
  jobOpenings: number;
  avgSalary: string;
  category: string;
}

export interface MarketInsight {
  id: string;
  type: 'trend' | 'warning' | 'opportunity';
  title: string;
  description: string;
  relatedSkills: string[]; // skill IDs
  impact: 'High' | 'Medium' | 'Low';
  timeframe: string; // "Q1 2025", "Next 6 months", etc.
}


// SECTION 1: TRENDING SKILLS DATA


export const trendingSkills: TrendingSkill[] = [
  {
    id: 'skill-1',
    name: 'Next.js',
    slug: 'nextjs',
    category: 'Frontend',
    icon: '⚡',
    learningTrend: [12000, 15000, 18000, 22000, 28000, 35000],
    currentLearners: 35000,
    growthRate: 42,
    monthlyGrowth: 25
  },
  {
    id: 'skill-2',
    name: 'React',
    slug: 'react',
    category: 'Frontend',
    icon: '⚛️',
    learningTrend: [45000, 47000, 48000, 50000, 52000, 54000],
    currentLearners: 54000,
    growthRate: 20,
    monthlyGrowth: 4
  },
  {
    id: 'skill-3',
    name: 'AI Engineering',
    slug: 'ai-engineering',
    category: 'AI/ML',
    icon: '🤖',
    learningTrend: [8000, 14000, 22000, 35000, 52000, 68000],
    currentLearners: 68000,
    growthRate: 85,
    monthlyGrowth: 31
  },
  {
    id: 'skill-4',
    name: 'Python',
    slug: 'python',
    category: 'Backend',
    icon: '🐍',
    learningTrend: [60000, 62000, 64000, 66000, 68000, 70000],
    currentLearners: 70000,
    growthRate: 17,
    monthlyGrowth: 3
  },
  {
    id: 'skill-5',
    name: 'Rust',
    slug: 'rust',
    category: 'Backend',
    icon: '🦀',
    learningTrend: [3000, 4200, 5800, 7500, 9800, 12500],
    currentLearners: 12500,
    growthRate: 58,
    monthlyGrowth: 28
  },
  {
    id: 'skill-6',
    name: 'Kubernetes',
    slug: 'kubernetes',
    category: 'DevOps',
    icon: '☸️',
    learningTrend: [18000, 20000, 22000, 25000, 28000, 31000],
    currentLearners: 31000,
    growthRate: 38,
    monthlyGrowth: 11
  },
  {
    id: 'skill-7',
    name: 'TypeScript',
    slug: 'typescript',
    category: 'Frontend',
    icon: '📘',
    learningTrend: [32000, 35000, 38000, 42000, 46000, 50000],
    currentLearners: 50000,
    growthRate: 36,
    monthlyGrowth: 9
  },
  {
    id: 'skill-8',
    name: 'Docker',
    slug: 'docker',
    category: 'DevOps',
    icon: '🐳',
    learningTrend: [25000, 26500, 28000, 29500, 31000, 32500],
    currentLearners: 32500,
    growthRate: 30,
    monthlyGrowth: 5
  },
  {
    id: 'skill-9',
    name: 'LangChain',
    slug: 'langchain',
    category: 'AI/ML',
    icon: '🔗',
    learningTrend: [2000, 4500, 8000, 13000, 19000, 26000],
    currentLearners: 26000,
    growthRate: 92,
    monthlyGrowth: 37
  },
  {
    id: 'skill-10',
    name: 'Go',
    slug: 'golang',
    category: 'Backend',
    icon: '🔵',
    learningTrend: [15000, 17000, 19000, 21500, 24000, 27000],
    currentLearners: 27000,
    growthRate: 44,
    monthlyGrowth: 13
  },
  {
    id: 'skill-11',
    name: 'Flutter',
    slug: 'flutter',
    category: 'Mobile',
    icon: '📱',
    learningTrend: [20000, 21000, 22500, 24000, 25500, 27000],
    currentLearners: 27000,
    growthRate: 35,
    monthlyGrowth: 6
  },
  {
    id: 'skill-12',
    name: 'Figma',
    slug: 'figma',
    category: 'Design',
    icon: '🎨',
    learningTrend: [18000, 20000, 23000, 26000, 29000, 32000],
    currentLearners: 32000,
    growthRate: 44,
    monthlyGrowth: 10
  }
];

// ============================================
// SECTION 2: INDUSTRY DEMAND DATA
// ============================================

export const industryRoles: IndustryRole[] = [
  {
    id: 'role-cat-1',
    category: 'SDE Roles',
    totalJobs: 45000,
    growth: 28,
    color: '#3b82f6', // blue
    subcategories: [
      {
        id: 'sde-1',
        name: 'Frontend Engineer',
        jobs: 18000,
        growth: 32,
        avgSalary: '$125k'
      },
      {
        id: 'sde-2',
        name: 'Backend Engineer',
        jobs: 15000,
        growth: 25,
        avgSalary: '$135k'
      },
      {
        id: 'sde-3',
        name: 'Full Stack Engineer',
        jobs: 12000,
        growth: 28,
        avgSalary: '$140k'
      }
    ]
  },
  {
    id: 'role-cat-2',
    category: 'Data & AI Roles',
    totalJobs: 38000,
    growth: 65,
    color: '#a855f7', // purple
    subcategories: [
      {
        id: 'ai-1',
        name: 'AI/ML Engineer',
        jobs: 16000,
        growth: 78,
        avgSalary: '$160k'
      },
      {
        id: 'ai-2',
        name: 'Data Scientist',
        jobs: 12000,
        growth: 55,
        avgSalary: '$145k'
      },
      {
        id: 'ai-3',
        name: 'Data Engineer',
        jobs: 10000,
        growth: 62,
        avgSalary: '$140k'
      }
    ]
  },
  {
    id: 'role-cat-3',
    category: 'System & Cloud Roles',
    totalJobs: 32000,
    growth: 42,
    color: '#06b6d4', // cyan
    subcategories: [
      {
        id: 'cloud-1',
        name: 'DevOps Engineer',
        jobs: 14000,
        growth: 45,
        avgSalary: '$138k'
      },
      {
        id: 'cloud-2',
        name: 'Cloud Architect',
        jobs: 10000,
        growth: 48,
        avgSalary: '$165k'
      },
      {
        id: 'cloud-3',
        name: 'SRE',
        jobs: 8000,
        growth: 35,
        avgSalary: '$155k'
      }
    ]
  },
  {
    id: 'role-cat-4',
    category: 'Security Roles',
    totalJobs: 18000,
    growth: 52,
    color: '#ef4444', // red
    subcategories: [
      {
        id: 'sec-1',
        name: 'Security Engineer',
        jobs: 8000,
        growth: 58,
        avgSalary: '$150k'
      },
      {
        id: 'sec-2',
        name: 'Penetration Tester',
        jobs: 5000,
        growth: 45,
        avgSalary: '$130k'
      },
      {
        id: 'sec-3',
        name: 'Security Analyst',
        jobs: 5000,
        growth: 50,
        avgSalary: '$120k'
      }
    ]
  },
  {
    id: 'role-cat-5',
    category: 'Product Design Roles',
    totalJobs: 15000,
    growth: 35,
    color: '#ec4899', // pink
    subcategories: [
      {
        id: 'design-1',
        name: 'UI/UX Designer',
        jobs: 8000,
        growth: 38,
        avgSalary: '$110k'
      },
      {
        id: 'design-2',
        name: 'Product Designer',
        jobs: 5000,
        growth: 32,
        avgSalary: '$125k'
      },
      {
        id: 'design-3',
        name: 'Design Systems',
        jobs: 2000,
        growth: 35,
        avgSalary: '$135k'
      }
    ]
  }
];

// ============================================
// SECTION 3: SKILL → ROLE MAPPING
// ============================================

export const skillRoleMappings: SkillRoleMapping[] = [
  {
    skillId: 'skill-1', // Next.js
    skillName: 'Next.js',
    roles: [
      { roleId: 'sde-1', roleName: 'Frontend Engineer', alignment: 'Strong', matchPercentage: 95, demandScore: 9 },
      { roleId: 'sde-3', roleName: 'Full Stack Engineer', alignment: 'Strong', matchPercentage: 90, demandScore: 9 },
      { roleId: 'sde-2', roleName: 'Backend Engineer', alignment: 'Weak', matchPercentage: 30, demandScore: 4 }
    ]
  },
  {
    skillId: 'skill-2', // React
    skillName: 'React',
    roles: [
      { roleId: 'sde-1', roleName: 'Frontend Engineer', alignment: 'Critical', matchPercentage: 100, demandScore: 10 },
      { roleId: 'sde-3', roleName: 'Full Stack Engineer', alignment: 'Strong', matchPercentage: 90, demandScore: 9 },
      { roleId: 'design-1', roleName: 'UI/UX Designer', alignment: 'Medium', matchPercentage: 40, demandScore: 5 }
    ]
  },
  {
    skillId: 'skill-3', // AI Engineering
    skillName: 'AI Engineering',
    roles: [
      { roleId: 'ai-1', roleName: 'AI/ML Engineer', alignment: 'Strong', matchPercentage: 98, demandScore: 10 },
      { roleId: 'ai-2', roleName: 'Data Scientist', alignment: 'Strong', matchPercentage: 85, demandScore: 8 },
      { roleId: 'sde-3', roleName: 'Full Stack Engineer', alignment: 'Medium', matchPercentage: 55, demandScore: 6 }
    ]
  },
  {
    skillId: 'skill-4', // Python
    skillName: 'Python',
    roles: [
      { roleId: 'ai-1', roleName: 'AI/ML Engineer', alignment: 'Critical', matchPercentage: 100, demandScore: 10 },
      { roleId: 'ai-2', roleName: 'Data Scientist', alignment: 'Critical', matchPercentage: 100, demandScore: 9 },
      { roleId: 'sde-2', roleName: 'Backend Engineer', alignment: 'Strong', matchPercentage: 85, demandScore: 8 },
      { roleId: 'cloud-1', roleName: 'DevOps Engineer', alignment: 'Medium', matchPercentage: 60, demandScore: 7 }
    ]
  },
  {
    skillId: 'skill-5', // Rust
    skillName: 'Rust',
    roles: [
      { roleId: 'sde-2', roleName: 'Backend Engineer', alignment: 'Strong', matchPercentage: 92, demandScore: 8 },
      { roleId: 'cloud-3', roleName: 'SRE', alignment: 'Medium', matchPercentage: 65, demandScore: 7 },
      { roleId: 'sde-1', roleName: 'Frontend Engineer', alignment: 'Weak', matchPercentage: 20, demandScore: 2 }
    ]
  },
  {
    skillId: 'skill-6', // Kubernetes
    skillName: 'Kubernetes',
    roles: [
      { roleId: 'cloud-1', roleName: 'DevOps Engineer', alignment: 'Strong', matchPercentage: 95, demandScore: 10 },
      { roleId: 'cloud-3', roleName: 'SRE', alignment: 'Strong', matchPercentage: 90, demandScore: 9 },
      { roleId: 'cloud-2', roleName: 'Cloud Architect', alignment: 'Strong', matchPercentage: 88, demandScore: 9 }
    ]
  },
  {
    skillId: 'skill-7', // TypeScript
    skillName: 'TypeScript',
    roles: [
      { roleId: 'sde-1', roleName: 'Frontend Engineer', alignment: 'Critical', matchPercentage: 98, demandScore: 10 },
      { roleId: 'sde-3', roleName: 'Full Stack Engineer', alignment: 'Critical', matchPercentage: 95, demandScore: 10 },
      { roleId: 'sde-2', roleName: 'Backend Engineer', alignment: 'Medium', matchPercentage: 60, demandScore: 7 }
    ]
  },
  {
    skillId: 'skill-8', // Docker
    skillName: 'Docker',
    roles: [
      { roleId: 'cloud-1', roleName: 'DevOps Engineer', alignment: 'Critical', matchPercentage: 100, demandScore: 10 },
      { roleId: 'sde-3', roleName: 'Full Stack Engineer', alignment: 'Strong', matchPercentage: 80, demandScore: 8 },
      { roleId: 'sde-2', roleName: 'Backend Engineer', alignment: 'Strong', matchPercentage: 85, demandScore: 8 }
    ]
  },
  {
    skillId: 'skill-9', // LangChain
    skillName: 'LangChain',
    roles: [
      { roleId: 'ai-1', roleName: 'AI/ML Engineer', alignment: 'Strong', matchPercentage: 95, demandScore: 10 },
      { roleId: 'sde-3', roleName: 'Full Stack Engineer', alignment: 'Medium', matchPercentage: 65, demandScore: 8 } // The "AI Engineer" shift
    ]
  },
  {
    skillId: 'skill-10', // Go
    skillName: 'Go',
    roles: [
      { roleId: 'sde-2', roleName: 'Backend Engineer', alignment: 'Strong', matchPercentage: 90, demandScore: 9 },
      { roleId: 'cloud-1', roleName: 'DevOps Engineer', alignment: 'Strong', matchPercentage: 85, demandScore: 8 },
      { roleId: 'cloud-3', roleName: 'SRE', alignment: 'Critical', matchPercentage: 95, demandScore: 9 }
    ]
  },
  {
    skillId: 'skill-11', // Flutter
    skillName: 'Flutter',
    roles: [
      { roleId: 'sde-1', roleName: 'Frontend Engineer', alignment: 'Medium', matchPercentage: 50, demandScore: 5 }, // Mobile != Web
      { roleId: 'design-2', roleName: 'Product Designer', alignment: 'Weak', matchPercentage: 30, demandScore: 3 }
    ]
  },
  {
    skillId: 'skill-12', // Figma
    skillName: 'Figma',
    roles: [
      { roleId: 'design-1', roleName: 'UI/UX Designer', alignment: 'Strong', matchPercentage: 98, demandScore: 9 },
      { roleId: 'design-2', roleName: 'Product Designer', alignment: 'Strong', matchPercentage: 95, demandScore: 9 },
      { roleId: 'sde-1', roleName: 'Frontend Engineer', alignment: 'Medium', matchPercentage: 45, demandScore: 5 }
    ]
  },
  {
    skillId: 'skill-13', // Node.js
    skillName: 'Node.js',
    roles: [
      { roleId: 'sde-2', roleName: 'Backend Engineer', alignment: 'Critical', matchPercentage: 98, demandScore: 10 },
      { roleId: 'sde-3', roleName: 'Full Stack Engineer', alignment: 'Critical', matchPercentage: 95, demandScore: 9 },
      { roleId: 'cloud-1', roleName: 'DevOps Engineer', alignment: 'Medium', matchPercentage: 55, demandScore: 6 }
    ]
  },
  {
    skillId: 'skill-14', // Express.js
    skillName: 'Express.js',
    roles: [
      { roleId: 'sde-2', roleName: 'Backend Engineer', alignment: 'Strong', matchPercentage: 92, demandScore: 8 },
      { roleId: 'sde-3', roleName: 'Full Stack Engineer', alignment: 'Strong', matchPercentage: 88, demandScore: 8 }
    ]
  },
  {
    skillId: 'skill-15', // MongoDB
    skillName: 'MongoDB',
    roles: [
      { roleId: 'sde-2', roleName: 'Backend Engineer', alignment: 'Strong', matchPercentage: 90, demandScore: 8 },
      { roleId: 'sde-3', roleName: 'Full Stack Engineer', alignment: 'Strong', matchPercentage: 85, demandScore: 8 },
      { roleId: 'ai-2', roleName: 'Data Scientist', alignment: 'Medium', matchPercentage: 60, demandScore: 6 }
    ]
  },
  {
    skillId: 'skill-16', // PostgreSQL
    skillName: 'PostgreSQL',
    roles: [
      { roleId: 'sde-2', roleName: 'Backend Engineer', alignment: 'Critical', matchPercentage: 95, demandScore: 9 },
      { roleId: 'cloud-2', roleName: 'Cloud Architect', alignment: 'Strong', matchPercentage: 85, demandScore: 8 }
    ]
  },
  {
    skillId: 'skill-17', // AWS
    skillName: 'AWS',
    roles: [
      { roleId: 'cloud-1', roleName: 'DevOps Engineer', alignment: 'Critical', matchPercentage: 100, demandScore: 10 },
      { roleId: 'cloud-2', roleName: 'Cloud Architect', alignment: 'Critical', matchPercentage: 98, demandScore: 10 },
      { roleId: 'sde-2', roleName: 'Backend Engineer', alignment: 'Medium', matchPercentage: 65, demandScore: 7 }
    ]
  },
  {
    skillId: 'skill-18', // CI/CD
    skillName: 'CI/CD Pipelines',
    roles: [
      { roleId: 'cloud-1', roleName: 'DevOps Engineer', alignment: 'Critical', matchPercentage: 95, demandScore: 9 },
      { roleId: 'cloud-3', roleName: 'SRE', alignment: 'Strong', matchPercentage: 90, demandScore: 9 },
      { roleId: 'sde-3', roleName: 'Full Stack Engineer', alignment: 'Medium', matchPercentage: 60, demandScore: 6 }
    ]
  },
  {
    skillId: 'skill-19', // Redis
    skillName: 'Redis',
    roles: [
      { roleId: 'sde-2', roleName: 'Backend Engineer', alignment: 'Strong', matchPercentage: 88, demandScore: 8 },
      { roleId: 'cloud-3', roleName: 'SRE', alignment: 'Medium', matchPercentage: 65, demandScore: 7 }
    ]
  },
  {
    skillId: 'skill-20', // GraphQL
    skillName: 'GraphQL',
    roles: [
      { roleId: 'sde-3', roleName: 'Full Stack Engineer', alignment: 'Strong', matchPercentage: 85, demandScore: 8 },
      { roleId: 'sde-1', roleName: 'Frontend Engineer', alignment: 'Medium', matchPercentage: 70, demandScore: 7 }
    ]
  },
  {
    skillId: 'skill-21', // Machine Learning
    skillName: 'Machine Learning',
    roles: [
      { roleId: 'ai-1', roleName: 'AI/ML Engineer', alignment: 'Critical', matchPercentage: 100, demandScore: 10 },
      { roleId: 'ai-2', roleName: 'Data Scientist', alignment: 'Critical', matchPercentage: 95, demandScore: 9 }
    ]
  },
  {
    skillId: 'skill-22', // TensorFlow
    skillName: 'TensorFlow',
    roles: [
      { roleId: 'ai-1', roleName: 'AI/ML Engineer', alignment: 'Strong', matchPercentage: 92, demandScore: 9 },
      { roleId: 'ai-2', roleName: 'Data Scientist', alignment: 'Strong', matchPercentage: 85, demandScore: 8 }
    ]
  },
  {
    skillId: 'skill-23', // React Native
    skillName: 'React Native',
    roles: [
      { roleId: 'mobile-1', roleName: 'Mobile App Developer', alignment: 'Critical', matchPercentage: 95, demandScore: 9 },
      { roleId: 'sde-3', roleName: 'Full Stack Engineer', alignment: 'Medium', matchPercentage: 60, demandScore: 6 }
    ]
  },
  {
    skillId: 'skill-24', // Android
    skillName: 'Android Development',
    roles: [
      { roleId: 'mobile-1', roleName: 'Mobile App Developer', alignment: 'Critical', matchPercentage: 98, demandScore: 9 }
    ]
  },
  {
    skillId: 'skill-25', // UI/UX Design
    skillName: 'UI/UX Design',
    roles: [
      { roleId: 'design-1', roleName: 'UI/UX Designer', alignment: 'Critical', matchPercentage: 100, demandScore: 9 },
      { roleId: 'design-2', roleName: 'Product Designer', alignment: 'Strong', matchPercentage: 90, demandScore: 8 }
    ]
  },
  {
    skillId: 'skill-26', // Web Accessibility
    skillName: 'Web Accessibility (a11y)',
    roles: [
      { roleId: 'sde-1', roleName: 'Frontend Engineer', alignment: 'Strong', matchPercentage: 85, demandScore: 8 },
      { roleId: 'design-1', roleName: 'UI/UX Designer', alignment: 'Strong', matchPercentage: 80, demandScore: 7 }
    ]
  },
  {
    skillId: 'skill-27', // NextAuth
    skillName: 'NextAuth.js',
    roles: [
      { roleId: 'sde-3', roleName: 'Full Stack Engineer', alignment: 'Strong', matchPercentage: 85, demandScore: 8 },
      { roleId: 'sde-1', roleName: 'Frontend Engineer', alignment: 'Medium', matchPercentage: 60, demandScore: 6 }
    ]
  },
  {
    skillId: 'skill-28', // Prisma
    skillName: 'Prisma ORM',
    roles: [
      { roleId: 'sde-2', roleName: 'Backend Engineer', alignment: 'Strong', matchPercentage: 90, demandScore: 8 },
      { roleId: 'sde-3', roleName: 'Full Stack Engineer', alignment: 'Strong', matchPercentage: 88, demandScore: 8 }
    ]
  },
  {
    skillId: 'skill-29', // Tailwind CSS
    skillName: 'Tailwind CSS',
    roles: [
      { roleId: 'sde-1', roleName: 'Frontend Engineer', alignment: 'Strong', matchPercentage: 92, demandScore: 8 },
      { roleId: 'design-1', roleName: 'UI/UX Designer', alignment: 'Medium', matchPercentage: 55, demandScore: 5 }
    ]
  },
  {
    skillId: 'skill-30', // Redux
    skillName: 'Redux',
    roles: [
      { roleId: 'sde-1', roleName: 'Frontend Engineer', alignment: 'Strong', matchPercentage: 85, demandScore: 7 },
      { roleId: 'sde-3', roleName: 'Full Stack Engineer', alignment: 'Medium', matchPercentage: 65, demandScore: 6 }
    ]
  },
  {
    skillId: 'skill-31', // WebSockets
    skillName: 'WebSockets',
    roles: [
      { roleId: 'sde-2', roleName: 'Backend Engineer', alignment: 'Strong', matchPercentage: 88, demandScore: 8 },
      { roleId: 'sde-3', roleName: 'Full Stack Engineer', alignment: 'Strong', matchPercentage: 82, demandScore: 7 }
    ]
  },
  {
    skillId: 'skill-32', // System Design
    skillName: 'System Design',
    roles: [
      { roleId: 'sde-2', roleName: 'Backend Engineer', alignment: 'Critical', matchPercentage: 95, demandScore: 10 },
      { roleId: 'cloud-2', roleName: 'Cloud Architect', alignment: 'Critical', matchPercentage: 92, demandScore: 9 },
      { roleId: 'cloud-3', roleName: 'SRE', alignment: 'Strong', matchPercentage: 85, demandScore: 8 }
    ]
  },
  {
    skillId: 'skill-33', // Linux
    skillName: 'Linux',
    roles: [
      { roleId: 'cloud-3', roleName: 'SRE', alignment: 'Critical', matchPercentage: 95, demandScore: 9 },
      { roleId: 'cloud-1', roleName: 'DevOps Engineer', alignment: 'Strong', matchPercentage: 90, demandScore: 8 }
    ]
  },
  {
    skillId: 'skill-34', // Nginx
    skillName: 'Nginx',
    roles: [
      { roleId: 'cloud-1', roleName: 'DevOps Engineer', alignment: 'Strong', matchPercentage: 88, demandScore: 8 },
      { roleId: 'cloud-3', roleName: 'SRE', alignment: 'Strong', matchPercentage: 85, demandScore: 7 }
    ]
  },
  {
    skillId: 'skill-35', // Observability
    skillName: 'Observability & Monitoring',
    roles: [
      { roleId: 'cloud-3', roleName: 'SRE', alignment: 'Critical', matchPercentage: 92, demandScore: 9 },
      { roleId: 'cloud-1', roleName: 'DevOps Engineer', alignment: 'Strong', matchPercentage: 85, demandScore: 8 }
    ]
  },
  {
    skillId: 'skill-36', // Prompt Engineering
    skillName: 'Prompt Engineering',
    roles: [
      { roleId: 'ai-1', roleName: 'AI/ML Engineer', alignment: 'Strong', matchPercentage: 90, demandScore: 9 },
      { roleId: 'sde-3', roleName: 'Full Stack Engineer', alignment: 'Medium', matchPercentage: 65, demandScore: 7 }
    ]
  },
  {
    skillId: 'skill-37', // Vector Databases
    skillName: 'Vector Databases',
    roles: [
      { roleId: 'ai-1', roleName: 'AI/ML Engineer', alignment: 'Strong', matchPercentage: 92, demandScore: 9 },
      { roleId: 'sde-2', roleName: 'Backend Engineer', alignment: 'Medium', matchPercentage: 60, demandScore: 7 }
    ]
  },
  {
    skillId: 'skill-38', // MLOps
    skillName: 'MLOps',
    roles: [
      { roleId: 'ai-1', roleName: 'AI/ML Engineer', alignment: 'Critical', matchPercentage: 95, demandScore: 10 },
      { roleId: 'cloud-1', roleName: 'DevOps Engineer', alignment: 'Strong', matchPercentage: 80, demandScore: 8 }
    ]
  },
  {
    skillId: 'skill-39', // Data Engineering
    skillName: 'Data Engineering',
    roles: [
      { roleId: 'ai-2', roleName: 'Data Scientist', alignment: 'Strong', matchPercentage: 85, demandScore: 8 },
      { roleId: 'cloud-2', roleName: 'Cloud Architect', alignment: 'Medium', matchPercentage: 65, demandScore: 7 }
    ]
  },
  {
    skillId: 'skill-40', // Product Thinking
    skillName: 'Product Thinking',
    roles: [
      { roleId: 'design-2', roleName: 'Product Designer', alignment: 'Critical', matchPercentage: 95, demandScore: 9 },
      { roleId: 'sde-3', roleName: 'Full Stack Engineer', alignment: 'Medium', matchPercentage: 60, demandScore: 6 }
    ]
  }
];

// ROLE → SKILL MAPPING (reverse direction)
export const roleSkillMappings: RoleSkillMapping[] = [
  {
    roleId: 'sde-3', // Full Stack Engineer
    roleName: 'Full Stack Engineer',
    requiredSkills: [
      { skillId: 'skill-1', skillName: 'Next.js', priority: 'Critical', proficiencyLevel: 'Advanced' },
      { skillId: 'skill-7', skillName: 'TypeScript', priority: 'Critical', proficiencyLevel: 'Advanced' },
      { skillId: 'skill-4', skillName: 'Python', priority: 'Important', proficiencyLevel: 'Intermediate' },
      { skillId: 'skill-8', skillName: 'Docker', priority: 'Important', proficiencyLevel: 'Intermediate' },
      { skillId: 'skill-3', skillName: 'AI Engineering', priority: 'Nice to Have', proficiencyLevel: 'Beginner' }
    ]
  },
  {
    roleId: 'ai-1', // AI/ML Engineer
    roleName: 'AI/ML Engineer',
    requiredSkills: [
      { skillId: 'skill-4', skillName: 'Python', priority: 'Critical', proficiencyLevel: 'Advanced' },
      { skillId: 'skill-3', skillName: 'AI Engineering', priority: 'Critical', proficiencyLevel: 'Advanced' },
      { skillId: 'skill-9', skillName: 'LangChain', priority: 'Important', proficiencyLevel: 'Intermediate' },
      { skillId: 'skill-8', skillName: 'Docker', priority: 'Important', proficiencyLevel: 'Intermediate' }
    ]
  },
  {
    roleId: 'cloud-1', // DevOps Engineer
    roleName: 'DevOps Engineer',
    requiredSkills: [
      { skillId: 'skill-6', skillName: 'Kubernetes', priority: 'Critical', proficiencyLevel: 'Advanced' },
      { skillId: 'skill-8', skillName: 'Docker', priority: 'Critical', proficiencyLevel: 'Advanced' },
      { skillId: 'skill-10', skillName: 'Go', priority: 'Important', proficiencyLevel: 'Intermediate' },
      { skillId: 'skill-4', skillName: 'Python', priority: 'Important', proficiencyLevel: 'Intermediate' }
    ]
  },
  {
    roleId: 'sde-1', // Frontend Engineer
    roleName: 'Frontend Engineer',
    requiredSkills: [
      { skillId: 'skill-2', skillName: 'React', priority: 'Critical', proficiencyLevel: 'Advanced' },
      { skillId: 'skill-7', skillName: 'TypeScript', priority: 'Critical', proficiencyLevel: 'Advanced' },
      { skillId: 'skill-1', skillName: 'Next.js', priority: 'Important', proficiencyLevel: 'Intermediate' },
      { skillId: 'skill-29', skillName: 'Tailwind CSS', priority: 'Important', proficiencyLevel: 'Intermediate' },
      { skillId: 'skill-26', skillName: 'Web Accessibility (a11y)', priority: 'Nice to Have', proficiencyLevel: 'Beginner' }
    ]
  },
  {
    roleId: 'sde-2', // Backend Engineer
    roleName: 'Backend Engineer',
    requiredSkills: [
      { skillId: 'skill-13', skillName: 'Node.js', priority: 'Critical', proficiencyLevel: 'Advanced' },
      { skillId: 'skill-16', skillName: 'PostgreSQL', priority: 'Critical', proficiencyLevel: 'Advanced' },
      { skillId: 'skill-28', skillName: 'Prisma ORM', priority: 'Important', proficiencyLevel: 'Intermediate' },
      { skillId: 'skill-19', skillName: 'Redis', priority: 'Important', proficiencyLevel: 'Intermediate' },
      { skillId: 'skill-32', skillName: 'System Design', priority: 'Nice to Have', proficiencyLevel: 'Beginner' }
    ]
  },
  {
    roleId: 'cloud-3', // Site Reliability Engineer
    roleName: 'Site Reliability Engineer',
    requiredSkills: [
      { skillId: 'skill-6', skillName: 'Kubernetes', priority: 'Critical', proficiencyLevel: 'Advanced' },
      { skillId: 'skill-33', skillName: 'Linux', priority: 'Critical', proficiencyLevel: 'Advanced' },
      { skillId: 'skill-35', skillName: 'Observability & Monitoring', priority: 'Important', proficiencyLevel: 'Intermediate' },
      { skillId: 'skill-18', skillName: 'CI/CD Pipelines', priority: 'Important', proficiencyLevel: 'Intermediate' }
    ]
  },
  {
    roleId: 'cloud-2', // Cloud Architect
    roleName: 'Cloud Architect',
    requiredSkills: [
      { skillId: 'skill-17', skillName: 'AWS', priority: 'Critical', proficiencyLevel: 'Advanced' },
      { skillId: 'skill-32', skillName: 'System Design', priority: 'Critical', proficiencyLevel: 'Advanced' },
      { skillId: 'skill-6', skillName: 'Kubernetes', priority: 'Important', proficiencyLevel: 'Intermediate' },
      { skillId: 'skill-38', skillName: 'MLOps', priority: 'Nice to Have', proficiencyLevel: 'Beginner' }
    ]
  },
  {
    roleId: 'ai-2', // Data Scientist
    roleName: 'Data Scientist',
    requiredSkills: [
      { skillId: 'skill-4', skillName: 'Python', priority: 'Critical', proficiencyLevel: 'Advanced' },
      { skillId: 'skill-21', skillName: 'Machine Learning', priority: 'Critical', proficiencyLevel: 'Advanced' },
      { skillId: 'skill-22', skillName: 'TensorFlow', priority: 'Important', proficiencyLevel: 'Intermediate' },
      { skillId: 'skill-39', skillName: 'Data Engineering', priority: 'Important', proficiencyLevel: 'Intermediate' }
    ]
  },
  {
    roleId: 'mobile-1', // Mobile App Developer
    roleName: 'Mobile App Developer',
    requiredSkills: [
      { skillId: 'skill-23', skillName: 'React Native', priority: 'Critical', proficiencyLevel: 'Advanced' },
      { skillId: 'skill-11', skillName: 'Flutter', priority: 'Important', proficiencyLevel: 'Intermediate' },
      { skillId: 'skill-24', skillName: 'Android Development', priority: 'Important', proficiencyLevel: 'Intermediate' }
    ]
  },
  {
    roleId: 'design-1', // UI/UX Designer
    roleName: 'UI/UX Designer',
    requiredSkills: [
      { skillId: 'skill-12', skillName: 'Figma', priority: 'Critical', proficiencyLevel: 'Advanced' },
      { skillId: 'skill-25', skillName: 'UI/UX Design', priority: 'Critical', proficiencyLevel: 'Advanced' },
      { skillId: 'skill-40', skillName: 'Product Thinking', priority: 'Important', proficiencyLevel: 'Intermediate' },
      { skillId: 'skill-26', skillName: 'Web Accessibility (a11y)', priority: 'Nice to Have', proficiencyLevel: 'Beginner' }
    ]
  },
  {
    roleId: 'design-2', // Product Designer
    roleName: 'Product Designer',
    requiredSkills: [
      { skillId: 'skill-25', skillName: 'UI/UX Design', priority: 'Critical', proficiencyLevel: 'Advanced' },
      { skillId: 'skill-40', skillName: 'Product Thinking', priority: 'Critical', proficiencyLevel: 'Advanced' },
      { skillId: 'skill-12', skillName: 'Figma', priority: 'Important', proficiencyLevel: 'Intermediate' }
    ]
  }

];

// ============================================
// SECTION 4: EFFORT VS REWARD DATA
// ============================================

export const effortRewardData: EffortRewardData[] = [
  {
    skillId: 'skill-1',
    skillName: 'Next.js',
    slug: 'nextjs',
    effortLevel: 4, // Moderate effort
    demandLevel: 9, // Very high demand
    roi: 'High',
    learningMonths: 3,
    jobOpenings: 18000,
    avgSalary: '$125k',
    category: 'Frontend'
  },
  {
    skillId: 'skill-2',
    skillName: 'React',
    slug: 'react',
    effortLevel: 3,
    demandLevel: 8,
    roi: 'High',
    learningMonths: 2,
    jobOpenings: 25000,
    avgSalary: '$120k',
    category: 'Frontend'
  },
  {
    skillId: 'skill-3',
    skillName: 'AI Engineering',
    slug: 'ai-engineering',
    effortLevel: 8, // High effort
    demandLevel: 10, // Extreme demand
    roi: 'High',
    learningMonths: 6,
    jobOpenings: 16000,
    avgSalary: '$160k',
    category: 'AI/ML'
  },
  {
    skillId: 'skill-4',
    skillName: 'Python',
    slug: 'python',
    effortLevel: 2, // Easy to learn
    demandLevel: 9,
    roi: 'High',
    learningMonths: 2,
    jobOpenings: 30000,
    avgSalary: '$130k',
    category: 'Backend'
  },
  {
    skillId: 'skill-5',
    skillName: 'Rust',
    slug: 'rust',
    effortLevel: 9, // Very difficult
    demandLevel: 7, // Good demand
    roi: 'Medium',
    learningMonths: 8,
    jobOpenings: 5000,
    avgSalary: '$145k',
    category: 'Backend'
  },
  {
    skillId: 'skill-6',
    skillName: 'Kubernetes',
    slug: 'kubernetes',
    effortLevel: 7,
    demandLevel: 9,
    roi: 'High',
    learningMonths: 4,
    jobOpenings: 14000,
    avgSalary: '$138k',
    category: 'DevOps'
  },
  {
    skillId: 'skill-7',
    skillName: 'TypeScript',
    slug: 'typescript',
    effortLevel: 4,
    demandLevel: 9,
    roi: 'High',
    learningMonths: 2,
    jobOpenings: 22000,
    avgSalary: '$135k',
    category: 'Frontend'
  },
  {
    skillId: 'skill-8',
    skillName: 'Docker',
    slug: 'docker',
    effortLevel: 5,
    demandLevel: 8.5,
    roi: 'High',
    learningMonths: 1.5,
    jobOpenings: 19000,
    avgSalary: '$140k',
    category: 'DevOps'
  },
  {
    skillId: 'skill-9',
    skillName: 'Java',
    slug: 'java',
    effortLevel: 6,
    demandLevel: 9,
    roi: 'Medium', // High jobs but lower growth than AI
    learningMonths: 5,
    jobOpenings: 45000,
    avgSalary: '$125k',
    category: 'Backend'
  },
  {
    skillId: 'skill-10',
    skillName: 'Go',
    slug: 'go',
    effortLevel: 6,
    demandLevel: 7.5,
    roi: 'High',
    learningMonths: 3,
    jobOpenings: 8000,
    avgSalary: '$150k',
    category: 'Backend'
  },
  {
    skillId: 'skill-11',
    skillName: 'AWS',
    slug: 'aws',
    effortLevel: 7,
    demandLevel: 10,
    roi: 'High',
    learningMonths: 6,
    jobOpenings: 35000,
    avgSalary: '$145k',
    category: 'DevOps'
  },
  {
    skillId: 'skill-12',
    skillName: 'Flutter',
    slug: 'flutter',
    effortLevel: 5,
    demandLevel: 6,
    roi: 'Medium',
    learningMonths: 3,
    jobOpenings: 6000,
    avgSalary: '$115k',
    category: 'Mobile'
  },
  {
    skillId: 'skill-13',
    skillName: 'Figma',
    slug: 'figma',
    effortLevel: 3,
    demandLevel: 8,
    roi: 'High',
    learningMonths: 2,
    jobOpenings: 12000,
    avgSalary: '$105k',
    category: 'Design'
  },
  {
    skillId: 'skill-14',
    skillName: 'LangChain',
    slug: 'langchain',
    effortLevel: 6,
    demandLevel: 9.5,
    roi: 'High',
    learningMonths: 2,
    jobOpenings: 4000,
    avgSalary: '$165k',
    category: 'AI/ML'
  },
  {
    skillId: 'skill-15',
    skillName: 'Node.js',
    slug: 'nodejs',
    effortLevel: 4,
    demandLevel: 9,
    roi: 'High',
    learningMonths: 3,
    jobOpenings: 28000,
    avgSalary: '$130k',
    category: 'Backend'
  },
  {
    skillId: 'skill-16',
    skillName: 'Express.js',
    slug: 'expressjs',
    effortLevel: 3,
    demandLevel: 8,
    roi: 'High',
    learningMonths: 1.5,
    jobOpenings: 20000,
    avgSalary: '$120k',
    category: 'Backend'
  },
  {
    skillId: 'skill-17',
    skillName: 'MongoDB',
    slug: 'mongodb',
    effortLevel: 4,
    demandLevel: 8,
    roi: 'High',
    learningMonths: 2,
    jobOpenings: 21000,
    avgSalary: '$125k',
    category: 'Backend'
  },
  {
    skillId: 'skill-18',
    skillName: 'PostgreSQL',
    slug: 'postgresql',
    effortLevel: 5,
    demandLevel: 8.5,
    roi: 'High',
    learningMonths: 3,
    jobOpenings: 18000,
    avgSalary: '$132k',
    category: 'Backend'
  },
  {
    skillId: 'skill-19',
    skillName: 'Redis',
    slug: 'redis',
    effortLevel: 4,
    demandLevel: 7.5,
    roi: 'High',
    learningMonths: 1.5,
    jobOpenings: 11000,
    avgSalary: '$138k',
    category: 'Backend'
  },
  {
    skillId: 'skill-20',
    skillName: 'GraphQL',
    slug: 'graphql',
    effortLevel: 5,
    demandLevel: 7.5,
    roi: 'Medium',
    learningMonths: 2,
    jobOpenings: 9000,
    avgSalary: '$130k',
    category: 'Backend'
  },
  {
    skillId: 'skill-21',
    skillName: 'System Design',
    slug: 'system-design',
    effortLevel: 7,
    demandLevel: 9,
    roi: 'High',
    learningMonths: 6,
    jobOpenings: 15000,
    avgSalary: '$155k',
    category: 'Backend'
  },
  {
    skillId: 'skill-22',
    skillName: 'CI/CD Pipelines',
    slug: 'ci-cd',
    effortLevel: 5,
    demandLevel: 8.5,
    roi: 'High',
    learningMonths: 2,
    jobOpenings: 17000,
    avgSalary: '$140k',
    category: 'DevOps'
  },
  {
    skillId: 'skill-23',
    skillName: 'Linux',
    slug: 'linux',
    effortLevel: 4,
    demandLevel: 8,
    roi: 'High',
    learningMonths: 2,
    jobOpenings: 20000,
    avgSalary: '$135k',
    category: 'DevOps'
  },
  {
    skillId: 'skill-24',
    skillName: 'Nginx',
    slug: 'nginx',
    effortLevel: 3,
    demandLevel: 7,
    roi: 'Medium',
    learningMonths: 1,
    jobOpenings: 9000,
    avgSalary: '$125k',
    category: 'DevOps'
  },
  {
    skillId: 'skill-25',
    skillName: 'Terraform',
    slug: 'terraform',
    effortLevel: 6,
    demandLevel: 8.5,
    roi: 'High',
    learningMonths: 3,
    jobOpenings: 8000,
    avgSalary: '$150k',
    category: 'DevOps'
  },
  {
    skillId: 'skill-26',
    skillName: 'Machine Learning',
    slug: 'machine-learning',
    effortLevel: 7,
    demandLevel: 9.5,
    roi: 'High',
    learningMonths: 5,
    jobOpenings: 22000,
    avgSalary: '$155k',
    category: 'AI/ML'
  },
  {
    skillId: 'skill-27',
    skillName: 'TensorFlow',
    slug: 'tensorflow',
    effortLevel: 6,
    demandLevel: 8,
    roi: 'High',
    learningMonths: 4,
    jobOpenings: 12000,
    avgSalary: '$150k',
    category: 'AI/ML'
  },
  {
    skillId: 'skill-28',
    skillName: 'PyTorch',
    slug: 'pytorch',
    effortLevel: 6,
    demandLevel: 8.5,
    roi: 'High',
    learningMonths: 4,
    jobOpenings: 14000,
    avgSalary: '$155k',
    category: 'AI/ML'
  },
  {
    skillId: 'skill-29',
    skillName: 'MLOps',
    slug: 'mlops',
    effortLevel: 8,
    demandLevel: 9,
    roi: 'High',
    learningMonths: 6,
    jobOpenings: 7000,
    avgSalary: '$165k',
    category: 'AI/ML'
  },
  {
    skillId: 'skill-30',
    skillName: 'Vector Databases',
    slug: 'vector-databases',
    effortLevel: 6,
    demandLevel: 8.5,
    roi: 'High',
    learningMonths: 2,
    jobOpenings: 3500,
    avgSalary: '$160k',
    category: 'AI/ML'
  },
  {
    skillId: 'skill-31',
    skillName: 'React Native',
    slug: 'react-native',
    effortLevel: 5,
    demandLevel: 7,
    roi: 'Medium',
    learningMonths: 3,
    jobOpenings: 10000,
    avgSalary: '$120k',
    category: 'Mobile'
  },
  {
    skillId: 'skill-32',
    skillName: 'Android Development',
    slug: 'android',
    effortLevel: 6,
    demandLevel: 7.5,
    roi: 'Medium',
    learningMonths: 4,
    jobOpenings: 14000,
    avgSalary: '$125k',
    category: 'Mobile'
  },
  {
    skillId: 'skill-33',
    skillName: 'iOS Development',
    slug: 'ios',
    effortLevel: 7,
    demandLevel: 7,
    roi: 'Medium',
    learningMonths: 5,
    jobOpenings: 11000,
    avgSalary: '$135k',
    category: 'Mobile'
  },
  {
    skillId: 'skill-34',
    skillName: 'UI/UX Design',
    slug: 'ui-ux-design',
    effortLevel: 4,
    demandLevel: 8,
    roi: 'High',
    learningMonths: 3,
    jobOpenings: 16000,
    avgSalary: '$110k',
    category: 'Design'
  },
  {
    skillId: 'skill-35',
    skillName: 'Product Thinking',
    slug: 'product-thinking',
    effortLevel: 5,
    demandLevel: 7.5,
    roi: 'High',
    learningMonths: 3,
    jobOpenings: 9000,
    avgSalary: '$120k',
    category: 'Design'
  },
  {
    skillId: 'skill-36',
    skillName: 'Web Accessibility',
    slug: 'web-accessibility',
    effortLevel: 3,
    demandLevel: 6.5,
    roi: 'Medium',
    learningMonths: 1.5,
    jobOpenings: 5000,
    avgSalary: '$115k',
    category: 'Design'
  },
  {
    skillId: 'skill-37',
    skillName: 'Git',
    slug: 'git',
    effortLevel: 2,
    demandLevel: 9,
    roi: 'High',
    learningMonths: 1,
    jobOpenings: 50000,
    avgSalary: '$120k',
    category: 'Tools'
  },
  {
    skillId: 'skill-38',
    skillName: 'REST APIs',
    slug: 'rest-apis',
    effortLevel: 3,
    demandLevel: 9,
    roi: 'High',
    learningMonths: 2,
    jobOpenings: 30000,
    avgSalary: '$125k',
    category: 'Backend'
  },
  {
    skillId: 'skill-39',
    skillName: 'WebSockets',
    slug: 'websockets',
    effortLevel: 4,
    demandLevel: 7,
    roi: 'Medium',
    learningMonths: 2,
    jobOpenings: 6000,
    avgSalary: '$135k',
    category: 'Backend'
  },
  {
    skillId: 'skill-40',
    skillName: 'Prompt Engineering',
    slug: 'prompt-engineering',
    effortLevel: 3,
    demandLevel: 9,
    roi: 'High',
    learningMonths: 1,
    jobOpenings: 8000,
    avgSalary: '$170k',
    category: 'AI/ML'
  }


];

// ============================================
// SECTION 5: MARKET INSIGHTS
// ============================================

export const marketInsights: MarketInsight[] = [
  {
    id: 'insight-1',
    type: 'trend',
    title: 'The Full Stack + AI Shift',
    description: 'AI API integration skills are becoming mandatory for Full Stack developers. Pure frontend-only roles are declining by 12% while Full Stack + AI roles grew 68% in Q4 2024.',
    relatedSkills: ['skill-1', 'skill-3', 'skill-9'], // Next.js, AI Engineering, LangChain
    impact: 'High',
    timeframe: 'Q1 2025'
  },
  {
    id: 'insight-2',
    type: 'warning',
    title: 'Oversaturated Entry-Level Market',
    description: 'Entry-level React-only positions now average 500+ applicants per job. Differentiation through TypeScript, Next.js, or backend skills is critical.',
    relatedSkills: ['skill-2', 'skill-7', 'skill-1'], // React, TypeScript, Next.js
    impact: 'High',
    timeframe: 'Current'
  },
  {
    id: 'insight-3',
    type: 'opportunity',
    title: 'Rust for Infrastructure Boom',
    description: 'Rust adoption in tooling and WebAssembly is seeing 58% YoY growth. Companies like Vercel, Cloudflare, and AWS are heavily investing.',
    relatedSkills: ['skill-5'], // Rust
    impact: 'Medium',
    timeframe: 'Next 12 months'
  },
  {
    id: 'insight-4',
    type: 'trend',
    title: 'Backend + Cloud = Premium Combo',
    description: 'Backend engineers with Kubernetes/Docker skills command 35% higher salaries than pure backend roles. Cloud-native is the new standard.',
    relatedSkills: ['skill-4', 'skill-10', 'skill-6', 'skill-8'], // Python, Go, K8s, Docker
    impact: 'High',
    timeframe: 'Current'
  },
  {
    id: 'insight-5',
    type: 'warning',
    title: 'Mobile Development Plateau',
    description: 'Native mobile development roles are growing slower (6% YoY) compared to web (28% YoY). Cross-platform and web-first strategies dominate.',
    relatedSkills: ['skill-11'], // Flutter
    impact: 'Medium',
    timeframe: 'Next 6 months'
  },
  {
    id: 'insight-6',
    type: 'opportunity',
    title: 'Design Systems Engineering',
    description: 'Hybrid roles combining Figma expertise with React/TypeScript are emerging. 35% salary premium over traditional UI/UX roles.',
    relatedSkills: ['skill-12', 'skill-2', 'skill-7'], // Figma, React, TypeScript
    impact: 'Medium',
    timeframe: 'Q2 2025'
  },
  {
    id: 'insight-7',
    type: 'trend',
    title: 'LangChain Explosion',
    description: 'LangChain job postings increased 92% in the last quarter. Early adopters are securing premium positions in AI-first companies.',
    relatedSkills: ['skill-9', 'skill-4'], // LangChain, Python
    impact: 'High',
    timeframe: 'Current'
  },
  {
    id: 'insight-8',
    type: 'opportunity',
    title: 'Security Skills Gap',
    description: 'Security engineering roles growing 52% YoY but talent pool growing only 18%. Massive opportunity for career switchers.',
    relatedSkills: ['skill-5', 'skill-10'], // Rust, Go (common in security)
    impact: 'High',
    timeframe: 'Next 18 months'
  },
  {
    id: 'insight-9',
    type: 'trend',
    title: 'TypeScript Now Standard',
    description: '89% of new frontend job postings require TypeScript. Pure JavaScript roles are becoming rare in enterprise.',
    relatedSkills: ['skill-7', 'skill-2', 'skill-1'], // TypeScript, React, Next.js
    impact: 'High',
    timeframe: 'Current'
  }
];

// Helper function to get skill by ID
export function getSkillById(skillId: string): TrendingSkill | undefined {
  return trendingSkills.find(skill => skill.id === skillId);
}

// Helper function to get role category by ID
export function getRoleCategoryById(categoryId: string): IndustryRole | undefined {
  return industryRoles.find(role => role.id === categoryId);
}

// Helper function to get insights by type
export function getInsightsByType(type: 'trend' | 'warning' | 'opportunity'): MarketInsight[] {
  return marketInsights.filter(insight => insight.type === type);
}
