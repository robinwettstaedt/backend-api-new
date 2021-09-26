import { NoteInvite } from './noteInvite.model.js';
import { Note } from '../note/note.model.js';

export const getMany = (model) => async (req, res) => {
  try {
    const docs = await model.find({ note: req.params.id }).lean().exec();

    if (!docs) return res.status(404).end();

    res.status(200).json(docs);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const createOne = (model) => async (req, res) => {
  try {
    const newInvite = {
      notebook: req.params.id,
      inviter: req.user._id,
      receiver: req.body.receiver,
    };

    const inviteAlreadyExists = await model.find(newInvite);

    console.log(inviteAlreadyExists);

    if (inviteAlreadyExists._id !== null) {
      return res.status(413).json({ message: 'Invite already exists' });
    }

    const createdDoc = await model.create(newInvite);

    const doc = await model
      .findOne({ _id: createdDoc._id })
      .select('-__v')
      .populate('receiver', '_id email firstName picture')
      .lean()
      .exec();

    res.status(201).json(doc);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const removeOne = (model) => async (req, res) => {
  try {
    // removed == the removed document (if any)
    const removed = await model
      .findOneAndRemove({ _id: req.params.invite_id })
      .select('-__v')
      .lean()
      .exec();

    if (!removed) {
      return res.status(404).end();
    }

    res.status(200).json(removed);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const acceptOne = (model) => async (req, res) => {
  try {
    const inviteID = req.params.invite_id;

    const invite = await model.findOne({ _id: inviteID }).lean().exec();

    if (!invite) return res.status(404).json({ message: 'no invite found' });

    // only the invite receiver can accept the invite
    if (!invite.receiver.equals(req.user._id)) return res.status(403).end();

    // changing the hasAccess field of the corresponding notebook #######################
    const notebook = await Notebook.findOne({ _id: invite.notebook })
      .lean()
      .exec();

    if (!notebook) {
      return res.status(404).end();
    }

    const userToAdd = invite.receiver;
    const oldAccessArray = notebook.hasAccess;

    // check if the user is included in the old access array
    const alreadyHasAccess = oldAccessArray.filter((oldUser) => {
      return oldUser.toString() === userToAdd;
    });

    if (alreadyHasAccess.length > 0) {
      return res.status(400).json({
        message: 'User does already have access',
      });
    }

    // append the new user to the old access array
    oldAccessArray.push(userToAdd);

    // renaming the array
    const newAccessArray = oldAccessArray;

    // update the notebook
    const updatedDoc = await Notebook.findOneAndUpdate(
      { _id: invite.notebook },
      { hasAccess: newAccessArray }
    ).exec();

    if (!updatedDoc) {
      return res.status(404).end();
    }
    // ######################################################

    // deleting the accepted invite
    const removed = await model
      .findOneAndRemove({ _id: inviteID })
      .select('-__v')
      .lean()
      .exec();

    if (!removed) {
      return res.status(404).end();
    }

    res.status(200).json(removed);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

const crudControllers = (model) => ({
  getMany: getMany(model),
  createOne: createOne(model),
  removeOne: removeOne(model),
  acceptOne: acceptOne(model),
});

export default crudControllers(NotebookInvite);
