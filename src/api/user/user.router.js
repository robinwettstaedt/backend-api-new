import express from 'express';
import controllers from './user.controllers';

const router = express.Router();

router
    .route('/')
    .get(controllers.getOne)
    .put(controllers.updateOne)
    .delete(controllers.removeOne);

router.route('/invites').get(controllers.getInvites);

export default router;
