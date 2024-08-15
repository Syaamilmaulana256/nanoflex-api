import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = 3000;

let number = 0;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send("use it then");
});

app.get('/number', (req: Request, res: Response) => {
  const add = parseInt(req.query.add as string, 10);
  const reduce = parseInt(req.query.reduce as string, 10);

  try {
    if (isNaN(add) && isNaN(reduce)) {
      return res.status(404).json({
        status: 'error',
        message: 'Invalid Parameters Value'
      });
    }

    number += add || 0;
    number -= reduce || 0;

    res.json({
      status: 'success',
      message: 'Number Modified',
      data: {
        number: number,
        date: new Date().toLocaleString('id-ID', {
          timeZone: 'Asia/Jakarta',
          weekday: 'long', // 'long', 'short', 'narrow'
          year: 'numeric', // '2-digit', 'numeric'
          month: 'long', // '2-digit', 'long', 'short', 'narrow'
          day: 'numeric' // '2-digit', 'numeric'
        })
      }
    });
  } catch (error) {
    if (error.message === 'Invalid Parameters') {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    } else {
      console.error(error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error'
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
