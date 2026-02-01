export interface YouTubeActivityData {
    videoCount: number;
    totalViews: number;
    avgEngagement: number;
    sampleSize: number;
}

export async function fetchYouTubeActivity(
    skillQuery: string
): Promise<YouTubeActivityData> {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        console.warn('YOUTUBE_API_KEY not found, returning zero data');
        return {
            videoCount: 0,
            totalViews: 0,
            avgEngagement: 0,
            sampleSize: 0
        };
    }

    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Search for recent videos
        const searchResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?` +
            `part=snippet&` +
            `q=${encodeURIComponent(skillQuery)}&` +
            `type=video&` +
            `publishedAfter=${thirtyDaysAgo.toISOString()}&` +
            `maxResults=50&` +
            `order=relevance&` +
            `key=${apiKey}`
        );

        if (!searchResponse.ok) {
            throw new Error(`YouTube API error: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();
        const videos = searchData.items || [];

        // Use actual items.length, not pageInfo.totalResults (unreliable)
        const videoCount = videos.length;

        if (videoCount === 0) {
            return {
                videoCount: 0,
                totalViews: 0,
                avgEngagement: 0,
                sampleSize: 0
            };
        }

        // Get video statistics
        const videoIds = videos.map((v: any) => v.id.videoId).join(',');
        const statsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?` +
            `part=statistics&` +
            `id=${videoIds}&` +
            `key=${apiKey}`
        );

        if (!statsResponse.ok) {
            throw new Error(`YouTube Stats API error: ${statsResponse.status}`);
        }

        const statsData = await statsResponse.json();
        const statsItems = statsData.items || [];

        // Calculate metrics from actual fetched data
        const totalViews = statsItems.reduce(
            (sum: number, v: any) => sum + parseInt(v.statistics.viewCount || 0),
            0
        );

        const engagements = statsItems.map((v: any) => {
            const views = parseInt(v.statistics.viewCount) || 1;
            const likes = parseInt(v.statistics.likeCount) || 0;
            return likes / views;
        });

        const avgEngagement = engagements.length > 0
            ? engagements.reduce((a: number, b: number) => a + b, 0) / engagements.length
            : 0;

        return {
            videoCount,
            totalViews,
            avgEngagement,
            sampleSize: videoCount
        };
    } catch (error) {
        console.error(`Error fetching YouTube activity for "${skillQuery}":`, error);
        // Return zero data on error
        return {
            videoCount: 0,
            totalViews: 0,
            avgEngagement: 0,
            sampleSize: 0
        };
    }
}
