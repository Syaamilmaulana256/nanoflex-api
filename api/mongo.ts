import { MongoClient, Db } from 'mongodb';

const uri = "mongodb+srv://syaamilmaulana2755:klhYSiYsaWOMZh7v@cluster0.c3icm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";";
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri!);

  await client.connect();
  const db = client.db("aura-apidb");

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
