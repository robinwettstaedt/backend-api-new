/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */

import authorizedRequest from '../../../__test__/utils/authorizedRequest';
import {
    userWithAccess,
    secondUserWithAccess,
    userWithNoAccess,
} from '../../../__test__/utils/variables/userVariables';

import { redNotebook } from '../../../__test__/utils/variables/notebookVariables';

import {
    firstNote,
    secondNote,
} from '../../../__test__/utils/variables/noteVariables';

const noteInviteTestSuite = () => {
    describe('Test NoteInvite Controllers', () => {
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
        });

        describe('DELETE /api/v1/note/invites/:invite_id', () => {
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

/**
 *
 * Checklist:
 *
 * invite secondUser to firstNote
 * invite userWithNoAccess to firstNote
 * accept invite with secondUser
 * uninvite userWithNoAccess to firstNote
 * check that secondUser can update firstNote
 *
 * remove secondUser from firstNote's hasAccess
 * check that secondUser can not update firstNote
 *
 * ----------------------
 * above is checked off
 *
 *
 *
 * error cases for each endpoint
 *
 *
 *
 *
 * invite secondUser to redNotebook
 * accept with secondUser
 * check if firstNote's hasAccess has been cascadingly updated
 * check that secondUser can update firstNote
 *
 * remove secondUser from redNotebook's hasAccess
 * check if firstNote's hasAccess has been cascadingly updated
 * check that secondUser can not update firstNote anymore
 *
 *
 */
