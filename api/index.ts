import express, { Express, Request, Response } from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';

const app: Express = express();
app.use(express.json());

// Helper function to parse cookies from the request header
function parseCookies(cookieHeader: string | undefined): { [key: string]: string } {
  const cookies: { [key: string]: string } = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      const key = parts[0].trim();
      const value = parts[1].trim();
      cookies[key] = decodeURIComponent(value);
    });
  }
  return cookies;
}

app.get('/api/calc', (req: Request, res: Response) => {
  try {
    const { add, reduce, multiply, divided } = req.query as { add?: string; reduce?: string; multiply?: string; divided?: string };

    if (!add && !reduce && !multiply && !divided) {
      return res.status(404).json([{ ok: false, code: '404', message: 'Operation not specified' }]);
    }

    const operation = Object.keys(req.query).find((key) => key !== 'undefined');
    if (!operation) {
      return res.status(400).json([{ ok: false, code: '400', message: 'Invalid operation parameter' }]);
    }

    const value = parseInt(req.query[operation] as string, 10);

    if (isNaN(value)) {
      return res.status(400).json([{ ok: false, code: '400', message: 'Invalid value for operation' }]);
    }

    // Parse cookies manually
    const cookies = parseCookies(req.headers.cookie);
    let number = parseInt(cookies['number'] || '0', 10);
    let msg;

    switch (operation) {
      case 'add':
        number += value;
        msg = "Numbers Increased";
        break;
      case 'reduce':
        number -= value;
        msg = "Reduced Numbers";
        break;
      case 'multiply':
        number *= value;
        msg = "Multiplied Numbers";
        break;
      case 'divided':
        if (value === 0) {
          return res.status(400).json([{ ok: false, code: '400', message: 'Division by zero' }]);
        }
        number /= value;
        msg = "Divided Numbers";
        break;
      default:
        return res.status(500).json([{ ok: false, code: '500', message: 'Internal server error' }]);
    }

    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';

    // Set cookie manually
    res.setHeader('Set-Cookie', `number=${number}; HttpOnly; ${isSecure ? 'Secure;' : ''} Max-Age=86400; Path=/`);

    res.json([{
      ok: true,
      code: '200',
      message: msg,
      data: { number: number },
    }]);
  } catch (error: unknown) {
    console.error('Error in /api/calc:', error);
    res.status(500).json([{ ok: false, code: '500', message: 'Internal server error', error: String(error) }]);
  }
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  app(req as any, res as any);
    }
