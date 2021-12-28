/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */

import authorizedRequest from '../../../__test__/utils/authorizedRequest';
import {
    userWithAccess,
    secondUserWithAccess,
    userWithNoAccess,
} from '../../../__test__/utils/variables/userVariables';

const userTestSuite = () => {
    describe('Test User Controllers', () => {
        describe('GET /api/v1/user', () => {
            test('responds with correct information on userWithAccess', async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq.get('/api/v1/user');
                expect(response.statusCode).toBe(200);
                expect(response.body.user.username).toEqual(
                    userWithAccess.username
                );
            });

            test('responds with correct information on secondUserWithAccess', async () => {
                const authedReq = await authorizedRequest(secondUserWithAccess);

                const response = await authedReq.get('/api/v1/user');
                expect(response.statusCode).toBe(200);
                expect(response.body.user.username).toEqual(
                    secondUserWithAccess.username
                );
            });

            test('responds with correct information on userWithNoAccess', async () => {
                const authedReq = await authorizedRequest(userWithNoAccess);

                const response = await authedReq.get('/api/v1/user');
                expect(response.statusCode).toBe(200);
                expect(response.body.user.username).toEqual(
                    userWithNoAccess.username
                );
            });
        });

        describe('PUT /api/v1/user', () => {
            test("updates the userWithAccess' settings", async () => {
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

            test('updates the notification but not the theme setting', async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq.put('/api/v1/user').send({
                    settings: { theme: 'QUARK', notifications: 'ALL' },
                });

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toMatch(/<theme> value/);
            });

            test('updates the theme but not the notifications setting', async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq.put('/api/v1/user').send({
                    settings: { theme: 'DARK', notifications: 'QUARK' },
                });

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toMatch(/<notifications> value/);
            });

            test('does not update the googleToken field as user has registered via email', async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq.put('/api/v1/user').send({
                    googleToken: 'AAAAAAA',
                });

                expect(response.statusCode).toBe(400);
            });

            test('sending arbitrary json as update data is filtered by mongoose', async () => {
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
};

export default userTestSuite;
