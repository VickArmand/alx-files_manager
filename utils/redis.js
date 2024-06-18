/** */
import redis from 'redis';
class RedisClient {
    constructor() {
       this.client = redis.RedisClient();
       this.client.on('error', (err) => {
        console.log(err);
       });
    }
    isAlive() {
        isConnected = false;
        this.client.on('connect', (err) => {
           isConnected = true; 
        });
        return isConnected;
    }
    async get(key) {
        return await this.client.get(key);
    }
    async set(key, value, duration) {
        await this.client.set(key, value)
    }
    async del(key) {
        await this.client.del(key)
    }
}
exports.redisClient = new RedisClient();
