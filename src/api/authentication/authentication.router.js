import express from 'express';
import googleAuthController from './googleAuth.controllers';
import {
    signup,
    signin,
    signout,
    refreshAccessToken,
} from './authentication.controllers';

const router = express.Router();

router.route('/signup').post(signup);
router.route('/signin').post(signin);
router.route('/signout').post(signout);
router.route('/refreshaccess').post(refreshAccessToken);
router.route('/signinwithgoogle').post(googleAuthController);

export default router;
