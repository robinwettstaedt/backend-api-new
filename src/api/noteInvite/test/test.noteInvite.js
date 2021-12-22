/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */

import authorizedRequest from '../../../__test__/utils/authorizedRequest';
import {
    userWithAccess,
    secondUserWithAccess,
    userWithNoAccess,
} from '../../../__test__/utils/variables/userVariables';

import { redNotebook } from '../../../__test__/utils/variables/notebookVariables';

import { firstNote } from '../../../__test__/utils/variables/noteVariables';

const noteInviteTestSuite = () => {
    describe('Test NoteInvite Controllers', () => {
        beforeAll(async () => {
            const authedReq = await authorizedRequest(userWithAccess);

            const response = await authedReq.get('/api/v1/user');

            userWithAccess._id = response.body.user._id;
        });

        beforeAll(async () => {
            const authedReq = await authorizedRequest(secondUserWithAccess);

            const response = await authedReq.get('/api/v1/user');

            secondUserWithAccess._id = response.body.user._id;
        });

        beforeAll(async () => {
            const authedReq = await authorizedRequest(userWithNoAccess);

            const response = await authedReq.get('/api/v1/user');

            userWithNoAccess._id = response.body.user._id;
        });

        beforeAll(async () => {
            const authedReq = await authorizedRequest(userWithAccess);

            const response = await authedReq.get('/api/v1/notebook');

            redNotebook._id = response.body[0]._id;

            redNotebook.notes = response.body[0].notes;
            firstNote._id = redNotebook.notes[0]._id;
        });

        describe('POST /api/v1/note/:id/invites', () => {
            test(`invites the secondUserWithAccess to the firstNote`, async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq
                    .post(`/api/v1/note/${firstNote._id}/invites`)
                    .send({ receiver: secondUserWithAccess._id });

                secondUserWithAccess.invite = response.body._id;

                expect(response.statusCode).toBe(201);
                expect(response.body.receiver._id).toEqual(
                    secondUserWithAccess._id
                );
                expect(response.body.inviter.email).toEqual(
                    userWithAccess.email
                );
                expect(response.body.note).toEqual(firstNote._id);
            });

            test(`invites the userWithNoAccess to the firstNote`, async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq
                    .post(`/api/v1/note/${firstNote._id}/invites`)
                    .send({ receiver: userWithNoAccess._id });

                userWithNoAccess.invite = response.body._id;

                expect(response.statusCode).toBe(201);
                expect(response.body.receiver._id).toEqual(
                    userWithNoAccess._id
                );
                expect(response.body.inviter.email).toEqual(
                    userWithAccess.email
                );
                expect(response.body.note).toEqual(firstNote._id);
            });

            test(`can not invite oneself, no new invite gets created`, async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq
                    .post(`/api/v1/note/${firstNote._id}/invites`)
                    .send({ receiver: userWithAccess._id });

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toMatch(/Can not invite/);
            });

            test(`invite already exists, no new invite gets created`, async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq
                    .post(`/api/v1/note/${firstNote._id}/invites`)
                    .send({ receiver: userWithNoAccess._id });

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toMatch(/Invite already exists/);
            });

            test(`secondUser can not create a new invite for firstNote`, async () => {
                const authedReq = await authorizedRequest(secondUserWithAccess);

                const response = await authedReq
                    .post(`/api/v1/note/${firstNote._id}/invites`)
                    .send({ receiver: userWithNoAccess._id });

                expect(response.statusCode).toBe(403);
            });
        });

        describe('GET /api/v1/note/:id/invites', () => {
            test(`fetches all invites for the firstNote`, async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq.get(
                    `/api/v1/note/${firstNote._id}/invites`
                );

                expect(response.statusCode).toBe(200);
                expect(response.body[0].note).toEqual(firstNote._id);
                expect(response.body[0].receiver._id).toEqual(
                    secondUserWithAccess._id
                );
                expect(response.body[0].inviter._id).toEqual(
                    userWithAccess._id
                );
                expect(response.body[1].receiver._id).toEqual(
                    userWithNoAccess._id
                );
                expect(response.body[1].inviter._id).toEqual(
                    userWithAccess._id
                );
            });
        });

        describe('GET /api/v1/user/invites', () => {
            test('fetches the invites for secondUserWithAccess', async () => {
                const authedReq = await authorizedRequest(secondUserWithAccess);

                const response = await authedReq.get('/api/v1/user/invites');

                const { noteInvites } = response.body;

                expect(response.statusCode).toBe(200);
                expect(noteInvites[0].note).toEqual(firstNote._id);
            });
        });

        describe('DELETE /api/v1/note/invites/:invite_id/accept', () => {
            test(`secondUserWithAccess accepts invite`, async () => {
                const authedReq = await authorizedRequest(secondUserWithAccess);

                const response = await authedReq.delete(
                    `/api/v1/note/invites/${secondUserWithAccess.invite}/accept`
                );

                expect(response.statusCode).toBe(200);
                expect(response.body.receiver._id).toEqual(
                    secondUserWithAccess._id
                );
                expect(response.body.inviter.email).toEqual(
                    userWithAccess.email
                );
                expect(response.body.note).toEqual(firstNote._id);
            });

            test(`secondUserWithAccess can not accept userWithNoAccess' invite`, async () => {
                const authedReq = await authorizedRequest(secondUserWithAccess);

                const response = await authedReq.delete(
                    `/api/v1/note/invites/${userWithNoAccess.invite}/accept`
                );

                expect(response.statusCode).toBe(403);
            });

            test(`invalid invite id`, async () => {
                const authedReq = await authorizedRequest(secondUserWithAccess);

                const response = await authedReq.delete(
                    `/api/v1/note/invites/${userWithAccess._id}/accept`
                );

                expect(response.statusCode).toBe(404);
            });
        });

        describe('DELETE /api/v1/note/invites/:invite_id', () => {
            test(`secondUserWithAccess tries to delete an invite they are not involved in`, async () => {
                const authedReq = await authorizedRequest(secondUserWithAccess);

                const response = await authedReq.delete(
                    `/api/v1/note/invites/${userWithNoAccess.invite}`
                );

                expect(response.statusCode).toBe(403);
            });

            test(`userWithNoAccess declines invite`, async () => {
                const authedReq = await authorizedRequest(userWithNoAccess);

                const response = await authedReq.delete(
                    `/api/v1/note/invites/${userWithNoAccess.invite}`
                );

                expect(response.statusCode).toBe(200);
                expect(response.body.receiver._id).toEqual(
                    userWithNoAccess._id
                );
                expect(response.body.inviter.email).toEqual(
                    userWithAccess.email
                );
                expect(response.body.note).toEqual(firstNote._id);
            });
        });

        describe('POST /api/v1/note/:id/invites', () => {
            test(`invites the userWithNoAccess to the firstNote again`, async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq
                    .post(`/api/v1/note/${firstNote._id}/invites`)
                    .send({ receiver: userWithNoAccess._id });

                userWithNoAccess.invite = response.body._id;

                expect(response.statusCode).toBe(201);
                expect(response.body.receiver._id).toEqual(
                    userWithNoAccess._id
                );
                expect(response.body.inviter.email).toEqual(
                    userWithAccess.email
                );
                expect(response.body.note).toEqual(firstNote._id);
            });

            test(`tries to invite the secondUser to the firstNote again`, async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq
                    .post(`/api/v1/note/${firstNote._id}/invites`)
                    .send({ receiver: secondUserWithAccess._id });

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toMatch(/User does already/);
            });
        });

        describe('DELETE /api/v1/note/invites/:invite_id', () => {
            test(`userWithAccess revokes the invite of userWithNoAccess`, async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq.delete(
                    `/api/v1/note/invites/${userWithNoAccess.invite}`
                );

                expect(response.statusCode).toBe(200);
                expect(response.body.receiver._id).toEqual(
                    userWithNoAccess._id
                );
                expect(response.body.inviter.email).toEqual(
                    userWithAccess.email
                );
                expect(response.body.note).toEqual(firstNote._id);
            });
        });

        describe('PUT /api/v1/note/:id', () => {
            test('secondUserWithAccess updates the note', async () => {
                const authedReq = await authorizedRequest(secondUserWithAccess);

                const response = await authedReq
                    .put(`/api/v1/note/${firstNote._id}`)
                    .send({
                        title: 'title',
                        content: 'content',
                    });

                expect(response.statusCode).toBe(200);
                expect(response.body.title).toEqual('title');
                expect(response.body.content).toEqual('content');
                expect(response.body._id).toEqual(firstNote._id);
            });
        });

        describe('PUT /api/v1/note/:id/access/remove', () => {
            test('secondUser can not remove userWithAccess from firstNotes has Access', async () => {
                const authedReq = await authorizedRequest(secondUserWithAccess);

                const response = await authedReq
                    .put(`/api/v1/note/${firstNote._id}/access/remove`)
                    .send({
                        _id: userWithAccess._id,
                    });

                expect(response.statusCode).toBe(403);
            });

            test('removes secondUser from firstNotes has Access', async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq
                    .put(`/api/v1/note/${firstNote._id}/access/remove`)
                    .send({
                        _id: secondUserWithAccess._id,
                    });

                expect(response.statusCode).toBe(200);
                expect(response.body.title).toEqual('title');
                expect(response.body.content).toEqual('content');
                expect(response.body._id).toEqual(firstNote._id);
            });
        });

        describe('PUT /api/v1/note/:id', () => {
            test('secondUserWithAccess can not update the note', async () => {
                const authedReq = await authorizedRequest(secondUserWithAccess);

                const response = await authedReq
                    .put(`/api/v1/note/${firstNote._id}`)
                    .send({
                        title: 'title',
                        content: 'content',
                    });

                expect(response.statusCode).toBe(403);
            });

            test('userWithAccess reverts the updates of firstNote', async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq
                    .put(`/api/v1/note/${firstNote._id}`)
                    .send({
                        title: firstNote.title,
                        content: firstNote.content,
                    });

                expect(response.statusCode).toBe(200);
                expect(response.body.title).toEqual(firstNote.title);
                expect(response.body.content).toEqual(firstNote.content);
                expect(response.body._id).toEqual(firstNote._id);
            });
        });
    });
};

export default noteInviteTestSuite;
