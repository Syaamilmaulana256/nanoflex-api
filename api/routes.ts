import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { createClient } from '@vercel/blob';  // Import Vercel Blob client

const router = express.Router();
const TMP_DIR = '/tmp'; // Vercel mengizinkan penulisan ke /tmp

const blobClient = createClient();  // Initialize Vercel Blob client

// Route untuk mengakses file yang diunduh dari TMP_DIR
router.get('/tmp/:filename', (req: Request, res: Response) => {
  const fileName = req.params.filename;
  const filePath = path.join(TMP_DIR, fileName);

  if (!existsSync(filePath)) {
    return res.status(404).json([{ ok: false, code: 404, message: 'File not found' }]);
  }

  res.sendFile(filePath);
});

// Route untuk download file dan menyimpannya di Blob Storage
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
    const fileName = `downloaded_${Date.now()}.${fileExtension}`;
    
    const downloadLink = path.join(TMP_DIR, fileName);

    // Simpan file ke direktori sementara
    await writeFile(downloadLink, fileBuffer);

    // Upload file ke Blob Storage Vercel
    const blobUpload = await blobClient.upload({
      path: fileName,  // Nama file
      data: fileBuffer,  // Data file sebagai buffer
      contentType: contentType,  // Tipe konten file
    });

    // Hapus file dari TMP_DIR jika tidak diperlukan lagi
    // await fs.promises.unlink(downloadLink);

    return res.status(200).json([{
      ok: true,
      code: 200,
      data: {
        link: blobUpload.url,  // URL ke file di Blob Storage
        type: filetype,
      },
    }]);

  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json([{ ok: false, code: 500, message: `Internal Server Error: ${error.message}` }]);
    }
    return res.status(500).json([{ ok: false, code: 500, message: 'Internal Server Error: An unknown error occurred' }]);
  }
});

export default router;
