/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */

import authorizedRequest from '../../../__test__/utils/authorizedRequest';
import {
    userWithAccess,
    secondUserWithAccess,
    userWithNoAccess,
} from '../../../__test__/utils/variables/userVariables';

import {
    greenNotebook,
    redNotebook,
    blueNotebook,
} from '../../../__test__/utils/variables/notebookVariables';

const notebookTestSuite = () => {
    describe('Test Notebook Controllers', () => {
        describe('POST /api/v1/notebook', () => {
            test('responds with correct information about the redNotebook', async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq.post('/api/v1/notebook').send({
                    title: redNotebook.title,
                    color: redNotebook.color,
                });

                redNotebook._id = response.body._id;

                expect(response.statusCode).toBe(201);
                expect(response.body.hasAccess[0].email).toEqual(
                    userWithAccess.email
                );
                expect(response.body.notes).toEqual([]);
                expect(response.body.createdBy).toEqual(
                    response.body.hasAccess[0]._id
                );
                expect(response.body.deleted).toEqual(false);
                expect(response.body.visible).toEqual(true);
                expect(response.body.color).toEqual(redNotebook.color);
                expect(response.body.title).toEqual(redNotebook.title);
            });

            test('responds with correct information about the greenNotebook', async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq.post('/api/v1/notebook').send({
                    title: greenNotebook.title,
                    color: greenNotebook.color,
                });

                greenNotebook._id = response.body._id;

                expect(response.statusCode).toBe(201);
                expect(response.body.hasAccess[0].email).toEqual(
                    userWithAccess.email
                );
                expect(response.body.notes).toEqual([]);
                expect(response.body.createdBy).toEqual(
                    response.body.hasAccess[0]._id
                );
                expect(response.body.deleted).toEqual(false);
                expect(response.body.visible).toEqual(true);
                expect(response.body.color).toEqual(greenNotebook.color);
                expect(response.body.title).toEqual(greenNotebook.title);
            });

            test('responds with correct information about the blueNotebook', async () => {
                const authedReq = await authorizedRequest(secondUserWithAccess);

                const response = await authedReq.post('/api/v1/notebook').send({
                    title: blueNotebook.title,
                    color: blueNotebook.color,
                });

                blueNotebook._id = response.body._id;

                expect(response.statusCode).toBe(201);
                expect(response.body.hasAccess[0].email).toEqual(
                    secondUserWithAccess.email
                );
                expect(response.body.notes).toEqual([]);
                expect(response.body.createdBy).toEqual(
                    response.body.hasAccess[0]._id
                );
                expect(response.body.deleted).toEqual(false);
                expect(response.body.visible).toEqual(true);
                expect(response.body.color).toEqual(blueNotebook.color);
                expect(response.body.title).toEqual(blueNotebook.title);
            });

            test('does not create the notebook (color is not a hex value)', async () => {
                const authedReq = await authorizedRequest(secondUserWithAccess);

                const response = await authedReq.post('/api/v1/notebook').send({
                    title: blueNotebook.title,
                    color: 'blue',
                });

                expect(response.statusCode).toBe(400);
                expect(response.body.message).toMatch(/hex string/);
            });

            test('does not create the notebook (title missing)', async () => {
                const authedReq = await authorizedRequest(secondUserWithAccess);

                const response = await authedReq.post('/api/v1/notebook').send({
                    color: blueNotebook.color,
                });

                expect(response.statusCode).toBe(400);
            });
        });

        describe('PUT /api/v1/notebook/:id', () => {
            test('correctly updates the notebook', async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq
                    .put(`/api/v1/notebook/${greenNotebook._id}`)
                    .send({
                        title: redNotebook.title,
                        color: redNotebook.color,
                    });

                expect(response.statusCode).toBe(200);
                expect(response.body.title).toEqual(redNotebook.title);
                expect(response.body.color).toEqual(redNotebook.color);
                expect(response.body._id).toEqual(greenNotebook._id);
            });

            test('marks the notebook as deleted', async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq
                    .put(`/api/v1/notebook/${greenNotebook._id}`)
                    .send({
                        deleted: true,
                    });

                expect(response.statusCode).toBe(200);
                expect(response.body.deleted).toBe(true);
                expect(response.body.deletedAt).not.toBeNull();
                expect(response.body.archived).toBe(false);
            });

            test('marks the notebook as archived', async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq
                    .put(`/api/v1/notebook/${greenNotebook._id}`)
                    .send({
                        archived: true,
                    });

                expect(response.statusCode).toBe(200);
                expect(response.body.archived).toBe(true);
                expect(response.body.archivedAt).not.toBeNull();
                expect(response.body.deleted).toBe(false);
            });

            test('reverts previous updates', async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq
                    .put(`/api/v1/notebook/${greenNotebook._id}`)
                    .send({
                        title: greenNotebook.title,
                        color: greenNotebook.color,
                        archived: false,
                    });

                expect(response.statusCode).toBe(200);
                expect(response.body.title).toEqual(greenNotebook.title);
                expect(response.body.color).toEqual(greenNotebook.color);
                expect(response.body._id).toEqual(greenNotebook._id);
                expect(response.body.deleted).toBe(false);
                expect(response.body.deletedAt).toBeNull();
                expect(response.body.archived).toBe(false);
                expect(response.body.archivedAt).toBeNull();
            });

            test('does not update the notebook (color not a hex value)', async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq
                    .put(`/api/v1/notebook/${greenNotebook._id}`)
                    .send({
                        color: 'green',
                    });

                expect(response.statusCode).toBe(400);
            });

            test('hasAccess field does not get updated (access is handled via different routes)', async () => {
                const authedReq = await authorizedRequest(userWithAccess);

                const response = await authedReq
                    .put(`/api/v1/notebook/${greenNotebook._id}`)
                    .send({
                        hasAccess: ['me', 'you'],
                    });

                expect(response.statusCode).toBe(200);
                expect(response.body.hasAccess[1]).toBeUndefined();
                expect(response.body.hasAccess[0].email).toEqual(
                    userWithAccess.email
                );
            });

            test('does not update notebook (userWithNoAccess trying to update)', async () => {
                const authedReq = await authorizedRequest(userWithNoAccess);

                const response = await authedReq
                    .put(`/api/v1/notebook/${greenNotebook._id}`)
                    .send({
                        title: 'hehe',
                    });

                expect(response.statusCode).toBe(403);
            });
        });

        describe('DELETE /api/v1/notebook/:id', () => {
            test('deletes the notebook', async () => {
                const authedReq = await authorizedRequest(secondUserWithAccess);

                const response = await authedReq.delete(
                    `/api/v1/notebook/${blueNotebook._id}`
                );

                expect(response.statusCode).toBe(200);
                expect(response.body.title).toEqual(blueNotebook.title);
            });

            test('responds with 404 (notebook does not exist)', async () => {
                const authedReq = await authorizedRequest(secondUserWithAccess);

                const response = await authedReq.get(
                    `/api/v1/notebook/${blueNotebook._id}`
                );

                expect(response.statusCode).toBe(404);
            });
        });
    });
};

export default notebookTestSuite;
