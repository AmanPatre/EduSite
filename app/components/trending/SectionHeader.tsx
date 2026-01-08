// ============================================
// SECTION HEADER COMPONENT
// ============================================
// Reusable header for each dashboard section
// Shows icon, title, and optional description

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
    icon: LucideIcon;
    iconColor: string; // Tailwind color class like "text-blue-500"
    title: string;
    description?: string;
    badge?: string; // Optional badge text like "NEW" or "BETA"
}

export default function SectionHeader({
    icon: Icon,
    iconColor,
    title,
    description,
    badge
}: SectionHeaderProps) {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
                <Icon className={`w-6 h-6 ${iconColor}`} />
                <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
                {badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                        {badge}
                    </span>
                )}
            </div>
            {description && (
                <p className="text-sm text-slate-400 ml-9">{description}</p>
            )}
        </div>
    );
}
