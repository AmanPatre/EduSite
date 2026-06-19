import { skillDetectionRules, skillCategories } from '../skillDetectionRules';
import type { GitHubActivityData } from '../github/fetchActivity';
import type { YouTubeActivityData } from '../youtube/fetchActivity';

export interface TrendScoreResult {
    trendScore: number;
    breakdown: {
        github: number;
        youtube: number;
        weights: {
            github: number;
            youtube: number;
        };
    };
}

export function calculateTrendScore(
    skillName: string,
    githubData: GitHubActivityData,
    youtubeData: YouTubeActivityData,
    allSkillsData: Record<string, { githubScore: number; youtubeScore: number }>
): TrendScoreResult {
    const skill = skillDetectionRules[skillName];

    if (!skill) {
        throw new Error(`Skill ${skillName} not found in detection rules`);
    }

    const category = skill.category;

    // 1. Calculate raw scores
    const githubScore = calculateGitHubScore(githubData);
    const youtubeScore = calculateYouTubeScore(youtubeData);

    // 2. Category-level normalization (prevents bias)
    const categorySkills = skillCategories[category] || [];

    const categoryGithubScores = categorySkills
        .map(s => allSkillsData[s]?.githubScore || 0);

    const categoryYoutubeScores = categorySkills
        .map(s => allSkillsData[s]?.youtubeScore || 0);

    const normGithub = normalizeWithProtection(githubScore, categoryGithubScores);
    const normYouTube = normalizeWithProtection(youtubeScore, categoryYoutubeScores);

    // 3. Adaptive weighting (handle sparse signals)
    const weights = calculateAdaptiveWeights(githubData, youtubeData);

    // 4. Weighted composite score
    const rawTrendScore = (normGithub * weights.github) + (normYouTube * weights.youtube);
    const trendScore = Math.round(isNaN(rawTrendScore) ? 0 : rawTrendScore);

    return {
        trendScore: Math.max(0, Math.min(100, trendScore)), // Clamp to 0-100
        breakdown: {
            github: Math.round(isNaN(normGithub) ? 0 : normGithub),
            youtube: Math.round(isNaN(normYouTube) ? 0 : normYouTube),
            weights
        }
    };
}

function calculateGitHubScore(data: GitHubActivityData): number {
    // totalRepoCount = real GitHub-wide count (primary volume signal)
    // avgStars / avgForks = quality modifiers from 50-repo sample
    const score = (
        (data.totalRepoCount * 1.0) +   // Volume: how much is being built
        (data.avgStars * 0.5) +          // Quality: are those repos serious?
        (data.avgForks * 0.3)            // Engagement: are people building on it?
    );
    return isNaN(score) ? 0 : score;
}

function calculateYouTubeScore(data: YouTubeActivityData): number {
    const score = (
        (data.videoCount * 10) +        // Content creation
        (data.totalViews / 1000) +      // Learning demand
        (data.avgEngagement * 500)      // Quality/engagement
    );
    return isNaN(score) ? 0 : score;
}

function normalizeWithProtection(value: number, allValues: number[]): number {
    // Edge case: no data
    if (allValues.length === 0) {
        return 50; // Neutral score
    }

    // Ensure we anchor at 0 for scoring
    const min = 0;
    const max = Math.max(...allValues, 1); // Avoid division by zero if all are 0

    // Min-max normalization to 0-100 scale (anchored at 0)
    // If we strictly want relative to category:
    // const min = Math.min(...allValues);
    // const max = Math.max(...allValues);

    // BUT to avoid negative scores and handle single-item categories better:
    // simpler "percentage of max" approach is often better for this use case
    // let's stick to simple percentage of max in category

    // const result = ((value - min) / (max - min)) * 100;

    const result = (value / max) * 100;

    return isNaN(result) ? 0 : result;
}

function calculateAdaptiveWeights(
    githubData: GitHubActivityData,
    youtubeData: YouTubeActivityData
): { github: number; youtube: number } {
    // Use totalRepoCount for adaptive weight check (more reliable than sample size)
    const hasGithub = githubData.totalRepoCount > 100;
    const hasYouTube = youtubeData.videoCount > 3;

    // Both signals present: use default weights
    if (hasGithub && hasYouTube) {
        return { github: 0.40, youtube: 0.60 };
    }

    // Only GitHub signal: increase GitHub weight
    if (hasGithub && !hasYouTube) {
        return { github: 0.70, youtube: 0.30 };
    }

    // Only YouTube signal: increase YouTube weight
    if (!hasGithub && hasYouTube) {
        return { github: 0.20, youtube: 0.80 };
    }

    // Neither signal strong: equal weights (fallback)
    return { github: 0.50, youtube: 0.50 };
}
