import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { connect } from './utils/dbConnection.js';
import example from './api/templates/example.router.js';
import note from './api/note/note.router.js';

export const app = express();

app.disable('x-powered-by');

app.use(cors());
app.use(express.json());
// app.use(urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/v1/example', example);
app.use('/api/v1/note', note);
app.use('*', (req, res) => res.status(404).json({ error: 'not found' }));

export const start = async () => {
  try {
    await connect();
    app.listen(process.env.PORT, () => {
      console.log(`REST API on http://localhost:${process.env.PORT}/api`);
    });
  } catch (e) {
    console.error(e);
  }
};
