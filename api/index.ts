import express, { Express, Request, Response } from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';
import rateLimit from 'express-rate-limit';

const app: Express = express();

// Rate Limiter
const rl = rateLimit({
  windowMs: 300000, // 5 minutes
  max: 96,
  message: (req: Request, res: Response) => {
    res.status(429).json([{ ok: false, code: '429', message: 'Too many requests, Please try again' }]);
  },
});

app.use(rl);
app.use(express.json());

// Authorization Middleware
const auth = (req: Request, res: Response, next: Function) => {
  const hdr = req.headers['authorization'];

  if (!hdr) {
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.status(401).json([{ ok: false, code: '401', message: 'Authorization required' }]);
  }

  const [user, pwd] = Buffer.from(hdr.split(' ')[1], 'base64').toString().split(':');

  const usr = 'AdMiNiStRaToR';
  const pass = 'ADMINistrator℅%℅%1212';

  return (user === usr && pwd === pass) ? next() : res.status(401).json([{ ok: false, code: '401', message: 'Invalid credentials' }]);
};

// Parse Cookie Helper
function parseCks(c: string | undefined): { [k: string]: string } {
  const cks: { [k: string]: string } = {};
  c?.split(';').forEach(cookie => {
    const [k, v] = cookie.split('=');
    if (k && v) cks[k.trim()] = decodeURIComponent(v.trim());
  });
  return cks;
}

// Helper Function for Calculator
function calc(op: string, val: number, num: number): { n: number; m: string } {
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
  let text: string = ""; // Declare text variable here

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
  } else if (req.method === "PUT" || req.method === "DELETE" || req.method === "PATCH") {
    return res.status(405).json([{ ok: false, code: '405', message: 'Method Not Allowed' }]);
  } else if (req.method === 'OPTIONS' || req.method === 'HEAD') {
    // Return the default response for OPTIONS and HEAD
    res.setHeader('Allow', 'GET, POST, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.send();
  }

  const result = countChars(text);
  return res.json([{ ok: true, code: '200', message: 'Character count successful', data: result }]);
}

// Calculation handler
function calculateHandler(req: Request, res: Response) {
  try {
    let op: string | undefined;
    let val: number = 0; // Declare val here with a default value

    if (req.method === 'GET') {
      const { add, reduce, multiply, divided } = req.query as { add?: string; reduce?: string; multiply?: string; divided?: string };
      op = Object.keys(req.query).find(k => ['add', 'reduce', 'multiply', 'divided'].includes(k));
      if (op) { // Check if op exists before accessing the query parameter
        val = parseInt(req.query[op as string] as string, 10);
      }
    } else if (req.method === 'POST') {
      const { operation, value } = req.body;
      op = operation;
      val = value;
    } else if (req.method === "PUT" || req.method === "DELETE" || req.method === "PATCH") {
      return res.status(405).json([{ ok: false, code: '405', message: 'Method Not Allowed' }]);
    } else if (req.method === 'OPTIONS' || req.method === 'HEAD') {
      // Return the default response for OPTIONS and HEAD
      res.setHeader('Allow', 'GET, POST, OPTIONS, HEAD');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.send();
    }

    if (!op) return res.status(400).json([{ ok: false, code: '400', message: 'Operation not specified' }]);
    if (isNaN(val)) return res.status(400).json([{ ok: false, code: '400', message: 'Invalid value for operation' }]);

    const cks = parseCks(req.headers.cookie);
    let num = parseInt(cks['number'] || '0', 10);
    const { n, m } = calc(op, val, num);

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
app.use('/api/charCount', (req: Request, res: Response) => countHandler(req, res));

// /api/calc for all methods
app.use('/api/calc', (req: Request, res: Response) => calculateHandler(req, res));

// /api/auth with auth middleware
app.use('/api/auth', auth, (req: Request, res: Response) => {
  res.json([{ ok: true, code: '200', message: 'Authenticated successfully!' }]);
});

// Default Export Handler for Vercel
export default (req: VercelRequest, res: VercelResponse) => {
  app(req as any, res as any);
};
