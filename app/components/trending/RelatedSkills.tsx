import TrendCard from "./TrendCard";
import { fakeTrends } from "@/data/fakeTrends";

interface Props {
  currentSlug: string;
  category: string;
}

export default function RelatedSkills({ currentSlug, category }: Props) {
  const related = fakeTrends
    .filter(
      (skill) =>
        skill.category === category && skill.slug !== currentSlug
    )
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="mt-14 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        🔗 Related Skills
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {related.map((trend) => (
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
        ))}
      </div>
    </section>
  );
}
