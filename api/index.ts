import express, { Express, Request, Response } from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';
import rateLimit from 'express-rate-limit';

const app: Express = express();
const limiter = rateLimit({
  windowMs: 300000, // 5 minutes
  max: 250, // limit each IP to 250 requests per windowMs
  message: "([{ ok: false, code: 429, message: 'Too many requests, try again later' }])",
  statusCode: 429,
});

app.use(limiter);
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

// Helper function to perform calculation
function performCalculation(operation: string, value: number, currentNumber: number): { number: number; msg: string } {
  switch (operation) {
    case 'add':
      return { number: currentNumber + value, msg: "Numbers Increased" };
    case 'reduce':
      return { number: currentNumber - value, msg: "Reduced Numbers" };
    case 'multiply':
      return { number: currentNumber * value, msg: "Multiplied Numbers" };
    case 'divided':
      if (value === 0) {
        throw new Error('Division by zero');
      }
      return { number: currentNumber / value, msg: "Divided Numbers" };
    default:
      throw new Error('Invalid operation');
  }
}

// Handler function for both GET and POST requests
function handleCalcRequest(req: Request, res: Response) {
  try {
    let operation: string | undefined;
    let value: number;

    // Parse operation and value from query params (GET) or request body (POST)
    if (req.method === 'GET') {
      const { add, reduce, multiply, divided } = req.query as { add?: string; reduce?: string; multiply?: string; divided?: string };
      operation = Object.keys(req.query).find(key => ['add', 'reduce', 'multiply', 'divided'].includes(key));
      value = parseInt(req.query[operation as string] as string, 10);
    } else if (req.method === 'POST') {
      const { operation: op, value: val } = req.body;
      operation = op;
      value = val;
    } else {
      return res.status(405).json([{ ok: false, code: '405', message: 'Method Not Allowed' }]);
    }

    if (!operation) {
      return res.status(400).json([{ ok: false, code: '400', message: 'Operation not specified' }]);
    }

    if (isNaN(value)) {
      return res.status(400).json([{ ok: false, code: '400', message: 'Invalid value for operation' }]);
    }

    // Parse cookies manually
    const cookies = parseCookies(req.headers.cookie);
    let currentNumber = parseInt(cookies['number'] || '0', 10);

    // Perform calculation
    const { number, msg } = performCalculation(operation, value, currentNumber);

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
    if (error instanceof Error && error.message === 'Division by zero') {
      res.status(400).json([{ ok: false, code: '400', message: 'Division by zero' }]);
    } else {
      res.status(500).json([{ ok: false, code: '500', message: 'Internal server error', error: String(error) }]);
    }
  }
}

// Handle both GET and POST requests
app.get('/api/calc', handleCalcRequest);
app.post('/api/calc', handleCalcRequest);

export default function handler(req: VercelRequest, res: VercelResponse) {
  app(req as any, res as any);
}
