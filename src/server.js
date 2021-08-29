import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import examples from './api/examples.route.js';

const app = express();

app.disable('x-powered-by');

app.use(cors());
app.use(express.json());
// app.use(urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/v1/examples', examples);
app.use('*', (req, res) => res.status(404).json({ error: 'not found' }));

export default app;
