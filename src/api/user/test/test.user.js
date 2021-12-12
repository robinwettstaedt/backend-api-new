/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */

import authorizedRequest from '../../../__test__/utils/authorizedRequest';
import {
    userWithAccess,
    secondUserWithAccess,
    userWithNoAccess,
} from '../../../__test__/utils/testVariables';

const userTestSuite = () => {
    describe('Test User Controllers', () => {
        describe('GET /api/v1/user', () => {
            describe('fetches user data for the first user', () => {
                test('responds with status code 200 & correct user information', async () => {
                    const authedReq = await authorizedRequest(userWithAccess);

                    const response = await authedReq.get('/api/v1/user');
                    expect(response.statusCode).toBe(200);
                    expect(response.body.user.username).toEqual(
                        userWithAccess.username
                    );
                });
            });

            describe('fetches user data for the second user', () => {
                test('responds with status code 200 & correct user information', async () => {
                    const authedReq = await authorizedRequest(
                        secondUserWithAccess
                    );

                    const response = await authedReq.get('/api/v1/user');
                    expect(response.statusCode).toBe(200);
                    expect(response.body.user.username).toEqual(
                        secondUserWithAccess.username
                    );
                });
            });

            describe('fetches user data for the third user', () => {
                test('responds with status code 200 & correct user information', async () => {
                    const authedReq = await authorizedRequest(userWithNoAccess);

                    const response = await authedReq.get('/api/v1/user');
                    expect(response.statusCode).toBe(200);
                    expect(response.body.user.username).toEqual(
                        userWithNoAccess.username
                    );
                });
            });
        });

        describe('PUT /api/v1/user', () => {
            test('updates the theme, responds with status code 200 and the user data', async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq.put('/api/v1/user').send({
                    username: 'Knoff',
                    settings: { theme: 'LIGHT', notifications: 'INVITES' },
                });

                expect(response.statusCode).toBe(200);
                expect(response.body.data.email).toEqual(userWithAccess.email);
                expect(response.body.data.settings.theme).toEqual('LIGHT');
                expect(response.body.data.settings.notifications).toEqual(
                    'INVITES'
                );
                expect(response.body.data.password).toBeUndefined();
                expect(response.body.data.googleToken).toBeUndefined();
                expect(response.body.data.tokenVersion).toBeUndefined();
                expect(response.body.data.username).toEqual('Knoff');
            });

            test('does not update the theme, responds with status code 400 and an error message', async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq.put('/api/v1/user').send({
                    settings: { theme: 'QUARK', notifications: 'ALL' },
                });

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toMatch(/<theme> value/);
            });

            test('does not update the notifications setting, responds with status code 400 and an error message', async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq.put('/api/v1/user').send({
                    settings: { theme: 'DARK', notifications: 'QUARK' },
                });

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toMatch(/<notifications> value/);
            });

            test('does not update googleToken as user has registered via email', async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                // users with password have signed in with email, not with google auth and can therefore not change their googleToken
                const response = await authedReq.put('/api/v1/user').send({
                    googleToken: 'AAAAAAA',
                });

                expect(response.statusCode).toBe(400);
            });

            describe('sending arbitrary json as update data is filtered by mongoose', () => {
                test('responds with status code 200, username change is reversed, arbitrary data does not exist on response body', async () => {
                    const authedReq = await authorizedRequest(userWithAccess);

                    // users with password have signed in with email, not with google auth and can therefore not change their googleToken
                    const response = await authedReq.put('/api/v1/user').send({
                        hello: 'data',
                        username: userWithAccess.username,
                    });

                    expect(response.statusCode).toBe(200);
                    expect(response.body.data.hello).toBeUndefined();
                    expect(response.body.data.username).toEqual(
                        userWithAccess.username
                    );
                });
            });
        });
    });
};

export default userTestSuite;
