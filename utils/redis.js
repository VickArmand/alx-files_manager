/** */
import { promisify } from 'util';
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
    const getval = promisify(this.client.get).bind(this.client);
    return getval(key);
  }

  async set(key, value, duration) {
    const setval = promisify(this.client.setex).bind(this.client);
    return setval(key, duration, value);
  }

  async del(key) {
    const delkey = promisify(this.client.del).bind(this.client);
    return delkey(key);
  }
}
const redisClient = new RedisClient();
export default redisClient;
