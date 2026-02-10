const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Redis = require('ioredis');

async function flushCache() {
    console.log("🧹 Flushing Redis Cache...");

    if (!process.env.REDIS_URL) {
        console.error("❌ REDIS_URL missing in .env");
        return;
    }

    const redis = new Redis(process.env.REDIS_URL);
    const CACHE_KEY = 'trend:scores:all';

    try {
        const result = await redis.del(CACHE_KEY);
        if (result === 1) {
            console.log(`✅ Successfully deleted cache key: ${CACHE_KEY}`);
        } else {
            console.log(`ℹ️  Cache key not found (already empty): ${CACHE_KEY}`);
        }
    } catch (e) {
        console.error("❌ Failed to flush cache:", e);
    } finally {
        redis.disconnect();
    }
}

flushCache();
