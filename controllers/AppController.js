import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    if (redisClient.isAlive() && dbClient.isAlive()) res.json({ redis: true, db: true });
  }

  static getStats(req, res) {
    const numfiles = dbClient.nbFiles();
    const numusers = dbClient.nbUsers();
    res.json({ users: numusers, files: numfiles });
  }
}
export default AppController;
