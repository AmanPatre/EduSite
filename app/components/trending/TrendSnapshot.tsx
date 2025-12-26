import { Info } from "lucide-react";
import { fakeTrends } from "@/data/globalTrends";
import TrendCard from "./TrendCard";

export default function TrendSnapshot() {
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">
          🔥 Trending Skills This Month
        </h2>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Info size={14} />
          <span>Based on public learning & job demand signals</span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {fakeTrends.map((trend) => (
          <TrendCard
            key={trend.slug}
            skill={trend.skill}
            slug={trend.slug}
            score={trend.score}
            growthPercent={trend.growthPercent}
            direction={trend.direction}
            reason={trend.reason}
            category={trend.category}
          />
        )).slice(0,3)}
      </div>
    </section>
  );
}
