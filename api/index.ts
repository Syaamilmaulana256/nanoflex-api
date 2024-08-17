import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = process.env.PORT || 3000; // Use environment variable for port

let number = 0;

app.use(express.json());

app.get('/api/calc', (req: Request, res: Response) => {
  try {
    // Validate input parameters:
    const { plus, minus, times, divided } = req.query as { plus?: number; minus?: number; times?: number; divided?: number };

    if (!plus && !minus && !times && !divided) {
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
      case 'Increased':
        number += value;
        break;
      case 'Decreased':
        number -= value;
        break;
      case 'Multiple Increased':
        number *= value;
        break;
      case 'Multiple Decreased':
        if (value === 0) {
          return res.status(400).json([{ ok: false, code: '400', message: 'Division by zero' }]);
        }
        number /= value;
        break;
      default:
        // Handle unexpected operation (should not happen due to validation)
        return res.status(500).json([{ ok: false, code: '500', message: 'Internal server error' }]);
    }

    res.json([{
      ok: true,
      code: '200', // Use 200 for successful operation
      message: `Number ${operation}`,
      data: { number },
    }]);
  } catch (error) {
    console.error(error);
    res.status(500).json([{ ok: false, code: '500', message: 'Internal server error' }]);
  }
});
app.post('/api/calc', (req: Request, res: Response) => {
  try {
    // Validate input parameters:
    const { plus, minus, times, divided } = req.query as { plus?: number; minus?: number; times?: number; divided?: number };

    if (!plus && !minus && !times && !divided) {
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
      case 'Increased':
        number += value;
        break;
      case 'Decreased':
        number -= value;
        break;
      case 'Multiple Increased':
        number *= value;
        break;
      case 'Multiple Decreased':
        if (value === 0) {
          return res.status(400).json([{ ok: false, code: '400', message: 'Division by zero' }]);
        }
        number /= value;
        break;
      default:
        // Handle unexpected operation (should not happen due to validation)
        return res.status(500).json([{ ok: false, code: '500', message: 'Internal server error' }]);
    }

    res.json([{
      ok: true,
      code: '200', // Use 200 for successful operation
      message: `Number ${operation}`,
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
