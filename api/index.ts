import express, { Express, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

const app: Express = express();
const port = 3000; // Use environment variable for port

let number = 0;
let msg;
const limiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 50, // limit each IP to 100 requests per windowMs
  message: "([{ ok: false, code: 429, message: 'Too many requests, try again later' }])",
  statusCode: 429,
});

app.use(limiter);
app.use(express.json());

app.get('/api/calc', (req: Request, res: Response) => {
  try {
    // Validate input parameters:
    const { add, reduce, multiply, divided } = req.query as { add?: number; reduce?: number; multiply?: number; divided?: number };

    if (!add && !reduce && !multiply && !divided) {
      return res.status(404).json([{ ok: false, code: '404', message: 'Operation not specified' }]);
    }

    const operation = Object.keys(req.query).find((key) => key !== 'undefined'); // Find valid operation key
    if (!operation) {
      return res.status(400).json([{ ok: false, code: '400', message: 'Invalid operation parameter' }]);
    }

    const value = parseInt(req.query[operation] as string, 10); // Get and parse value for the operation

    if (isNaN(value)) {
      return res.status(400).json([{ ok: false, code: '400', message: 'Invalid value for operation' }]);
    }

    // Perform calculation based on operation:
    switch (operation) {
      case 'add':
        number += value;
        msg = "Numbers Increase";
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
        // Handle unexpected operation (should not happen due to validation)
        return res.status(500).json([{ ok: false, code: '500', message: 'Internal server error' }]);
    }
    res.json([{
      ok: true,
      code: '200', // Use 200 for successful operation
      message: msg,
      data: { number },
    }]);
  } catch (error) {
    console.error(error);
    res.status(500).json([{ ok: false, code: '500', message: 'Internal server error' }]);
  }
});
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
