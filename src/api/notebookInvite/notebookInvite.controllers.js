import { Note } from '../note/note.model.js';
import { Notebook } from '../notebook/notebook.model.js';
import { NotebookInvite } from './notebookInvite.model.js';

export const getMany = (model) => async (req, res) => {
  try {
    const docs = await model
      .find({ notebook: req.params.id })
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
      notebook: req.params.id,
      inviter: req.user._id,
      receiver: req.body.receiver,
    };

    if (newInvite.inviter.equals(newInvite.receiver)) {
      return res.status(400).json({ message: 'Can not invite yourself' });
    }

    const notebook = await Notebook.findOne({
      _id: newInvite.notebook,
    })
      .lean()
      .exec();

    // only the creator of a notebook can invite other users
    if (!notebook.createdBy.equals(newInvite.inviter)) {
      return res.status(403).end();
    }

    // check if the user is included in the old access array
    const alreadyHasAccess = notebook.hasAccess.filter((oldUser) => {
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

// called when an invite is declined or cancelled by the inviter
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

    if (!invite) {
      return res.status(404).json({ message: 'no invite found' });
    }
    // only the invite receiver can accept the invite
    if (!invite.receiver.equals(req.user._id)) {
      return res.status(403).end();
    }

    // update the hasAccess array of the Notebook, if the invite receiver does not have access already
    const updatedNotebook = await Notebook.findOneAndUpdate(
      {
        _id: invite.notebook,
        hasAccess: { $not: { $all: [invite.receiver] } },
      },
      { $addToSet: { hasAccess: invite.receiver } },
      {
        new: true,
      }
    )
      .lean()
      .exec();

    if (!updatedNotebook) {
      const notebook = await Notebook.findOne({ _id: invite.notebook })
        .lean()
        .exec();

      if (!notebook) {
        return res.status(404).end();
      }

      return res.status(400).json({
        message: 'Invite receiver already has Access to the notebook',
      });
    }

    // iterate over the Note ids that are given on the Notebook and update their hasAccess field
    for (const noteID of updatedNotebook.notes) {
      await Note.updateOne(
        { _id: noteID },
        { $addToSet: { hasAccess: invite.receiver } }
      );
    }

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

export default crudControllers(NotebookInvite);
