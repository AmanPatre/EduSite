import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";

interface TrendCardProps {
  skill: string;
  slug: string;
  score: number;
  growthPercent: number;
  direction: string;
  reason: string;
  category : string
}

export default function TrendCard({
  skill,
  slug,
  score,
  growthPercent,
  direction,
  reason,
  category
}: TrendCardProps) {
  const isUp = direction === "UP";

  return (
    <Link href={`/trending/${slug}`} className="block">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm 
                      hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer">
                        <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 mb-2">
  {category}
</span>
        {/* Title + Arrow */}
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">{skill}</h3>
          {isUp ? (
            <ArrowUpRight className="text-green-600" size={18} />
          ) : (
            <ArrowDownRight className="text-red-500" size={18} />
          )}
        </div>

        {/* Score + Growth */}
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900">{score}</p>
            <p className="text-sm text-gray-500">Trend Score</p>
          </div>

          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              isUp
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-500"
            }`}
          >
            {growthPercent > 0 ? "+" : ""}
            {growthPercent}%
          </span>
        </div>

        {/* Sparkline */}
        <div className="mt-4 h-1 w-full rounded bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

        {/* Reason */}
        <p className="mt-3 text-xs text-gray-500">{reason}</p>
      </div>
    </Link>
  );
}
