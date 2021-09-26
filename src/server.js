import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { User } from './api/user/user.model.js';

import { connect } from './utils/dbConnection.js';
import {
  signup,
  signin,
  signout,
  refreshAccessToken,
  revokeRefreshToken,
  protect,
} from './utils/auth.js';
import { googleAuthController } from './utils/googleauth.js';
import noteRouter from './api/note/note.router.js';
import notebookRouter from './api/notebook/notebook.router.js';
import userRouter from './api/user/user.router.js';

export const app = express();

app.disable('x-powered-by');

app.use(
  cors({
    origin: ['http://localhost:3000'],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
// app.use(urlencoded({ extended: true }));
app.use(morgan('dev'));

app.post('/signup', signup);
app.post('/signin', signin);
app.post('/refresh_token', refreshAccessToken);
app.post('/signout', signout);
app.post('/signinwithgoogle', googleAuthController);

app.use('/api', protect);

app.use('/api/v1/user', userRouter);

app.use('/api/v1/note', noteRouter);

app.use('/api/v1/notebook', notebookRouter);

app.use('*', (req, res) => res.status(404).json({ error: 'invalid route' }));

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
