import MongoClient from 'mongodb/lib/mongo_client';

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.dbName = process.env.DB_DATABASE || 'files_manager';
    this.url = `mongodb://${this.host}:${this.port}`;
    this.isConnected = false;
    this.db = null;
    this.client = new MongoClient(this.url);
    this.client.connect((err) => {
      if (!err) {
        this.isConnected = true;
        this.db = this.client.db(this.dbName);
      }
    });
  }

  isAlive() {
    return this.isConnected;
  }

  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  async findByEmail(email) {
    return this.db.collection('users').findOne({ email });
  }

  async findById(id) {
    return this.db.collection('users').findOne({ _id: id });
  }

  async store(email, password) {
    return this.db.collection('users').insertOne({ email, password });
  }

  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }

  async findByParentID(parentID) {
    return this.db.collection('files').find({ parentId: parentID });
  }

  async paginatewithParentID(parentID, max, page) {
    return this.db.collection('files').aggregate([
      {
        $match: { parentId: parentID },
        $limit: max,
        $facet: {
          metadata: [{ $addFields: { page } }],
        },
      },
    ]);
  }

  async findByParentIDandType(parentID, type) {
    return this.db.collection('files').find({ parentId: parentID, type });
  }

  async saveFile(name, type, data, parentId, isPublic, filePath, userId) {
    return this.db.collection('files').insertOne({
      name, type, data, parentId, isPublic, filePath, userId,
    });
  }

  async retrieveFileByUser(userId) {
    return this.db.collection('files').find({ userId });
  }

  async findFileById(id) {
    return this.db.collection('files').find({ _id: id });
  }

  async publishFile(id) {
    return this.db.collection('files').updateOne({ _id: id }, { isPublic: true });
  }

  async unpublishFile(id) {
    return this.db.collection('files').updateOne({ _id: id }, { isPublic: false });
  }
}
const dbclient = new DBClient();
export default dbclient;
