import { MongoClient, Db } from 'mongodb';

// Masukkan URI MongoDB Anda di sini.
const uri = "mongodb+srv://syaamilmaulana2755:klhYSiYsaWOMZh7v@cluster0.c3icm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

export async function connectToDatabase() {
  // Jika koneksi sudah ada, gunakan cache untuk menghindari pembuatan koneksi baru setiap saat.
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Buat instance baru MongoClient
  const client = new MongoClient(uri);

  // Tunggu hingga koneksi berhasil
  await client.connect();

  // Akses database berdasarkan nama
  const db = client.db("aura-apidb");

  // Cache client dan db agar tidak perlu reconnect setiap saat
  cachedClient = client;
  cachedDb = db;

  // Kembalikan client dan db
  return { client, db };
}
