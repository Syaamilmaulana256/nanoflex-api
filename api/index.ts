import express, { Express, Request, Response } from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { CreateEdgeConfig } from '@vercel/edge-config'; // Import EdgeConfig client

const app: Express = express();
app.use(express.json());

const edgeConfig = CreateEdgeConfig(process.env.EDGE_CONFIG);

// Route for calculation
app.get('/api/calc', async (req: Request, res: Response) => {
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

    // Retrieve current number from Edge Config
    let number = await edgeConfig.get('number');
    if (number === undefined) {
      number = 0; // Default to 0 if not set
    }

    let msg;

    // Perform calculation based on operation:
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

    // Save updated number to Edge Config
    await edgeConfig.set('number', number);

    res.json([{
      ok: true,
      code: '200',
      message: msg,
      data: { number: number },
    }]);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json([{ ok: false, code: '500', message: 'Internal server error' }]);
  }
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  app(req as any, res as any);
}
