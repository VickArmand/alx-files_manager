import { uuidV4 } from 'mongodb/lib/core/utils';
import fs from 'fs';
import dbclient from '../utils/db';
import redisClient from '../utils/redis';

const FOLDERPATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    const token = req.header['X-Token'];
    const { name } = req.body;
    const { type } = req.body;
    const { parentId } = req.body;
    const { isPublic } = req.body || false;
    const { data } = req.body;
    const acceptedTypes = ['folder', 'file', 'image'];
    if (!token) {
      return res.status(401).end({ error: 'Unauthorized' });
    }
    const key = `auth_${token}`;
    const userId = redisClient.get(key);
    if (!userId) return res.status(401).end({ error: 'Unauthorized' });
    const user = dbclient.findById(userId);
    if (!name) return res.status(400).end({ error: 'Missing name' });
    if (!type || !acceptedTypes.includes(type)) return res.status(400).end({ error: 'Missing type' });
    if (!data && type != 'folder') return res.status(400).end({ error: 'Missing data' });
    if (parentId) {
      const file = dbclient.findByParentID(parentId);
      if (!file) return res.status(400).end({ error: 'Parent not found' });
      if (dbclient.findByParentIDandType(parentId, 'folder')) return res.status(400).end({ error: 'Parent is not a folder' });
    }
    if (type === 'folder') {
      const record = await dbclient.saveFile(name, type, data, parentId, isPublic, undefined, userId);
      return res.status(201).end({ record });
    }
    const filename = uuidV4().toString();
    const filepath = `${FOLDERPATH}/${filename}`;
    fs.copyFile(name, filepath);
    const record = await dbclient.saveFile(name, type, data, parentId, isPublic, filepath, userId);
    return res.status(201).end({ record });
  }
}
export default FilesController;
