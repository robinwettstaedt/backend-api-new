// import express from 'express';
// import cors from 'cors';
// import morgan from 'morgan';
// import cookieParser from 'cookie-parser';
import createServer from './utils/createServer.js';

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
import todoRouter from './api/todo/todo.router.js';

const port = process.env.PORT;

const app = createServer();

app.post('/signup', signup);
app.post('/signin', signin);
app.post('/refresh_token', refreshAccessToken);
app.post('/signout', signout);
app.post('/signinwithgoogle', googleAuthController);

app.use('/api', protect);

app.use('/api/v1/user', userRouter);

app.use('/api/v1/note', noteRouter);

app.use('/api/v1/notebook', notebookRouter);

app.use('/api/v1/todo', todoRouter);

app.use('*', (req, res) => res.status(404).json({ error: 'invalid route' }));

export const start = async () => {
    try {
        await connect();
        app.listen(port, () => {
            console.log(`REST API on http://localhost:${port}`);
        });
    } catch (e) {
        console.error(e);
    }
};
