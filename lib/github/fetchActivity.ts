import { skillDetectionRules } from '../skillDetectionRules';

export interface GitHubActivityData {
    repoCount: number;
    totalStars: number;
    totalForks: number;
    avgStars: number;
    sampleSize: number;
}

export async function fetchGitHubActivities(
    skills: string[],
    dateRange: string
): Promise<Record<string, GitHubActivityData>> {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error('GITHUB_TOKEN not found in environment variables');
    }

    // GitHub GraphQL has limits, so we batch requests (e.g., 5 skills per request)
    const BATCH_SIZE = 5;
    const batches = [];

    for (let i = 0; i < skills.length; i += BATCH_SIZE) {
        batches.push(skills.slice(i, i + BATCH_SIZE));
    }

    const results: Record<string, GitHubActivityData> = {};

    for (const batch of batches) {
        const queryParts = batch.map((skill, index) => {
            const rules = skillDetectionRules[skill];
            if (!rules) return '';

            // Alias must be alphanumeric (skill_0, skill_1, etc.)
            const alias = `skill_${index}`;
            // GraphQL search query
            // Note: first: 50 is safer for complexity limits when batching
            return `
        ${alias}: search(query: "${rules.github.query.replace(/"/g, '\\"')} created:${dateRange}", type: REPOSITORY, first: 50) {
          repositoryCount
          nodes {
            ... on Repository {
              stargazerCount
              forkCount
            }
          }
        }
      `;
        });

        const query = `
      query {
        ${queryParts.join('\n')}
      }
    `;

        try {
            const response = await fetch('https://api.github.com/graphql', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
                next: { revalidate: 3600 }
            });

            if (!response.ok) {
                throw new Error(`GitHub GraphQL Error: ${response.status}`);
            }

            const json = await response.json();

            if (json.errors) {
                // Check if it's a rate limit error
                if (json.errors.some((e: any) => e.type === 'RATE_LIMITED')) {
                    // console.error('RATE LIMITED HIT!'); // Keep this for debugging if needed, but removing for production
                }
            }

            // Process results
            batch.forEach((skill, index) => {
                const alias = `skill_${index}`;
                const searchData = json.data?.[alias];

                if (searchData) {
                    const repos = searchData.nodes || [];

                    const repoCount = repos.length; // Sample count

                    const totalStars = repos.reduce((sum: number, r: any) => sum + r.stargazerCount, 0);
                    const totalForks = repos.reduce((sum: number, r: any) => sum + r.forkCount, 0);
                    const avgStars = repoCount > 0 ? totalStars / repoCount : 0;

                    results[skill] = {
                        repoCount,
                        totalStars,
                        totalForks,
                        avgStars,
                        sampleSize: repoCount
                    };
                } else {
                    results[skill] = { repoCount: 0, totalStars: 0, totalForks: 0, avgStars: 0, sampleSize: 0 };
                }
            });

        } catch (error) {
            console.error('Batch fetch error:', error);
            // Fill with zeros on error
            batch.forEach(skill => {
                results[skill] = { repoCount: 0, totalStars: 0, totalForks: 0, avgStars: 0, sampleSize: 0 };
            });
        }
    }

    return results;
}

export function getLast30Days(): string {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    return `${startStr}..${endStr}`;
}
