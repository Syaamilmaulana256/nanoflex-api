import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Tambahkan ini di file utama (misalnya, `index.ts`) atau `routes.ts` Anda
router.get('/tmp/:filename', (req: Request, res: Response) => {
  const fileName = req.params.filename;
  const filePath = path.join('/tmp', fileName);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json([{ ok: false, code: 404, message: 'File not found' }]);
    }

    res.sendFile(filePath);
  });
});

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
    
    // Gunakan direktori sementara
    const downloadLink = path.join('/tmp', fileName);

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

export default router;
