import { OAuth2Client } from 'google-auth-library';
import User from '../user/user.model';
import {
    createRefreshToken,
    createAccessToken,
} from './authentication.controllers';

// attributes from google auth are snake case, that's why I disabled the eslint rule
/* eslint camelcase: 0 */

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// change so that the user object from the db is used to create jwts and send them back (accessToken) or put them in cookie (refreshToken)
const googleAuthController = async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID,
        });

        const { email, given_name, email_verified, picture } =
            ticket.getPayload();

        const defaultUsername = email.split('@')[0];

        if (!email_verified)
            return res
                .status(400)
                .send({ message: 'Google Mail is not verified.' });

        const existingUser = await User.findOne({ email }).lean().exec();

        if (!existingUser) {
            const createduser = await User.create({
                username: defaultUsername,
                email,
                firstName: given_name,
                picture,
                googleToken: token,
            });

            const refreshToken = createRefreshToken(createduser);

            res.cookie('jid', refreshToken, {
                httpOnly: true,
                path: process.env.HTTP_ONLY_COOKIE_PATH,
            });

            const accessToken = createAccessToken(createduser);

            return res.status(201).send({ accessToken });
        }

        await User.findOneAndUpdate(
            { email },
            {
                googleToken: token,
            },
            { new: true }
        ).exec();

        const refreshToken = createRefreshToken(existingUser);

        res.cookie('jid', refreshToken, {
            httpOnly: true,
            path: process.env.HTTP_ONLY_COOKIE_PATH,
        });

        const accessToken = createAccessToken(existingUser);

        return res.status(201).send({ accessToken });
    } catch (e) {
        return res.status(400).end();
    }
};

export default googleAuthController;
