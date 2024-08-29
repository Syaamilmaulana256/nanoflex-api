import express, { Express, Request, Response } from 'express';
// import routes from './routes';

const app: Express = express();

// Inisialisasi number sebagai variabel request-scoped
app.use((req: Request, res: Response, next) => {
  res.locals.number = 0;
  next();
});

app.use(express.json());

// Route untuk kalkulasi
app.get('/api/calc', (req: Request, res: Response) => {
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

    let msg: string;

    // Perform calculation based on operation:
    switch (operation) {
      case 'add':
        res.locals.number += value;
        msg = "Numbers Increased";
        break;
      case 'reduce':
        res.locals.number -= value;
        msg = "Reduced Numbers";
        break;
      case 'multiply':
        res.locals.number *= value;
        msg = "Multiplied Numbers";
        break;
      case 'divided':
        if (value === 0) {
          return res.status(400).json([{ ok: false, code: '400', message: 'Division by zero' }]);
        }
        res.locals.number /= value;
        msg = "Divided Numbers";
        break;
      default:
        return res.status(500).json([{ ok: false, code: '500', message: 'Internal server error' }]);
    }
    res.json([{
      ok: true,
      code: '200',
      message: msg,
      data: { number: res.locals.number },
    }]);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json([{ ok: false, code: '500', message: 'Internal server error' }]);
  }
});

// Tambahkan route untuk file download
// app.use('/api', routes);

// Export the Express app as a serverless function handler

