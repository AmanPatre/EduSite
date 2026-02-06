export interface SkillRule {
    name: string;
    category: 'Frontend' | 'Backend' | 'DevOps' | 'AI/ML' | 'Mobile' | 'Design';
    github: {
        query: string;
    };
    youtube: string;
}

export const skillDetectionRules: Record<string, SkillRule> = {
    // ====================
    // 1. FRONTEND
    // ====================
    "React": { name: "React", category: "Frontend", github: { query: 'react language:TypeScript' }, youtube: "react tutorial" },
    "Next.js": { name: "Next.js", category: "Frontend", github: { query: 'nextjs language:TypeScript' }, youtube: "nextjs tutorial" },
    "Vue.js": { name: "Vue.js", category: "Frontend", github: { query: 'vue language:TypeScript' }, youtube: "vuejs tutorial" },
    "Angular": { name: "Angular", category: "Frontend", github: { query: 'angular language:TypeScript' }, youtube: "angular tutorial" },
    "TypeScript": { name: "TypeScript", category: "Frontend", github: { query: 'language:TypeScript' }, youtube: "typescript tutorial" },
    "Tailwind CSS": { name: "Tailwind CSS", category: "Frontend", github: { query: 'tailwindcss' }, youtube: "tailwind css tutorial" },
    "Redux": { name: "Redux", category: "Frontend", github: { query: 'redux language:TypeScript' }, youtube: "redux toolkit tutorial" },
    "Three.js": { name: "Three.js", category: "Frontend", github: { query: 'threejs' }, youtube: "threejs tutorial" },

    // ====================
    // 2. BACKEND
    // ====================
    "Node.js": { name: "Node.js", category: "Backend", github: { query: 'nodejs language:JavaScript' }, youtube: "nodejs tutorial" },
    "Python": { name: "Python", category: "Backend", github: { query: 'language:Python' }, youtube: "python programming" },
    "Go": { name: "Go", category: "Backend", github: { query: 'language:Go' }, youtube: "golang tutorial" },
    "Java": { name: "Java", category: "Backend", github: { query: 'language:Java' }, youtube: "java spring boot tutorial" },
    "C#": { name: "C#", category: "Backend", github: { query: 'language:C#' }, youtube: "c# generic host .net" },
    "Rust": { name: "Rust", category: "Backend", github: { query: 'language:Rust' }, youtube: "rust lang tutorial" },
    "PHP": { name: "PHP", category: "Backend", github: { query: 'language:PHP' }, youtube: "php laravel tutorial" },
    "NestJS": { name: "NestJS", category: "Backend", github: { query: 'nestjs' }, youtube: "nestjs tutorial" },

    // ====================
    // 3. DEVOPS
    // ====================
    "Docker": { name: "Docker", category: "DevOps", github: { query: 'docker' }, youtube: "docker tutorial" },
    "Kubernetes": { name: "Kubernetes", category: "DevOps", github: { query: 'kubernetes' }, youtube: "kubernetes tutorial" },
    "AWS": { name: "AWS", category: "DevOps", github: { query: 'aws' }, youtube: "aws certified cloud practitioner" },
    "Azure": { name: "Azure", category: "DevOps", github: { query: 'azure' }, youtube: "microsoft azure tutorial" },
    "Terraform": { name: "Terraform", category: "DevOps", github: { query: 'terraform' }, youtube: "terraform tutorial" },
    "Linux": { name: "Linux", category: "DevOps", github: { query: 'linux' }, youtube: "linux for developers" },

    // ====================
    // 4. AI/ML
    // ====================
    "Machine Learning": { name: "Machine Learning", category: "AI/ML", github: { query: 'machine-learning' }, youtube: "machine learning course" },
    "Generative AI": { name: "Generative AI", category: "AI/ML", github: { query: 'generative-ai' }, youtube: "generative ai llm" },
    "TensorFlow": { name: "TensorFlow", category: "AI/ML", github: { query: 'tensorflow' }, youtube: "tensorflow tutorial" },
    "PyTorch": { name: "PyTorch", category: "AI/ML", github: { query: 'pytorch' }, youtube: "pytorch tutorial" },
    "LangChain": { name: "LangChain", category: "AI/ML", github: { query: 'langchain' }, youtube: "langchain tutorial" },
    "OpenCV": { name: "OpenCV", category: "AI/ML", github: { query: 'opencv' }, youtube: "opencv python" },
    "Data Science": { name: "Data Science", category: "AI/ML", github: { query: 'data-science' }, youtube: "data science roadmap" },

    // ====================
    // 5. MOBILE
    // ====================
    "React Native": { name: "React Native", category: "Mobile", github: { query: 'react-native' }, youtube: "react native tutorial" },
    "Flutter": { name: "Flutter", category: "Mobile", github: { query: 'flutter' }, youtube: "flutter tutorial" },
    "Swift": { name: "Swift", category: "Mobile", github: { query: 'language:Swift' }, youtube: "swift ios tutorial" },
    "Kotlin": { name: "Kotlin", category: "Mobile", github: { query: 'language:Kotlin' }, youtube: "kotlin android tutorial" },

    // ====================
    // 6. DESIGN
    // ====================
    "Figma": { name: "Figma", category: "Design", github: { query: 'figma' }, youtube: "figma tutorial" },
    "UI/UX": { name: "UI/UX", category: "Design", github: { query: 'ui-ux' }, youtube: "ui ux design course" },
    "Blender": { name: "Blender", category: "Design", github: { query: 'topic:blender' }, youtube: "blender 3d tutorial" }
};

export const skillCategories = {
    "Frontend": ["React", "Next.js", "Vue.js", "Angular", "TypeScript", "Tailwind CSS", "Redux", "Three.js"],
    "Backend": ["Node.js", "Python", "Go", "Java", "C#", "Rust", "PHP", "NestJS"],
    "DevOps": ["Docker", "Kubernetes", "AWS", "Azure", "Terraform", "Linux"],
    "AI/ML": ["Machine Learning", "Generative AI", "TensorFlow", "PyTorch", "LangChain", "OpenCV", "Data Science"],
    "Mobile": ["React Native", "Flutter", "Swift", "Kotlin"],
    "Design": ["Figma", "UI/UX", "Blender"]
};
