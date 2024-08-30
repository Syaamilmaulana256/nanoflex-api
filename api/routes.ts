// api/routes.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import { connectToDatabase } from './mongo';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    const { db } = await connectToDatabase();
    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(now.getFullYear() + 1);

    const fileMetadata = {
      fileName: fileName,
      fileContent: fileBuffer.toString('base64'),
      filetype: filetype.toString(),
      contentType: contentType,
      created: now.toISOString(),
      deleted: oneYearLater.toISOString(),
    };

    await db.collection('files').insertOne(fileMetadata);

    const downloadUrl = `https://aura-api-hazel.vercel.app/api/download?fileName=${encodeURIComponent(fileName)}`;

    return res.status(200).json([{ 
      ok: true, 
      code: 200, 
      data: { 
        fileName: fileName,
        type: filetype, 
        created: fileMetadata.created, 
        deleted: fileMetadata.deleted,
        downloadUrl: downloadUrl
      } 
    }]);

  } catch (error: unknown) {
    console.error('Error:', error);
    if (error instanceof Error) {
      return res.status(500).json([{ ok: false, code: 500, message: `Internal Server Error: ${error.message}` }]);
    }
    return res.status(500).json([{ ok: false, code: 500, message: 'Internal Server Error: An unknown error occurred' }]);
  }
}

// Endpoint untuk mengunduh file berdasarkan fileName
export async function downloadHandler(req: VercelRequest, res: VercelResponse) {
  const { fileName } = req.query;

  if (!fileName) {
    return res.status(400).json([{ ok: false, code: 400, message: 'Missing parameter: fileName' }]);
  }

  try {
    const { db } = await connectToDatabase();
    const fileMetadata = await db.collection('files').findOne({ fileName: fileName.toString() });

    if (!fileMetadata) {
      return res.status(404).json([{ ok: false, code: 404, message: 'File not found' }]);
    }

    const fileBuffer = Buffer.from(fileMetadata.fileContent, 'base64');
    res.setHeader('Content-Type', fileMetadata.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileMetadata.fileName}"`);
    return res.send(fileBuffer);

  } catch (error: unknown) {
    console.error('Error:', error);
    if (error instanceof Error) {
      return res.status(500).json([{ ok: false, code: 500, message: `Internal Server Error: ${error.message}` }]);
    }
    return res.status(500).json([{ ok: false, code: 500, message: 'Internal Server Error: An unknown error occurred' }]);
  }
}
