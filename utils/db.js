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

  async nbFiles() {
    return this.db.collection('files').countDocuments();
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
}
const dbclient = new DBClient();
export default dbclient;
