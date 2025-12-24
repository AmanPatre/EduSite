import { fakeTrends } from "@/data/fakeTrends";
import { notFound } from "next/navigation";

interface Props {
  params: { skill: string };
}

export default function SkillDetailPage({ params }: Props) {
  const skillData = fakeTrends.find(
    (item) => item.slug === params.skill
  );

  if (!skillData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {skillData.skill}
        </h1>
        <p className="text-gray-600 mt-2">
          {skillData.reason}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Trend Score" value={skillData.score} />
        <Stat label="Growth" value={`${skillData.growthPercent}%`} />
        <Stat label="Learn Time" value={skillData.learnTime} />
      </div>

      {/* Roles */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Common Roles
        </h2>
        <ul className="list-disc list-inside text-gray-700">
          {skillData.roles.map((role) => (
            <li key={role}>{role}</li>
          ))}
        </ul>
      </section>

      {/* Usage */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Where it’s used
        </h2>
        <div className="flex flex-wrap gap-2">
          {skillData.usedIn.map((use) => (
            <span
              key={use}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
            >
              {use}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
