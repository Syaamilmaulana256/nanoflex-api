import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';
import { dbPromise } from './db/sqlite';

const router = express.Router();

// Route untuk mengakses file yang diunduh
router.get('/tmp/:filename', (req: Request, res: Response) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, '..', 'tmp', fileName);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json([{ ok: false, code: 404, message: 'File not found' }]);
    }

    res.sendFile(filePath);
  });
});

// Route untuk download file
router.get('/downfile', async (req: Request, res: Response) => {
  const { url, filetype } = req.query;

  if (!url || !filetype) {
    return res.status(400).json([{ ok: false, code: 400, message: 'Missing parameters: url or filetype' }]);
  }

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      return res.status(response.status).json([{ ok: false, code: response.status, message: `Failed to fetch the resource` }]);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith(filetype.toString())) {
      return res.status(415).json([{ ok: false, code: 415, message: `Invalid file type. Expected: ${filetype}, received: ${contentType}` }]);
    }

    const arrayBuffer = await response.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const fileExtension = contentType.split('/')[1];
    const fileName = `downloaded.${fileExtension}`;
    
    const downloadLink = path.join(__dirname, '..', 'tmp', fileName);

    // Simpan file ke direktori sementara
    await fs.promises.writeFile(downloadLink, fileBuffer);

    return res.status(200).json([{ ok: true, code: 200, data: { link: `https://aura-api-taupe.vercel.app/api/tmp/${fileName}`, type: filetype } }]);

  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json([{ ok: false, code: 500, message: `Internal Server Error: ${error.message}` }]);
    }
    return res.status(500).json([{ ok: false, code: 500, message: 'Internal Server Error: An unknown error occurred' }]);
  }
});

// Route untuk file linker
router.get('/filelinker', async (req: Request, res: Response) => {
  const { url, filetype } = req.query;

  if (!url || !filetype) {
    return res.status(400).json([{ ok: false, code: 400, message: 'Missing parameters: url or filetype' }]);
  }

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      return res.status(response.status).json([{ ok: false, code: response.status, message: 'Failed to fetch the resource' }]);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith(filetype.toString())) {
      return res.status(415).json([{ ok: false, code: 415, message: `Invalid file type. Expected: ${filetype}, received: ${contentType}` }]);
    }

    const blob = await response.buffer();
    const fileExtension = contentType.split('/')[1];
    const fileName = `downloaded.${fileExtension}`;
    const downloadLink = path.join(__dirname, '..', 'tmp', fileName);

    // Save file locally
    await fs.promises.writeFile(downloadLink, blob);

    const db = await dbPromise;
    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(now.getFullYear() + 1);

    // Insert file metadata into the database
    await db.run(`
      INSERT INTO files (fileurl, filetype, created, deleted)
      VALUES (?, ?, ?, ?)
    `, [downloadLink, filetype.toString(), now.toISOString(), oneYearLater.toISOString()]);

    return res.status(200).json([{ 
      ok: true, 
      code: 200, 
      data: { 
        fileurl: `${req.protocol}://${req.get('host')}/api/tmp/${fileName}`, 
        filetype: filetype.toString(), 
        created: now.toISOString(), 
        deleted: oneYearLater.toISOString() 
      } 
    }]);

  } catch (error) {
    return res.status(500).json([{ ok: false, code: 500, message: `Internal Server Error: ${error.message}` }]);
  }
});

export default router;
        
