import supertest from 'supertest';
import jest from 'jest';
import createServer from '../createServer';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

const app = createServer();

describe('POST /signup', () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });
  describe('given a username, email and password', () => {
    it('should return a 200', async () => {
      //   expect(true).toBe(true);
      const req = {
        body: {
          email: 'dagobert.duck@gmail.com',
          password: '1230',
          firstName: 'Dagobert',
          username: 'Dagobert',
        },
      };
      await supertest(app).get('/signup').expect(200);
    });
  });
});
