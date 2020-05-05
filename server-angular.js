
import * as express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';


const app = express();

var corsOptions = {
  origin: 'http://example.com',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}

app.use(cors(corsOptions))