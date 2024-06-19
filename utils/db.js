import MongoClient from "mongodb/lib/mongo_client";
class DBClient {
    constructor() {
        this.host = process.env.DB_HOST  | 'localhost';
        this.port = process.env.DB_PORT | 27017;
        this.dbName = process.env.DB_DATABASE | 'files_manager';
        this.url = `mongodb://${this.host}:${this.port}`;
        this.isConnected = true;
        this.client = new MongoClient(this.url);
    }
    isAlive() {
        this.client.connect().catch((err) => {
            this.isConnected = false;
        })
        return this.isConnected;
    }
    async nbUsers() {

    }
    async nbFiles() {

    }
}