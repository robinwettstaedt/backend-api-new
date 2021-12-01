/* eslint-disable no-undef */
import request from 'supertest';
import dotenv from 'dotenv';
import app from '../app';
import {
    connectToTestMongo,
    disconnectFromTestMongo,
} from '../utils/createMongoTestConnection';

dotenv.config();

describe('API Routes Protection Testing', () => {
    beforeAll(async () => {
        connectToTestMongo();
    });

    afterAll(async () => {
        disconnectFromTestMongo();
    });

    describe('api auth', () => {
        test('api should be locked down', async () => {
            let response = await request(app).get('/api/note');
            expect(response.statusCode).toBe(401);

            response = await request(app).get('/api/notebook');
            expect(response.statusCode).toBe(401);

            response = await request(app).get('/api/todo');
            expect(response.statusCode).toBe(401);
        });
    });

    // describe('GET Notebook', () => {
    //     test('Notebook should be returned', async () => {
    //         const response = await request(app).get(
    //             '/api/v1/notebook/61a7d27b4333b3bee83a4c5d',
    //             {
    //                 Authorization:
    //                     'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxYTdjMTM4NTA1ODhiZjIzYzdmOGVhNyIsImlhdCI6MTYzODM4ODMzNSwiZXhwIjoxNzI0Nzg4MzM1fQ.wf_KjyKjfQP4Mbm_P6xIhpTPlogculIhf2YWsmFamYA',
    //             }
    //         );
    //         expect(response.statusCode).toBe(200);
    //     });
    // });
});
