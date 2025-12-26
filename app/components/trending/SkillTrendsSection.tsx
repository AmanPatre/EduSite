"use client";

import { useState } from "react";
import { fakeTrends } from "@/data/fakeTrends";
import TrendCard from "./TrendCard";
import Link from "next/link";

export default function SkillTrendsSection() {
  const [query, setQuery] = useState("");

  const filteredTrends = fakeTrends.filter((trend) => {
    const q = query.toLowerCase();
    return (
      trend.skill.toLowerCase().includes(q) ||
      trend.category.toLowerCase().includes(q)
    );
  });

  return (
    <section className="rounded-2xl bg-white border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            📊 Skill Trends
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Explore trending skills across different domains
          </p>
        </div>

        <Link
          href="/trending"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          View all →
        </Link>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search skills or categories (e.g. Frontend, AI, Docker)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-gray-200" />

      {/* Grid */}
      {filteredTrends.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTrends.map((trend) => (
            <TrendCard
              key={trend.slug}
              skill={trend.skill}
              slug={trend.slug}
              category={trend.category}
              score={trend.score}
              growthPercent={trend.growthPercent}
              direction={trend.direction}
              reason={trend.reason}
            />
          )).slice(0,6)}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          No skills match your search.
        </p>
      )}
    </section>
  );
}
