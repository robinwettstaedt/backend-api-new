import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { connect } from './utils/dbConnection.js';
import {
  signup,
  signin,
  signout,
  refreshAccessToken,
  revokeRefreshToken,
  protect,
} from './utils/auth.js';
import { googleAuthController, deleteGoogleUser } from './utils/googleauth.js';
import exampleRouter from './api/templates/example.router.js';
import noteRouter from './api/note/note.router.js';

export const app = express();

app.disable('x-powered-by');

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
// app.use(urlencoded({ extended: true }));
app.use(morgan('dev'));

app.post('/signup', signup);
app.post('/signin', signin);
app.post('/auth/signinwithgoogle', googleAuthController);
app.post('/auth/deletegoogleaccount', deleteGoogleUser);

app.use('/api', protect);
app.post('/api/signout', signout);
app.use('/api/v1/example', exampleRouter);
app.use('/api/v1/note', noteRouter);

app.use('*', (req, res) => res.status(404).json({ error: 'not found' }));

export const start = async () => {
  try {
    await connect();
    app.listen(process.env.PORT, () => {
      console.log(`REST API on http://localhost:${process.env.PORT}`);
    });
  } catch (e) {
    console.error(e);
  }
};
