import express from 'express';
import { body } from 'express-validator';
import googleAuthController from './googleAuth.controllers';
import {
    signup,
    signin,
    signout,
    refreshAccessToken,
    checkUsernameAvailability,
} from './authentication.controllers';

const router = express.Router();

router
    .route('/signup')
    .post(
        body('email').isEmail(),
        body('password').isLength({ min: 4, max: 64 }),
        body('username').isLength({ min: 2, max: 20 }),
        body('firstName').isLength({ min: 2, max: 20 }),
        signup
    );
router.route('/signin').post(signin);
router.route('/signout').post(signout);
router.route('/refreshaccess').post(refreshAccessToken);
router.route('/signinwithgoogle').post(googleAuthController);
router.route('/checkusername').post(checkUsernameAvailability);

export default router;
