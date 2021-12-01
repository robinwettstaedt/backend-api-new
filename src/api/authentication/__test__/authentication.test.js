/* eslint-disable no-undef */
import request from 'supertest';
import dotenv from 'dotenv';
import app from '../../../app';
import {
    connectToTestMongo,
    disconnectFromTestMongo,
} from '../../../utils/createMongoTestConnection';

dotenv.config();

describe('Test Authentication', () => {
    beforeAll(async () => {
        connectToTestMongo();
    });

    afterAll(async () => {
        disconnectFromTestMongo();
    });

    describe('POST /signup', () => {
        // describe('registers a new user', () => {
        //     test('respond with status code 201', async () => {
        //         const response = await request(app).post('/auth/signup').send({
        //             email: 'testuser@testuser.com',
        //             password: 'thisisthetestpw',
        //             firstName: 'Tester',
        //             username: 'tester',
        //         });
        //         expect(response.statusCode).toBe(201);
        //     });

        //     test('accessToken is not empty', async () => {
        //         const response = await request(app).post('/auth/signup').send({
        //             email: 'testuser@testuser.com',
        //             password: 'thisisthetestpw',
        //             firstName: 'Tester',
        //             username: 'tester',
        //         });
        //         expect(response.body.accessToken).not.toBe('');
        //     });
        // });

        describe('does not register a new user, already exists', () => {
            test('responds with status code 500', async () => {
                const response = await request(app).post('/auth/signup').send({
                    email: 'testuser@testuser.com',
                    password: 'thisisthetestpw',
                    firstName: 'Tester',
                    username: 'tester',
                });
                expect(response.statusCode).toBe(500);
            });
        });
    });

    describe('POST /signin', () => {
        describe('signs in the user', () => {
            test('responds with status code 200', async () => {
                const response = await request(app).post('/auth/signin').send({
                    email: 'testuser@testuser.com',
                    password: 'thisisthetestpw',
                });
                expect(response.statusCode).toBe(200);
            });

            test('accessToken in response is not empty', async () => {
                const response = await request(app).post('/auth/signin').send({
                    email: 'testuser@testuser.com',
                    password: 'thisisthetestpw',
                });
                expect(response.body.accessToken).not.toBe('');
            });

            test('email in response is not empty', async () => {
                const response = await request(app).post('/auth/signin').send({
                    email: 'testuser@testuser.com',
                    password: 'thisisthetestpw',
                });
                expect(response.body.email).toBe('testuser@testuser.com');
            });
        });

        describe('does not sign in the user', () => {
            test('wrong email, responds with status code 401', async () => {
                const response = await request(app).post('/auth/signin').send({
                    email: 'incorrect@email.com',
                    password: 'thisisthetestpw',
                });
                expect(response.statusCode).toBe(401);
            });

            test('wrong pw, responds with status code 401', async () => {
                const response = await request(app).post('/auth/signin').send({
                    email: 'testuser@testuser.com',
                    password: 'thisisthewrongpw',
                });
                expect(response.statusCode).toBe(401);
            });
        });

        test('missing email, responds with status code 400', async () => {
            const response = await request(app).post('/auth/signin').send({
                password: 'thisisthetestpw',
            });
            expect(response.statusCode).toBe(400);
        });

        test('missing pw, responds with status code 400', async () => {
            const response = await request(app).post('/auth/signin').send({
                email: 'testuser@testuser.com',
            });
            expect(response.statusCode).toBe(400);
        });
    });
});
