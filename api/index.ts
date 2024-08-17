import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = 3000;

let number = 0;

app.use(express.json());


function cs(input: string) void {
  const object = Object.keys(input);
const keys = object.map(key => `"${object}"`).join(', ');
return keys
}
app.get('/api/calc', (req: Request, res: Response) => {
  const plus = parseInt(req.query.plus as string, 10);
  const minus = parseInt(req.query.minus as string, 10);
  const times = parseInt(req.query.times as string, 10);
const divided = parseInt(req.query.divided as string, 10);
  try {
    if (isNaN(plus) && isNaN(minus) && isNan(times) && isNan(divided)) {
      return res.status(404).json([{
        status: 'error',
        message: 'Invalid Parameters Value'
      }]);
    }

            
        
if (cs(plus) == "plus") {
  number += plus || 0;
  res.json([{
      status: 'success',
      message: 'Number Increased',
      data: {
        number: number,
      }
    }]);
} else if (cs(minus) == "minus") {
  number -= minus || 0;
  res.json([{
      status: 'success',
      message: 'Number Decreased',
      data: {
        number: number,
      }
    }]);
} else if (cs(times) == "times") {
  number *= times || 0;
  res.json([{
      status: 'success',
      message: 'Number Times',
      data: {
        number: number,
      }
    }]);
} else if (cs(divided) == "divided") {
  number /= times || 0;
  res.json([{
      status: 'success',
      message: 'Number Divided',
      data: {
        number: number,
      }
    }]);
}
  } catch (error) {
    if (error.message === 'Invalid Parameters') {
      return res.status(400).json([{
        status: 'error',
        message: error.message
      }]);
    } else {
      console.error(error);
      return res.status(500).json([{
        status: 'error',
        message: 'Internal Server Error'
      }]);
    }
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
