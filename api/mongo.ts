// db/mongo.ts
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://syaamilmaulana2755:klhYSiYsaWOMZh7v@cluster0.c3icm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

let db: Db;

export async function connectToDatabase() {
  if (!db) {
    await client.connect();
    db = client.db("aura-apidb");
  }
  return db;
}
