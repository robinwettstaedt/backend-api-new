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
        test('API should be locked down', async () => {
            let response = await request(app).get('/api/note');
            expect(response.statusCode).toBe(401);

            response = await request(app).get('/api/notebook');
            expect(response.statusCode).toBe(401);

            response = await request(app).get('/api/todo');
            expect(response.statusCode).toBe(401);
        });

        describe('POST /signup', () => {
            test('registers the userWithAccess', async () => {
                const response = await request(app).post('/auth/signup').send({
                    email: userWithAccess.email,
                    password: userWithAccess.password,
                    firstName: userWithAccess.firstName,
                    username: userWithAccess.username,
                });
                expect(response.statusCode).toBe(201);
                expect(response.body.accessToken).toBeTruthy();
                expect(response.header['set-cookie'][0]).toMatch(/jid=ey/);
            });

            test('does not register an existing user', async () => {
                const response = await request(app).post('/auth/signup').send({
                    email: userWithAccess.email,
                    password: userWithAccess.password,
                    firstName: userWithAccess.firstName,
                    username: userWithAccess.username,
                });
                expect(response.statusCode).toBe(400);
                expect(response.body).toEqual({});
                expect(response.header['set-cookie']).toBeUndefined();
            });

            test('registers the secondUserWithAccess', async () => {
                const response = await request(app).post('/auth/signup').send({
                    email: secondUserWithAccess.email,
                    password: secondUserWithAccess.password,
                    firstName: secondUserWithAccess.firstName,
                    username: secondUserWithAccess.username,
                });
                expect(response.statusCode).toBe(201);
                expect(response.body.accessToken).toBeTruthy();
                expect(response.header['set-cookie'][0]).toMatch(/jid=ey/);
            });

            test('registers the userWithNoAccess', async () => {
                const response = await request(app).post('/auth/signup').send({
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

        describe('JWT creation functions', () => {
            test('returns a JWT accessToken', async () => {
                const user = await User.findOne({
                    email: userWithAccess.email,
                }).exec();
                expect(createAccessToken(user)).toMatch(/ey/);
            });

            test('returns a JWT refreshToken', async () => {
                const user = await User.findOne({
                    email: userWithAccess.email,
                }).exec();
                expect(createRefreshToken(user)).toMatch(/ey/);
            });
        });

        describe('POST /signin', () => {
            test('signs in the userWithAccess', async () => {
                const response = await request(app).post('/auth/signin').send({
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

            test('signs in the secondUserWithAccess', async () => {
                const response = await request(app).post('/auth/signin').send({
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

            test('wrong email, does not sign in the user', async () => {
                const response = await request(app).post('/auth/signin').send({
                    email: 'incorrect@email.com',
                    password: userWithAccess.password,
                });
                expect(response.statusCode).toBe(404);
                expect(response.body.message).toMatch(/User not found/);
            });

            test('wrong password, does not sign in the user', async () => {
                const response = await request(app).post('/auth/signin').send({
                    email: userWithAccess.email,
                    password: 'thisisthewrongpw',
                });
                expect(response.statusCode).toBe(401);
                expect(response.body.message).toMatch(
                    /Invalid email and password combination/
                );
            });

            test('missing email, does not sign in the user', async () => {
                const response = await request(app).post('/auth/signin').send({
                    password: userWithAccess.password,
                });
                expect(response.statusCode).toBe(400);
            });

            test('missing password, does not sign in the user', async () => {
                const response = await request(app).post('/auth/signin').send({
                    email: userWithAccess.email,
                });
                expect(response.statusCode).toBe(400);
            });
        });

        describe('POST /signout', () => {
            test('signs out the user', async () => {
                const response = await request(app).post('/auth/signout');

                expect(response.statusCode).toBe(200);
                expect(response.header['set-cookie'][0]).toMatch(/jid=;/);
            });
        });

        describe('POST /refreshaccess', () => {
            test("refreshes the userWithAccess's access token", async () => {
                const req = request(app).post('/auth/refreshaccess');

                req.cookies = userWithAccess.cookie;

                const response = await req.send();

                userWithAccess.token = `Bearer ${response.body.accessToken}`;

                expect(response.statusCode).toBe(201);
                expect(response.body.accessToken).not.toBe('');
            });

            test('userWithAccess: ensures the previously set accessToken is correct', async () => {
                const response = await request(app)
                    .get('/api/v1/user')
                    .set('Authorization', userWithAccess.token);

                expect(response.statusCode).toBe(200);
                expect(response.body.user.username).toEqual(
                    userWithAccess.username
                );
            });

            test("refreshes the secondUserWithAccess's access token", async () => {
                const req = request(app).post('/auth/refreshaccess');

                req.cookies = secondUserWithAccess.cookie;

                const response = await req.send();

                secondUserWithAccess.token = `Bearer ${response.body.accessToken}`;

                expect(response.statusCode).toBe(201);
                expect(response.body.accessToken).not.toBe('');
            });

            test('secondUserWithAccess: ensures the previously set accessToken is correct', async () => {
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
};

export default authenticationTestSuite;
