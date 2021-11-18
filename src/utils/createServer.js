import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

const createServer = () => {
  const app = express();

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

  return app;
};

export default createServer;
