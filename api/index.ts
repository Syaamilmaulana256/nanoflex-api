import express, { Express, Request, Response } from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';
import rateLimit from 'express-rate-limit';

const app: Express = express();

// Rate Limiter
const limiter = rateLimit({
  windowMs: 300000, // 5 minutes
  max: 96,
  message: (req, res) => { 
    // Karena `res.status` tidak diakses dalam context `express-rate-limit`,
    // kita perlu membuat respon error di dalam function ini.
    res.status(429).json([{ ok: false, code: '429', message: 'Too many requests, Please try again' }]);
  },
});

app.use(limiter);
app.use(express.json());

// ... rest of the code

// Default Export Handler for Vercel
export default function handler(req: VercelRequest, res: VercelResponse) {
  app.handle(req as any, res as any); // Change from `app(req as any, res as any);`
}
