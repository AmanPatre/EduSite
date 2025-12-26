import TrendSnapshot from "../components/trending/TrendSnapshot";
import SkillTrendsSection from "../components/trending/SkillTrendsSection";
import RelatedSkills from "../components/trending/RelatedSkills";

export default function TrendingPage() {
  return (
    <main className="px-6 py-10 space-y-10">
      <h1 className="text-3xl font-bold text-white">
        📊 Tech Trends
      </h1>

      <TrendSnapshot />

      <SkillTrendsSection/>
      



    </main>
  );
}
