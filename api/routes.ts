import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';

const router = express.Router();

router.get('/api/downfile', async (req: Request, res: Response) => {
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

    const blob = await response.blob();
    const fileBuffer = Buffer.from(await blob.arrayBuffer());
    const fileExtension = contentType.split('/')[1];
    const fileName = `downloaded.${fileExtension}`;
    const downloadLink = path.join(__dirname, '..', 'downloads', fileName);

    // Simpan file ke server lokal
    await fs.promises.writeFile(downloadLink, fileBuffer);

    return res.status(200).json([{ ok: true, code: 200, data: { link: downloadLink, type: filetype } }]);

  } catch (error) {
    return res.status(500).json([{ ok: false, code: 500, message: `Internal Server Error: ${error.message}` }]);
  }
});

export default router;
                                   
