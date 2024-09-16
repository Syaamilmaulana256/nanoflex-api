import exp, { Express, Request, Response } from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';
import rateLimit from 'express-rate-limit';

const app: Express = exp();

// Rate Limiter
const rl = rateLimit({
  windowMs: 300000,
  max: 120,
  message: (req, res) => res.status(429).json([{ ok: false, code: '429', message: 'Too many requests, Please try again' }]),
});

app.use(rl);
app.use(exp.json());

// Authorization Middleware
const auth = (req: Request, res: Response, next: Function) => {
  const hdr = req.headers['authorization'];

  if (!hdr) {
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.status(401).json([{ ok: false, code: '401', message: 'Authorization required' }]);
  }

  const [user, pwd] = Buffer.from(hdr.split(' ')[1], 'base64').toString().split(':');

  const usr = 'admin';
  const pass = 'admin#1234';

  return (user === usr && pwd === pass) ? next() : res.status(401).json([{ ok: false, code: '401', message: 'Invalid credentials' }]);
};

// Helper Function for Counting Characters
function countCharsHelper(text: string) {
  let symbols = 0, alphabet = 0, numbers = 0, spaces = 0, others = 0;

  for (const char of text) {
    if (/\p{L}/u.test(char)) {
      // Unicode letter, including extended sets like 𝕝, 𝕚, etc.
      alphabet++;
    } else if (/[0-9]/.test(char)) {
      numbers++;
    } else if (/\s/.test(char)) {
      // Space characters (e.g., space, tab, new line)
      spaces++;
    } else if (/[\p{P}\p{S}]/u.test(char)) {
      // Unicode punctuation and symbols
      symbols++;
    } else {
      others++;  // Any other characters that don't fall into the above categories
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


// Character count handler (using function instead of const)
function txtCountHandler(req: Request, res: Response) {
  let text: string;

  if (req.method === 'GET') {
    // Get text from query params for GET
    text = req.query.text as string;

    if (!text || typeof text !== 'string') {
      return res.status(400).json([{ ok: false, code: '400', message: 'Text query parameter is required and must be a string' }]);
    }
  } else if (req.method === 'POST') {
    // Get text from request body for POST
    text = req.body.text;

    if (!text || typeof text !== 'string') {
      return res.status(400).json([{ ok: false, code: '400', message: 'Text is required in the request body and must be a string' }]);
    }
  } else {
    return res.status(405).json([{ ok: false, code: '405', message: 'Method Not Allowed' }]);
  }

  // Use the helper function to count characters
  const result = countCharsHelper(text);
  return res.json([{ ok: true, code: '200', message: 'Character count successful', data: result }]);
}

// Calculation handler
function calcHandler(req: Request, res: Response) {
  try {
    let op: string | undefined;
    let val: number;

    if (req.method === 'GET') {
      const { add, reduce, multiply, divided } = req.query as { add?: string; reduce?: string; multiply?: string; divided?: string };
      op = Object.keys(req.query).find(k => ['add', 'reduce', 'multiply', 'divided'].includes(k));
      val = parseInt(req.query[op as string] as string, 10);
    } else if (req.method === 'POST') {
      const { operation, value } = req.body;
      op = operation;
      val = value;
    } else {
      return res.status(405).json([{ ok: true, code: '405', message: 'Method Not Allowed' }]);
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
app.use('/api/charCount', (req, res) => txtCountHandler(req, res));

// /api/calc for all methods
app.use('/api/calc', (req, res) => calcHandler(req, res));

// /api/auth with auth middleware
app.use('/api/auth', auth, (req, res) => {
  res.json([{ ok: true, code: '200', message: 'Authenticated successfully!' }]);
});

// Default Export Handler for Vercel
export default function handler(req: VercelRequest, res: VercelResponse) {
  app(req as any, res as any);
}
