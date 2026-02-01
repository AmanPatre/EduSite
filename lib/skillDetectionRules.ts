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
    "Svelte": { name: "Svelte", category: "Frontend", github: { query: 'svelte language:JavaScript' }, youtube: "svelte tutorial" },
    "TypeScript": { name: "TypeScript", category: "Frontend", github: { query: 'language:TypeScript' }, youtube: "typescript tutorial" },
    "Tailwind CSS": { name: "Tailwind CSS", category: "Frontend", github: { query: 'tailwindcss' }, youtube: "tailwind css tutorial" },
    "Redux": { name: "Redux", category: "Frontend", github: { query: 'redux language:TypeScript' }, youtube: "redux toolkit tutorial" },
    "Three.js": { name: "Three.js", category: "Frontend", github: { query: 'threejs' }, youtube: "threejs tutorial" },
    "HTML/CSS": { name: "HTML/CSS", category: "Frontend", github: { query: 'html css' }, youtube: "html css absolute beginner" },

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
    "Express.js": { name: "Express.js", category: "Backend", github: { query: 'expressjs' }, youtube: "expressjs tutorial" },
    "GraphQL": { name: "GraphQL", category: "Backend", github: { query: 'graphql' }, youtube: "graphql tutorial" },
    "NestJS": { name: "NestJS", category: "Backend", github: { query: 'nestjs' }, youtube: "nestjs tutorial" },

    // ====================
    // 3. DEVOPS / CLOUD
    // ====================
    "Docker": { name: "Docker", category: "DevOps", github: { query: 'docker' }, youtube: "docker tutorial" },
    "Kubernetes": { name: "Kubernetes", category: "DevOps", github: { query: 'kubernetes' }, youtube: "kubernetes tutorial" },
    "AWS": { name: "AWS", category: "DevOps", github: { query: 'aws' }, youtube: "aws certified cloud practitioner" },
    "Azure": { name: "Azure", category: "DevOps", github: { query: 'azure' }, youtube: "microsoft azure tutorial" },
    "Google Cloud": { name: "Google Cloud", category: "DevOps", github: { query: 'gcp' }, youtube: "google cloud platform tutorial" },
    "Terraform": { name: "Terraform", category: "DevOps", github: { query: 'terraform' }, youtube: "terraform tutorial" },
    "Ansible": { name: "Ansible", category: "DevOps", github: { query: 'ansible' }, youtube: "ansible tutorial" },
    "Jenkins": { name: "Jenkins", category: "DevOps", github: { query: 'jenkins' }, youtube: "jenkins ci cd tutorial" },
    "Linux": { name: "Linux", category: "DevOps", github: { query: 'linux' }, youtube: "linux for developers" },
    "Nginx": { name: "Nginx", category: "DevOps", github: { query: 'nginx' }, youtube: "nginx tutorial" },

    // ====================
    // 4. AI / ML / DATA
    // ====================
    "Machine Learning": { name: "Machine Learning", category: "AI/ML", github: { query: 'machine-learning' }, youtube: "machine learning course" },
    "Generative AI": { name: "Generative AI", category: "AI/ML", github: { query: 'generative-ai' }, youtube: "generative ai llm" },
    "TensorFlow": { name: "TensorFlow", category: "AI/ML", github: { query: 'tensorflow' }, youtube: "tensorflow tutorial" },
    "PyTorch": { name: "PyTorch", category: "AI/ML", github: { query: 'pytorch' }, youtube: "pytorch tutorial" },
    "LangChain": { name: "LangChain", category: "AI/ML", github: { query: 'langchain' }, youtube: "langchain tutorial" },
    "OpenCV": { name: "OpenCV", category: "AI/ML", github: { query: 'opencv' }, youtube: "opencv python" },
    "NLP": { name: "NLP", category: "AI/ML", github: { query: 'nlp' }, youtube: "natural language processing" },
    "Pandas": { name: "Pandas", category: "AI/ML", github: { query: 'pandas' }, youtube: "pandas python data science" },
    "Hugging Face": { name: "Hugging Face", category: "AI/ML", github: { query: 'huggingface' }, youtube: "hugging face transformers" },
    "Data Science": { name: "Data Science", category: "AI/ML", github: { query: 'data-science' }, youtube: "data science roadmap" },

    // ====================
    // 5. MOBILE
    // ====================
    "React Native": { name: "React Native", category: "Mobile", github: { query: 'react-native' }, youtube: "react native tutorial" },
    "Flutter": { name: "Flutter", category: "Mobile", github: { query: 'flutter' }, youtube: "flutter tutorial" },
    "Swift": { name: "Swift", category: "Mobile", github: { query: 'language:Swift' }, youtube: "swift ios tutorial" },
    "Kotlin": { name: "Kotlin", category: "Mobile", github: { query: 'language:Kotlin' }, youtube: "kotlin android tutorial" },
    "Ionic": { name: "Ionic", category: "Mobile", github: { query: 'ionic' }, youtube: "ionic framework tutorial" },
    "Expo": { name: "Expo", category: "Mobile", github: { query: 'expo' }, youtube: "react native expo tutorial" },
    "Dart": { name: "Dart", category: "Mobile", github: { query: 'language:Dart' }, youtube: "dart programming language" },
    "Objective-C": { name: "Objective-C", category: "Mobile", github: { query: 'language:Objective-C' }, youtube: "objective c tutorial" },
    "Jetpack Compose": { name: "Jetpack Compose", category: "Mobile", github: { query: 'jetpack compose' }, youtube: "android jetpack compose" },
    "SwiftUI": { name: "SwiftUI", category: "Mobile", github: { query: 'swiftui' }, youtube: "swiftui tutorial" },

    // ====================
    // 6. DESIGN
    // ====================
    "Figma": { name: "Figma", category: "Design", github: { query: 'figma' }, youtube: "figma tutorial" },
    "UI/UX": { name: "UI/UX", category: "Design", github: { query: 'ui-ux' }, youtube: "ui ux design course" },
    "Adobe XD": { name: "Adobe XD", category: "Design", github: { query: 'adobe-xd' }, youtube: "adobe xd tutorial" },
    "Photoshop": { name: "Photoshop", category: "Design", github: { query: 'photoshop' }, youtube: "photoshop web design" },
    "Blender": { name: "Blender", category: "Design", github: { query: 'topic:blender' }, youtube: "blender 3d tutorial" },
    "Canva": { name: "Canva", category: "Design", github: { query: 'canva' }, youtube: "canva design tutorial" },
    "Sketch": { name: "Sketch", category: "Design", github: { query: 'sketch-app' }, youtube: "sketch app tutorial" },
    "Webflow": { name: "Webflow", category: "Design", github: { query: 'webflow' }, youtube: "webflow tutorial" },
    "Framer": { name: "Framer", category: "Design", github: { query: 'framer' }, youtube: "framer motion tutorial" },
    "Prototyping": { name: "Prototyping", category: "Design", github: { query: 'prototyping' }, youtube: "ui prototyping tutorial" }
};

export const skillCategories = {
    "Frontend": ["React", "Next.js", "Vue.js", "Angular", "Svelte", "TypeScript", "Tailwind CSS", "Redux", "Three.js", "HTML/CSS"],
    "Backend": ["Node.js", "Python", "Go", "Java", "C#", "Rust", "PHP", "Express.js", "GraphQL", "NestJS"],
    "DevOps": ["Docker", "Kubernetes", "AWS", "Azure", "Google Cloud", "Terraform", "Ansible", "Jenkins", "Linux", "Nginx"],
    "AI/ML": ["Machine Learning", "Generative AI", "TensorFlow", "PyTorch", "LangChain", "OpenCV", "NLP", "Pandas", "Hugging Face", "Data Science"],
    "Mobile": ["React Native", "Flutter", "Swift", "Kotlin", "Ionic", "Expo", "Dart", "Objective-C", "Jetpack Compose", "SwiftUI"],
    "Design": ["Figma", "UI/UX", "Adobe XD", "Photoshop", "Blender", "Canva", "Sketch", "Webflow", "Framer", "Prototyping"]
};
