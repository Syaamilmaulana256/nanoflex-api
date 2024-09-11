import exp, { Express, Request, Response } from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';
import rateLimit from 'express-rate-limit';

const app: Express = exp();
const lim = rateLimit({
  windowMs: 300000,
  max: 120,
  message: (req, res) => res.status(429).json([{ ok: false, code: '429', message: 'Too many requests, Please try again' }]),
});

app.use(lim);
app.use(exp.json());

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

function parseCks(c: string | undefined): { [k: string]: string } {
  const cks: { [k: string]: string } = {};
  c?.split(';').forEach(cookie => {
    const [k, v] = cookie.split('=');
    if (k && v) cks[k.trim()] = decodeURIComponent(v.trim());
  });
  return cks;
}

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

function hReq(req: Request, res: Response) {
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
    console.error('Error in /api/calc:', err);
    const isDivErr = (err instanceof Error && err.message === 'Division by zero');
    res.status(isDivErr ? 400 : 500).json([{ ok: false, code: isDivErr ? '400' : '500', message: isDivErr ? 'Division by zero' : 'Internal server error', error: String(err) }]);
  }
}

app.get('/api/calc', hReq);
app.post('/api/calc', hReq);
app.put('/api/calc', hReq);
app.delete('/api/calc', hReq);
app.patch('/api/calc', hReq);

app.get('/api/auth', auth, (req: Request, res: Response) => {
  res.json([{ ok: true, code: '200', message: 'Authenticated successfully!' }]);
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  app(req as any, res as any);
}
