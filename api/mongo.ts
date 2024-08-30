// db/mongo.ts
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

let db;

export async function connectToDatabase() {
  if (!db) {
    await client.connect();
    db = client.db(process.env.DB_NAME || 'mydatabase');
  }
  return db;
}
