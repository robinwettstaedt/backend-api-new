import { User } from '../api/user/user.model.js';
import jwt from 'jsonwebtoken';

export const createAccessToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15min',
  });
};

export const createRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: '7d',
    }
  );
};

export const signin = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res
      .status(400)
      .send({ message: 'email and password need to be provided' });
  }

  const invalid = { message: 'Invalid email and password combination' };

  try {
    const user = await User.findOne({ email: req.body.email })
      .select('email password')
      .exec();

    if (!user) {
      return res.status(401).send(invalid);
    }

    const match = await user.checkPassword(req.body.password);

    if (!match) {
      return res.status(401).send(invalid);
    }

    const refreshToken = createRefreshToken(user);

    res.cookie('jid', refreshToken, {
      httpOnly: true,
      path: '/refresh_token',
    });

    const accessToken = createAccessToken(user);
    return res.status(201).send({ accessToken: accessToken });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
};

export const signup = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ message: 'need email and password' });
  }

  try {
    const user = await User.create(req.body);

    const refreshToken = createRefreshToken(user);

    res.cookie('jid', refreshToken, {
      httpOnly: true,
      path: '/refresh_token',
    });

    const accessToken = createAccessToken(user);
    return res.status(201).send({ accessToken: accessToken });
  } catch (e) {
    console.error(e);
    return res.status(500).end();
  }
};

export const signout = (user) => {
  res.cookie('jid', '', {
    httpOnly: true,
    path: '/refresh_token',
  });
};

// not sure if getting the user details in the request body is a better way
export const refreshAccessToken = async (req, res) => {
  const token = req.cookie.jid;
  if (!token) return res.status(401).send({ message: 'invalid auth token' });

  let payload;

  try {
    payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    console.log(error);
    return res.status(401).send({ message: 'invalid auth token' });
  }

  try {
    const user = await User.findOne({ id: payload.id })
      .select('id tokenVersion')
      .exec();

    if (!user || payload.tokenVersion !== user.tokenVersion) {
      return res.status(401).send({ message: 'invalid auth token' });
    }

    return res.status(201).send({ accessToken: createAccessToken(user) });
  } catch (error) {
    return res.status(401).send({ message: 'invalid auth token' });
  }
};

export const revokeRefreshToken = async (user) => {
  try {
    // findOneAndUpdate returns a document whereas updateOne does not (it just returns the _id if it has created a new document).
    const updatedDoc = await User.findOneAndUpdate(
      { _id: user.id },
      { $inc: { tokenVersion: 1 } }
    ).exec();

    if (!updatedDoc) {
      return res.status(400).end();
    }

    res.status(200).send();
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

// middleware securing all routes
export const protect = async (req, res, next) => {
  const bearer = req.headers.authorization;

  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res.status(401).end();
  }

  const accessToken = bearer.split('Bearer ')[1].trim();
  let payload;
  try {
    payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  } catch (e) {
    return res.status(401).end();
  }

  const user = await User.findById(payload.id)
    .select('-password')
    .lean()
    .exec();

  if (!user) {
    return res.status(401).end();
  }

  req.user = user;
  next();
};
