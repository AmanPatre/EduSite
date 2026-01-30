"use client";

import { usePathname } from "next/navigation";

export default function PageWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isHome = pathname === "/";

    return (
        <main
            className={`min-h-screen bg-transparent relative z-10 text-slate-200 ${isHome ? "" : ""
                }`}
        >
            {children}
        </main>
    );
}
