/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */

import request from 'supertest';
import dotenv from 'dotenv';
import app from '../../app';

dotenv.config();

const loginUser = async (user) => {
    const response = await request(app).post('/auth/signin').send({
        email: user.email,
        password: user.password,
    });

    return response.body.accessToken;
};

export default loginUser;
