import express, { Express, Request, Response } from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';
import rateLimit from 'express-rate-limit';

const app: Express = express();
const limiter = rateLimit({
  windowMs: 300000, // 5 minutes
  max: 124, // limit each IP to 124 requests per windowMs
  message: "[{ ok: false, code: 429, message: 'Too many requests, try again later' }]",
  statusCode: 429,
});

app.use(limiter);
app.use(express.json());

// Middleware for Basic Authentication
const authenticate = (req: Request, res: Response, next: Function) => {
  const auth = req.headers['authorization'];

  if (!auth) {
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.status(401).json([{ ok: false, code: '401', message: 'Authorization required' }]);
  }

  const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
  const [username, password] = credentials;

  // Replace these values with your actual username and password
  const validUsername = 'admin';
  const validPassword = 'admin#1234';

  if (username === validUsername && password === validPassword) {
    return next(); // Allow access
  } else {
    return res.status(401).json([{ ok: false, code: '401', message: 'Invalid credentials' }]);
  }
};

// Parse cookies
function parseCookies(c: string | undefined): { [k: string]: string } {
  const cookies: { [k: string]: string } = {};
  if (c) {
    c.split(';').forEach(cookie => {
      const [k, v] = cookie.split('=');
      if (k && v) {
        cookies[k.trim()] = decodeURIComponent(v.trim());
      }
    });
  }
  return cookies;
}

// Perform calculation
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

// Handle request
function handleReq(req: Request, res: Response) {
  try {
    let op: string | undefined;
    let val: number;

    // Get operation and value
    if (req.method === 'GET') {
      const { add, reduce, multiply, divided } = req.query as { add?: string; reduce?: string; multiply?: string; divided?: string };
      op = Object.keys(req.query).find(k => ['add', 'reduce', 'multiply', 'divided'].includes(k));
      val = parseInt(req.query[op as string] as string, 10);
    } else if (req.method === 'POST') {
      const { operation, value } = req.body;
      op = operation;
      val = value;
    } else {
      return res.status(405).json([{ ok: false, code: '405', message: 'Method Not Allowed' }]);
    }

    if (!op) return res.status(400).json([{ ok: false, code: '400', message: 'Operation not specified' }]);
    if (isNaN(val)) return res.status(400).json([{ ok: false, code: '400', message: 'Invalid value for operation' }]);

    // Get cookies and perform calculation
    const cookies = parseCookies(req.headers.cookie);
    let num = parseInt(cookies['number'] || '0', 10);
    const { n, m } = calc(op, val, num);

    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const expDate = new Date();
    expDate.setHours(expDate.getHours() + 24);

    // Set cookie
    res.setHeader('Set-Cookie', `number=${n}; HttpOnly; ${isSecure ? 'Secure;' : ''} Expires=${expDate.toUTCString()}; Path=/`);

    res.json([{ ok: true, code: '200', message: m, data: { number: n } }]);
  } catch (error: unknown) {
    console.error('Error in /api/calc:', error);
    if (error instanceof Error && error.message === 'Division by zero') {
      res.status(400).json([{ ok: false, code: '400', message: 'Division by zero' }]);
    } else {
      res.status(500).json([{ ok: false, code: '500', message: 'Internal server error', error: String(error) }]);
    }
  }
}

// Routes
app.get('/api/calc', handleReq);
app.post('/api/calc', handleReq);

// Protected route
app.get('/api/auth', authenticate, (req: Request, res: Response) => {
  res.json([{ ok: true, code: '200', message: 'Authenticated successfully!' }]);
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  app(req as any, res as any);
}
