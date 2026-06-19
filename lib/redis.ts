import Redis from 'ioredis'
const redisUrl = process.env.REDIS_URL
declare global {
    var redis: Redis | undefined
}
const redis = redisUrl ? (global.redis || new Redis(redisUrl)) : undefined;

if (process.env.NODE_ENV != 'production') {
    global.redis = redis
}
export default redis;
