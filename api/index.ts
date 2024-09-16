import express, { Express, Request, Response } from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';
import rateLimit from 'express-rate-limit';

const app: Express = express();

// Rate Limiter
const limiter = rateLimit({
  windowMs: 300000,
  max: 96,
  message: (req, res) => res.status(429).json([{ ok: false, code: '429', message: 'Too many requests, Please try again' }]),
});

app.use(limiter);
app.use(express.json());

// Authorization Middleware
const authorize = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.status(401).json([{ ok: false, code: '401', message: 'Authorization required' }]);
  }

  const [user, pwd] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');

  const username = 'AdMiNiStRaToR';
  const password = 'ADMINistrator℅%℅%1212';

  return (user === username && pwd === password) ? next() : res.status(401).json([{ ok: false, code: '401', message: 'Invalid credentials' }]);
};

// Parse Cookie Helper
function parseCookies(cookie: string | undefined): { [k: string]: string } {
  const cookies: { [k: string]: string } = {};
  cookie?.split(';').forEach(c => {
    const [key, value] = c.split('=');
    if (key && value) cookies[key.trim()] = decodeURIComponent(value.trim());
  });
  return cookies;
}

// Helper Function for Calculator
function calculate(op: string, val: number, num: number): { n: number; m: string } {
  switch (op) {
    case 'add': return { n: num + val, m: "Numbers Increased" };
    case 'reduce': return { n: num - val, m: "Reduced Numbers" };
    case 'multiply': return { n: num * val, m: "Multiplied Numbers" };
    case 'divided':
      if (val === 0) throw new Error('Division by zero');
      return { n: num / val, m: "Divided Numbers" };
    default: throw new Error('Invalid operation');
  }
}

// Helper Function for Counting Characters
function countChars(text: string) {
  let symbols = 0, alphabet = 0, numbers = 0, spaces = 0, others = 0;

  for (const char of text) {
    if (/\p{L}/u.test(char)) {
      alphabet++;
    } else if (/[0-9]/.test(char)) {
      numbers++;
    } else if (/\s/.test(char)) {
      spaces++;
    } else if (/[\p{P}\p{S}]/u.test(char)) {
      symbols++;
    } else {
      others++;
    }
  }

  const total = alphabet + numbers + symbols + spaces + others;

  return {
    symbols,
    alphabet,
    numbers,
    spaces,
    others,
    total
  };
}

// Character count handler
function countHandler(req: Request, res: Response) {
  let text: string;

  if (req.method === 'GET') {
    text = req.query.text as string;

    if (!text || typeof text !== 'string') {
      return res.status(400).json([{ ok: false, code: '400', message: 'Text query parameter is required and must be a string' }]);
    }
  } else if (req.method === 'POST') {
    text = req.body.text;

    if (!text || typeof text !== 'string') {
      return res.status(400).json([{ ok: false, code: '400', message: 'Text is required in the request body and must be a string' }]);
    }
  } else {
    return res.status(405).json([{ ok: false, code: '405', message: 'Method Not Allowed' }]);
  }

  const result = countChars(text);
  return res.json([{ ok: true, code: '200', message: 'Character count successful', data: result }]);
}

// Calculation handler
function calculateHandler(req: Request, res: Response) {
  try {
    let operation: string | undefined;
    let value: number;

    if (req.method === 'GET') {
      const { add, reduce, multiply, divided } = req.query as { add?: string; reduce?: string; multiply?: string; divided?: string };
      operation = Object.keys(req.query).find(k => ['add', 'reduce', 'multiply', 'divided'].includes(k));
      value = parseInt(req.query[operation as string] as string, 10);
    } else if (req.method === 'POST') {
      const { operation, value } = req.body;
      operation = operation;
      value = value;
    } else {
      return res.status(405).json([{ ok: true, code: '405', message: 'Method Not Allowed' }]);
    }

    if (!operation) return res.status(400).json([{ ok: false, code: '400', message: 'Operation not specified' }]);
    if (isNaN(value)) return res.status(400).json([{ ok: false, code: '400', message: 'Invalid value for operation' }]);

    const cookies = parseCookies(req.headers.cookie);
    let num = parseInt(cookies['number'] || '0', 10);
    const { n, m } = calculate(operation, value, num);

    const secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const expDate = new Date();
    expDate.setHours(expDate.getHours() + 24);

    res.setHeader('Set-Cookie', `number=${n}; HttpOnly; ${secure ? 'Secure;' : ''} Expires=${expDate.toUTCString()}; Path=/`);

    res.json([{ ok: true, code: '200', message: m, data: { number: n } }]);
  } catch (err: unknown) {
    console.error('Error :\n', err);
    const isDivErr = (err instanceof Error && err.message === 'Division by zero');
    res.status(isDivErr ? 400 : 500).json([{ ok: false, code: isDivErr ? '400' : '500', message: isDivErr ? 'Division by zero' : 'Internal server error', error: String(err) }]);
  }
}

// Use app.use for all routes

// /api/charCount for GET and POST
app.use('/api/charCount', (req, res) => countHandler(req, res));

// /api/calc for all methods
app.use('/api/calc', (req, res) => calculateHandler(req, res));

// /api/auth with auth middleware
app.use('/api/auth', authorize, (req, res) => {
  res.json([{ ok: true, code: '200', message: 'DevTools' }]);
});

// Default Export Handler for Vercel
export default function handler(req: VercelRequest, res: VercelResponse) {
  app(req as any, res as any);
}
