import express, { Express, Request, Response } from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';
import CreateEdgeConfig from "@vercel/edge-config";

const app: Express = express();
app.use(express.json());

const edgeConfig = CreateEdgeConfig("https://edge-config.vercel.com/ecfg_87iyqj3pn8wadw04jo8ar3drwmhf?token=b0cb4da4-40c6-456e-89b5-0ed83e01d952");

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
    let number;
    try {
      number = await edgeConfig.get('number');
      console.log('Current number from Edge Config:', number);
    } catch (edgeConfigError) {
      console.error('Error retrieving from Edge Config:', edgeConfigError);
      return res.status(500).json([{ ok: false, code: '500', message: 'Error accessing Edge Config' }]);
    }

    if (number === undefined) {
      console.log('Number not found in Edge Config, defaulting to 0');
      number = 0;
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
    try {
      await edgeConfig.set('number', number);
      console.log('Updated number in Edge Config:', number);
    } catch (edgeConfigError) {
      console.error('Error saving to Edge Config:', edgeConfigError);
      return res.status(500).json([{ ok: false, code: '500', message: 'Error updating Edge Config' }]);
    }

    res.json([{
      ok: true,
      code: '200',
      message: msg,
      data: { number: number },
    }]);
  } catch (error: unknown) {
    console.error('Unhandled error in /api/calc:', error);
    res.status(500).json([{ ok: false, code: '500', message: 'Internal server error', error: String(error) }]);
  }
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  app(req as any, res as any);
}
