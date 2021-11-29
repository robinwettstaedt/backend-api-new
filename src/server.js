import createServer from './utils/createServer';

import connectToMongoDB from './utils/createMongoConnection';

import { protect } from './api/authentication/authentication.controllers';

import authRouter from './api/authentication/authentication.router';

import noteRouter from './api/note/note.router';
import notebookRouter from './api/notebook/notebook.router';
import userRouter from './api/user/user.router';
import todoRouter from './api/todo/todo.router';

const port = process.env.PORT;

const app = createServer();

app.use('/auth', authRouter);

app.use('/api', protect);

app.use('/api/v1/user', userRouter);

app.use('/api/v1/note', noteRouter);

app.use('/api/v1/notebook', notebookRouter);

app.use('/api/v1/todo', todoRouter);

app.use('*', (req, res) => res.status(404).json({ error: 'invalid route' }));

const start = async () => {
    try {
        await connectToMongoDB();
        app.listen(port, () => {
            console.log(`REST API on http://localhost:${port}`);
        });
    } catch (e) {
        console.error(e);
    }
};

export default start;
