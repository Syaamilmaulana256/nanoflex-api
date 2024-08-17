import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = 3000;

let number = 0;

app.use(express.json());


function cs(obj : { name: string }): void {
  const object = Object.keys(obj.name);
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
      ok: false,
      code: '404',
      message: 'Not found'
      }]);
    }

            
        
if (cs(plus) == "plus") {
  number += plus || 0;
  res.json([{
      ok: true,
      code: '201',
      message: 'Number Increased',
      data: {
        number: number,
      }
    }]);
} else if (cs(minus) == "minus") {
  number -= minus || 0;
  res.json([{
      ok: true,
      code: '201',
      message: 'Number Decreased',
      data: {
        number: number,
      }
    }]);
} else if (cs(times) == "times") {
  number *= times || 0;
  res.json([{
      ok: true,
      code: '201',
      message: 'Number Times',
      data: {
        number: number,
      }
    }]);
} else if (cs(divided) == "divided") {
  number /= times || 0;
  res.json([{
      ok: true,
      code: '201',
      message: 'Number Divided',
      data: {
        number: number,
      }
    }]);
}
  } catch (error) {
    if (error.message === 'Invalid Parameters') {
    return res.status(400).json([{   
      ok: false,
      code: '400',
      message: error.message
      });
    } else {
      console.error(error);
      return res.status(500).json([{
        code: '500',
        message: 'Internal server error'
      }]);
    }
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
