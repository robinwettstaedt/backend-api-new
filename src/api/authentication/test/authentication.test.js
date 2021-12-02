/* eslint-disable no-undef */
import request from 'supertest';
import dotenv from 'dotenv';
import app from '../../../app';

dotenv.config();

const authenticationTestSuite = () => {
    describe('Test Authentication', () => {
        describe('API Route Protection', () => {
            test('API should be locked down', async () => {
                let response = await request(app).get('/api/note');
                expect(response.statusCode).toBe(401);

                response = await request(app).get('/api/notebook');
                expect(response.statusCode).toBe(401);

                response = await request(app).get('/api/todo');
                expect(response.statusCode).toBe(401);
            });
        });

        describe('POST /signup', () => {
            describe('registers a new user', () => {
                test('respond with status code 201, accessToken not empty, cookie was set', async () => {
                    const response = await request(app)
                        .post('/auth/signup')
                        .send({
                            email: 'testuser@testuser.com',
                            password: 'thisisthetestpw',
                            firstName: 'Tester',
                            username: 'tester',
                        });
                    expect(response.statusCode).toBe(201);
                    expect(response.body.accessToken).toBeTruthy();
                    expect(response.header['set-cookie'][0]).toMatch(/jid/);
                });
            });

            describe('does not register an existing user', () => {
                test('responds with status code 500', async () => {
                    const response = await request(app)
                        .post('/auth/signup')
                        .send({
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
                    const response = await request(app)
                        .post('/auth/signin')
                        .send({
                            email: 'testuser@testuser.com',
                            password: 'thisisthetestpw',
                        });
                    expect(response.statusCode).toBe(200);
                });

                test('accessToken in response is not empty', async () => {
                    const response = await request(app)
                        .post('/auth/signin')
                        .send({
                            email: 'testuser@testuser.com',
                            password: 'thisisthetestpw',
                        });
                    expect(response.body.accessToken).not.toBe('');
                });

                test('cookie was set', async () => {
                    const response = await request(app)
                        .post('/auth/signin')
                        .send({
                            email: 'testuser@testuser.com',
                            password: 'thisisthetestpw',
                        });
                    // console.log(response.header['set-cookie'][0]);
                    expect(response.header['set-cookie'][0]).toMatch(/jid/);
                });

                test('email in response is not empty', async () => {
                    const response = await request(app)
                        .post('/auth/signin')
                        .send({
                            email: 'testuser@testuser.com',
                            password: 'thisisthetestpw',
                        });
                    expect(response.body.email).toBe('testuser@testuser.com');
                });
            });

            describe('does not sign in the user', () => {
                test('wrong email, responds with status code 401', async () => {
                    const response = await request(app)
                        .post('/auth/signin')
                        .send({
                            email: 'incorrect@email.com',
                            password: 'thisisthetestpw',
                        });
                    expect(response.statusCode).toBe(401);
                });

                test('wrong pw, responds with status code 401', async () => {
                    const response = await request(app)
                        .post('/auth/signin')
                        .send({
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
};

export default authenticationTestSuite;
