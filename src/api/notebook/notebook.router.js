import express from 'express';
import controllers from './notebook.controllers';
import notebookInviteControllers from '../notebookInvite/notebookInvite.controllers';

const router = express.Router();

router.route('/').post(controllers.createOne).get(controllers.getMany);

router
    .route('/:id')
    .get(controllers.getOne)
    .put(controllers.updateOne)
    .delete(controllers.removeOne);

// router.route('/:id/access/add').put(controllers.addToHasAccess);
router.route('/:id/access/remove').put(controllers.removeFromHasAccess);

router
    .route('/:id/invites')
    .get(notebookInviteControllers.getMany)
    .post(notebookInviteControllers.createOne);

router
    .route('/invites/:invite_id')
    // when an invite is cancelled by the inviter or rejected by the receiver
    .delete(notebookInviteControllers.removeOne);

router
    .route('/invites/:invite_id/accept')
    .delete(notebookInviteControllers.acceptOne);

export default router;
