import express from 'express';
import controllers from './notebook.controllers.js';
import noteInviteControllers from '../notebookInvite/notebookInvite.controllers.js';

const router = express.Router();

router
  .route('/')
  // .get(controllers.getMany)
  .post(controllers.createOne);

router
  .route('/:id')
  .get(controllers.getOne)
  .put(controllers.updateOne)
  .delete(controllers.removeOne);

router.route('/:id/access/add').put(controllers.addToHasAccess);
router.route('/:id/access/remove').put(controllers.removeFromHasAccess);

router
  .route('/:id/invites')
  .get(noteInviteControllers.getMany)
  .post(noteInviteControllers.createOne);

router
  .route('/:id/invites/:invite_id')
  // when an invite is cancelled by the inviter
  .delete(noteInviteControllers.removeOne);

router
  .route('/:id/invites/:invite_id/accept')
  .delete(noteInviteControllers.acceptOne);

export default router;
