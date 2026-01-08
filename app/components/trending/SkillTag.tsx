// ============================================
// SKILL TAG COMPONENT
// ============================================
// Clickable skill tag used throughout the dashboard
// Links to individual skill pages

import React from 'react';
import Link from 'next/link';

interface SkillTagProps {
    skillName: string;
    slug: string;
    size?: 'sm' | 'md';
    variant?: 'default' | 'outlined';
}

export default function SkillTag({
    skillName,
    slug,
    size = 'sm',
    variant = 'default'
}: SkillTagProps) {
    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm'
    };

    const variantClasses = {
        default: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
        outlined: 'bg-transparent text-slate-400 border-slate-700 hover:border-blue-500/50 hover:text-blue-400'
    };

    return (
        <Link
            href={`/trending/${slug}`}
            className={`
        inline-flex items-center gap-1 rounded-md border font-medium
        transition-all duration-200
        ${sizeClasses[size]}
        ${variantClasses[variant]}
      `}
        >
            {skillName}
        </Link>
    );
}
