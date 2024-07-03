import { uuidV4 } from 'mongodb/lib/core/utils';
import fs from 'fs';
import mime from 'mime-types';
import dbclient from '../utils/db';
import redisClient from '../utils/redis';

const FOLDERPATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
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
    if (!name) return res.status(400).end({ error: 'Missing name' });
    if (!type || !acceptedTypes.includes(type)) return res.status(400).end({ error: 'Missing type' });
    if (!data && type !== 'folder') return res.status(400).end({ error: 'Missing data' });
    if (parentId) {
      const file = dbclient.findByParentID(parentId);
      if (!file) return res.status(400).end({ error: 'Parent not found' });
      if (dbclient.findByParentIDandType(parentId, 'folder')) return res.status(400).end({ error: 'Parent is not a folder' });
    }
    if (type === 'folder') {
      const record = await dbclient.saveFile(name,
        type, data, parentId, isPublic, undefined, userId);
      return res.status(201).end({ record });
    }
    const filename = uuidV4().toString();
    const filepath = `${FOLDERPATH}/${filename}`;
    fs.copyFile(name, filepath);
    const record = await dbclient.saveFile(name, type, data, parentId, isPublic, filepath, userId);
    return res.status(201).end({ record });
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).end({ error: 'Unauthorized' });
    const key = `auth_${token}`;
    const userId = req.params.id;
    if (!userId || userId !== redisClient.get(key)) return res.status(401).end({ error: 'Unauthorized' });
    const file = await dbclient.retrieveFileByUser(userId);
    if (!file) return res.status(404).end({ error: 'Not found' });
    return res.end(file);
  }

  static async getShow(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).end({ error: 'Unauthorized' });
    const parentID = req.params.parentId || '0';
    const page = parseInt(req.params.page, 10) || 0;
    const files = await dbclient.paginatewithParentID(parentID, 20, page + 1);
    return res.end(files);
  }

  static async putPublish(req, res) {
    const { id } = req.params;
    const token = req.headers['x-token'];
    if (!token) return res.status(401).end({ error: 'Unauthorized' });
    if (!await dbclient.findFileById(id)) return res.status(404).end({ error: 'Not found' });
    const file = dbclient.publishFile(id);
    return res.status(200).end(file);
  }

  static async putUnpublish(req, res) {
    const { id } = req.params;
    const token = req.headers['x-token'];
    if (!token) return res.status(401).end({ error: 'Unauthorized' });
    if (!await dbclient.findFileById(id)) return res.status(404).end({ error: 'Not found' });
    const file = dbclient.unpublishFile(id);
    return res.status(200).end(file);
  }

  static async getFile(req, res) {
    const { id } = req.params;
    const token = req.headers['x-token'];
    if (!token) return res.status(401).end({ error: 'Unauthorized' });
    const file = await dbclient.findFileById(id);
    if (!file) return res.status(404).end({ error: 'Not found' });
    if (file.type === 'folder') return res.status(400).end({ error: "A folder doesn't have content" });
    fs.exists(file.filepath, (exists) => {
      if (!exists) return res.status(404).end({ error: 'Not found' });

      const mimeType = mime.lookup(file.filepath);
      fs.readFile(file.filepath, (err, data) => {
        res.contentType(mimeType);
        return res.end(data);
      });
      return res.end();
    });
    return res.end();
  }
}
export default FilesController;
