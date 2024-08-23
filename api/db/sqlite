import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export const dbPromise = open({
  filename: './filelinker.db',
  driver: sqlite3.Database
});

(async () => {
  const db = await dbPromise;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fileurl TEXT NOT NULL,
      filetype TEXT NOT NULL,
      created TEXT NOT NULL,
      deleted TEXT NOT NULL
    )
  `);
})();
