/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */

import request from 'supertest';
import app from '../../../app';
import {
    createAccessToken,
    createRefreshToken,
} from '../authentication.controllers';
import User from '../../user/user.model';
import {
    userWithAccess,
    secondUserWithAccess,
    userWithNoAccess,
} from '../../../__test__/utils/variables/userVariables';

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
            describe('registers a new user (userWithAccess)', () => {
                test('respond with status code 201, accessToken not empty, cookie was set', async () => {
                    const response = await request(app)
                        .post('/auth/signup')
                        .send({
                            email: userWithAccess.email,
                            password: userWithAccess.password,
                            firstName: userWithAccess.firstName,
                            username: userWithAccess.username,
                        });
                    expect(response.statusCode).toBe(201);
                    expect(response.body.accessToken).toBeTruthy();
                    expect(response.header['set-cookie'][0]).toMatch(/jid=ey/);
                });
            });

            describe('does not register an existing user', () => {
                test('responds with status code 500, no cookie set', async () => {
                    const response = await request(app)
                        .post('/auth/signup')
                        .send({
                            email: userWithAccess.email,
                            password: userWithAccess.password,
                            firstName: userWithAccess.firstName,
                            username: userWithAccess.username,
                        });
                    expect(response.statusCode).toBe(400);
                    expect(response.body).toEqual({});
                    expect(response.header['set-cookie']).toBeUndefined();
                });
            });

            describe('registers a second new user (secondUserWithAccess)', () => {
                test('respond with status code 201, accessToken not empty, cookie was set', async () => {
                    const response = await request(app)
                        .post('/auth/signup')
                        .send({
                            email: secondUserWithAccess.email,
                            password: secondUserWithAccess.password,
                            firstName: secondUserWithAccess.firstName,
                            username: secondUserWithAccess.username,
                        });
                    expect(response.statusCode).toBe(201);
                    expect(response.body.accessToken).toBeTruthy();
                    expect(response.header['set-cookie'][0]).toMatch(/jid=ey/);
                });
            });

            describe('registers a third new user (userWithNoAccess)', () => {
                test('respond with status code 201, accessToken not empty, cookie was set', async () => {
                    const response = await request(app)
                        .post('/auth/signup')
                        .send({
                            email: userWithNoAccess.email,
                            password: userWithNoAccess.password,
                            firstName: userWithNoAccess.firstName,
                            username: userWithNoAccess.username,
                        });
                    expect(response.statusCode).toBe(201);
                    expect(response.body.accessToken).toBeTruthy();
                    expect(response.header['set-cookie'][0]).toMatch(/jid=ey/);
                });
            });
        });

        describe('testing the jwt creation functions', () => {
            test('should return a jwt accessToken', async () => {
                const user = await User.findOne({
                    email: userWithAccess.email,
                }).exec();
                expect(createAccessToken(user)).toMatch(/ey/);
            });

            test('should return a jwt refreshToken', async () => {
                const user = await User.findOne({
                    email: userWithAccess.email,
                }).exec();
                expect(createRefreshToken(user)).toMatch(/ey/);
            });
        });

        describe('POST /signin', () => {
            describe('signs in the user', () => {
                test('responds with status code 200, accessToken not empty, cookie set', async () => {
                    const response = await request(app)
                        .post('/auth/signin')
                        .send({
                            email: userWithAccess.email,
                            password: userWithAccess.password,
                        });
                    expect(response.statusCode).toBe(200);
                    expect(response.body.accessToken).not.toBe('');
                    expect(response.header['set-cookie'][0]).toMatch(/jid=ey/);

                    const [cookie] = response.headers['set-cookie']
                        .pop()
                        .split(';');
                    userWithAccess.cookie = cookie;
                });
            });

            describe('signs in the second user', () => {
                test('responds with status code 200, accessToken not empty, cookie set', async () => {
                    const response = await request(app)
                        .post('/auth/signin')
                        .send({
                            email: secondUserWithAccess.email,
                            password: secondUserWithAccess.password,
                        });
                    expect(response.statusCode).toBe(200);
                    expect(response.body.accessToken).not.toBe('');
                    expect(response.header['set-cookie'][0]).toMatch(/jid=ey/);

                    const [cookie] = response.headers['set-cookie']
                        .pop()
                        .split(';');
                    secondUserWithAccess.cookie = cookie;
                });
            });

            describe('does not sign in the user', () => {
                test('wrong email, responds with status code 401', async () => {
                    const response = await request(app)
                        .post('/auth/signin')
                        .send({
                            email: 'incorrect@email.com',
                            password: userWithAccess.password,
                        });
                    expect(response.statusCode).toBe(404);
                    expect(response.body.message).toMatch(/User not found/);
                });

                test('wrong pw, responds with status code 401', async () => {
                    const response = await request(app)
                        .post('/auth/signin')
                        .send({
                            email: userWithAccess.email,
                            password: 'thisisthewrongpw',
                        });
                    expect(response.statusCode).toBe(401);
                    expect(response.body.message).toMatch(
                        /Invalid email and password combination/
                    );
                });
            });

            test('missing email, responds with status code 400', async () => {
                const response = await request(app).post('/auth/signin').send({
                    password: userWithAccess.password,
                });
                expect(response.statusCode).toBe(400);
            });

            test('missing pw, responds with status code 400', async () => {
                const response = await request(app).post('/auth/signin').send({
                    email: userWithAccess.email,
                });
                expect(response.statusCode).toBe(400);
            });
        });

        describe('POST /signout', () => {
            describe('signs out the user', () => {
                test('responds with status code 200, cookie "jid" now empty', async () => {
                    const response = await request(app).post('/auth/signout');

                    expect(response.statusCode).toBe(200);
                    expect(response.header['set-cookie'][0]).toMatch(/jid=;/);
                });
            });
        });

        describe('POST /refreshaccess', () => {
            describe('refreshes the users access token', () => {
                test('responds with status code 201, returns message with token', async () => {
                    const req = request(app).post('/auth/refreshaccess');

                    req.cookies = userWithAccess.cookie;

                    const response = await req.send();

                    userWithAccess.token = `Bearer ${response.body.accessToken}`;

                    expect(response.statusCode).toBe(201);
                    expect(response.body.accessToken).not.toBe('');
                });

                test('firstUser: ensures the previously set accessToken is correct', async () => {
                    const response = await request(app)
                        .get('/api/v1/user')
                        .set('Authorization', userWithAccess.token);

                    expect(response.statusCode).toBe(200);
                    expect(response.body.user.username).toEqual(
                        userWithAccess.username
                    );
                });
            });

            describe('refreshes the users access token', () => {
                test('responds with status code 201, returns message with token', async () => {
                    const req = request(app).post('/auth/refreshaccess');

                    req.cookies = secondUserWithAccess.cookie;

                    const response = await req.send();

                    secondUserWithAccess.token = `Bearer ${response.body.accessToken}`;

                    expect(response.statusCode).toBe(201);
                    expect(response.body.accessToken).not.toBe('');
                });

                test('secondUser: ensures the previously set accessToken is correct', async () => {
                    const response = await request(app)
                        .get('/api/v1/user')
                        .set('Authorization', secondUserWithAccess.token);

                    expect(response.statusCode).toBe(200);
                    expect(response.body.user.username).toEqual(
                        secondUserWithAccess.username
                    );
                });
            });
        });
    });
};

export default authenticationTestSuite;
