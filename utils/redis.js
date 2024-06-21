/** */
import redis from 'redis';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.isConnected = false;
    this.client.on('error', (err) => {
      console.log(err);
    });
    this.client.on('connect', () => {
      this.isConnected = true;
    });
  }

  isAlive() {
    return this.isConnected;
  }

  async get(key) {
    return this.client.get(key);
  }

  async set(key, value, duration) {
    return this.client.set(key, value, { EX: duration });
  }

  async del(key) {
    return this.client.del(key);
  }
}
const redisClient = new RedisClient();
export default redisClient;
