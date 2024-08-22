import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';

const router = express.Router();

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

    // Convert response to ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    
    // Convert ArrayBuffer to Buffer
    const fileBuffer = Buffer.from(arrayBuffer);
    
    const fileExtension = contentType.split('/')[1];
    const fileName = `downloaded.${fileExtension}`;
    const downloadLink = path.join(__dirname, '..', 'downloads', fileName);

    // Save the file to the local server
    await fs.promises.writeFile(downloadLink, fileBuffer);

    return res.status(200).json([{ ok: true, code: 200, data: { link: downloadLink, type: filetype } }]);

  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json([{ ok: false, code: 500, message: `Internal Server Error: ${error.message}` }]);
    }
    return res.status(500).json([{ ok: false, code: 500, message: 'Internal Server Error: An unknown error occurred' }]);
  }
});

export default router;
