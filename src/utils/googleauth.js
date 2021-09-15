import { OAuth2Client } from 'google-auth-library';
import { User } from '../api/user/user.model.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuthController = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });

    const { email, given_name, email_verified, picture } = ticket.getPayload();

    if (!email_verified)
      return res.status(400).send({ message: 'Google Mail is not verified.' });

    const existingUser = await User.findOne({ email: email }).lean().exec();

    if (!existingUser) {
      const createduser = await User.create({
        email: email,
        firstName: given_name,
        picture: picture,
        googleToken: token,
      });

      return res.status(200).json({ user: createduser });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { email: email, firstName: name, picture: picture, googleToken: token },
      { upsert: true }
    ).exec();

    return res.status(200).json({ user: updatedUser });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const deleteGoogleUser = async (req, res) => {
  const email = req.body.email;

  try {
    const removed = await User.findOneAndRemove({ email: email }).exec();

    if (!removed) {
      return res.status(400).end();
    }

    res.status(200).json({ data: removed });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};
