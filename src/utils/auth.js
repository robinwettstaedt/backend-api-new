import { User } from '../api/user/user.model.js';
import jwt from 'jsonwebtoken';

export const createAccessToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, {
    // expiresIn: '15min',
    expiresIn: '7d',
  });
};

export const createRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: '30d',
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
    const user = await User.findOne({ email: req.body.email }).exec();

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

    return res
      .status(201)
      .send({ accessToken: accessToken, user_email: user.email });
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

// sets the refreshToken cookie to be empty so that the user will not be logged in automatically
export const signout = (req, res) => {
  res.cookie('jid', '').status(200).end();
};

// generates and return a new accessToken to the user by validating their refreshToken
// is requested by the frontend via a timeout function, so that the access token is silently refreshed before it runs out
export const refreshAccessToken = async (req, res) => {
  const token = req.cookies.jid;
  if (!token) return res.status(401).send({ message: 'no token cookie set' });

  let payload;

  try {
    payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    console.log(error);
    return res.status(401).send({ message: 'invalid' });
  }

  try {
    const user = await User.findOne({ id: payload.id })
      .select('id tokenVersion')
      .exec();

    if (!user || payload.tokenVersion !== user.tokenVersion) {
      return res.status(401).send({ message: 'invalid auth token' });
    }

    const newAccessToken = createAccessToken(user);

    return res.status(201).send({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(401).send({ message: 'invalid auth token' });
  }
};

// invalidates the users refreshToken, so the user will have to log in again on every device
// e.g. when user forgets password
export const revokeRefreshToken = async (user) => {
  try {
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
// checking each incoming request to /api/... for the Authorization Header
// verifies the JWT inside
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
    return res.status(401).send({ message: 'token verification missed' });
  }

  const user = await User.findById(payload.id)
    .select('-password -googleToken -tokenVersion -__v')
    .lean()
    .exec();

  if (!user) {
    return res.status(401).end();
  }

  // appends the user object to the request, for use in controllers
  req.user = user;
  next();
};
