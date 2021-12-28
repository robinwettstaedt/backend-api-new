import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { urlencoded } from 'body-parser';

import { protect } from './api/authentication/authentication.controllers';
import authRouter from './api/authentication/authentication.router';
import noteRouter from './api/note/note.router';
import notebookRouter from './api/notebook/notebook.router';
import userRouter from './api/user/user.router';
import todoRouter from './api/todo/todo.router';

const app = express();

app.disable('x-powered-by');

// this is because of 304 status code / express just sending cached data
app.disable('etag');

if (process.env.NODE_ENV === 'production') {
    app.use(
        cors({
            origin: [`http://localhost:${process.env.CLIENT_PORT}`],
            credentials: true,
        })
    );
} else {
    app.use(
        cors({
            origin: [`http://localhost:${process.env.TEST_CLIENT_PORT}`],
            credentials: true,
        })
    );
}
app.use(cookieParser());
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/auth', authRouter);

app.use('/api', protect);

app.use('/api/v1/user', userRouter);

app.use('/api/v1/note', noteRouter);

app.use('/api/v1/notebook', notebookRouter);

app.use('/api/v1/todo', todoRouter);

app.use('*', (req, res) => res.status(404).json({ error: 'invalid route' }));

export default app;
