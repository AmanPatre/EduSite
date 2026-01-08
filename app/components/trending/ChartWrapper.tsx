// ============================================
// CHART WRAPPER COMPONENT
// ============================================
// Reusable wrapper for all charts with consistent styling
// Provides loading states and error boundaries

import React from 'react';

interface ChartWrapperProps {
    title?: string;
    children: React.ReactNode;
    height?: string; // Tailwind height class like "h-64"
    className?: string;
}

export default function ChartWrapper({
    title,
    children,
    height = 'h-80',
    className = ''
}: ChartWrapperProps) {
    return (
        <div className={`bg-slate-900/50 border border-slate-800 rounded-2xl p-6 ${className}`}>
            {title && (
                <h3 className="text-lg font-bold text-slate-100 mb-4">{title}</h3>
            )}
            <div className={`w-full ${height}`}>
                {children}
            </div>
        </div>
    );
}
