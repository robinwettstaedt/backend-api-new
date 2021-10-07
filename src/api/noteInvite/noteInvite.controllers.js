import { Note } from '../note/note.model.js';
import { NoteInvite } from './noteInvite.model.js';

export const getMany = (model) => async (req, res) => {
  try {
    const docs = await model
      .find({ note: req.params.id })
      .lean()
      .select('-__v')
      .populate('inviter', '_id email firstName picture')
      .populate('receiver', '_id email firstName picture')
      .exec();

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
      note: req.params.id,
      inviter: req.user._id,
      receiver: req.body.receiver,
    };

    if (newInvite.inviter.equals(newInvite.receiver)) {
      return res.status(400).json({ message: 'Can not invite yourself' });
    }

    const note = await Note.findOne({
      _id: newInvite.note,
    })
      .lean()
      .exec();

    // only the creator of a note can invite other users
    if (!note.createdBy.equals(newInvite.inviter)) {
      return res.status(403).end();
    }

    // check if the user is included in the old access array
    const alreadyHasAccess = note.hasAccess.filter((oldUser) => {
      return oldUser.toString() === newInvite.receiver;
    });

    // filtered array will have one element inside if receiver already has access
    if (alreadyHasAccess.length > 0) {
      return res.status(400).json({
        message: 'User does already have access',
      });
    }

    const inviteAlreadyExists = await model.exists(newInvite);

    if (inviteAlreadyExists) {
      return res.status(400).json({ message: 'Invite already exists' });
    }

    const createdDoc = await model.create(newInvite);

    const doc = await model
      .findOne({ _id: createdDoc._id })
      .select('-__v')
      .populate('inviter', '_id email firstName picture')
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
    const removed = await model
      .findOneAndRemove({
        _id: req.params.invite_id,
        $or: [{ inviter: req.user._id }, { receiver: req.user._id }],
      })
      .select('-__v')
      .populate('inviter', '_id email firstName picture')
      .populate('receiver', '_id email firstName picture')
      .lean()
      .exec();

    if (!removed) {
      const doc = await model
        .findOne({ _id: req.params.invite_id })
        .lean()
        .exec();

      if (!doc) {
        return res.status(404).end();
      }

      // the document exists but the user issuing the request is neither the inviter, nor the receiver
      return res.status(403).end();
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
    const note = await Note.findOne({ _id: invite.note }).lean().exec();

    if (!note) {
      return res.status(404).end();
    }

    const userToAdd = invite.receiver;
    const oldAccessArray = note.hasAccess;

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
    const updatedNote = await Note.findOneAndUpdate(
      { _id: invite.note },
      { hasAccess: newAccessArray }
    ).exec();

    if (!updatedNote) {
      return res.status(404).end();
    }

    // ######################################################

    // deleting the accepted invite
    const removed = await model
      .findOneAndRemove({ _id: inviteID })
      .select('-__v')
      .populate('inviter', '_id email firstName picture')
      .populate('receiver', '_id email firstName picture')
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

export default crudControllers(NoteInvite);
