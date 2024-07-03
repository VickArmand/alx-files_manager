import { uuidV4 } from 'mongodb/lib/core/utils';
import sha1 from 'sha1';
import dbclient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const credentials = authHeader.split(':');
    const email = credentials[0];
    const password = credentials[1];
    const user = dbclient.findByEmail(email);
    if (!email || !password || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const hashedPwd = sha1(password);
    if (hashedPwd === user.password) {
      const token = uuidV4().toString();
      const key = `auth_${token}`;
      redisClient.set(key, user.id, 24 * 60 * 60);
      return res.status(200).json({ token });
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }

  static getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (token) {
      const key = `auth_${token}`;
      const userId = redisClient.get(key);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      redisClient.del(key);
      return res.status(204).json();
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }

  static getMe(req, res) {
    const token = req.headers['x-token'];
    if (token) {
      const key = `auth_${token}`;
      const userId = redisClient.get(key);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const user = dbclient.findById(userId);
      return res.json({ id: userId, email: user.email });
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export default AuthController;
