import { User } from './user.model.js';
import { NotebookInvite } from '../notebookInvite/notebookInvite.model.js';
import { NoteInvite } from '../noteInvite/noteInvite.model.js';

const NOTIFICATIONS_ENUM = ['ALL', 'TODOS', 'INVITES', 'NONE'];
const THEME_ENUM = ['LIGHT', 'DARK'];

export const getOne = (model) => async (req, res) => {
  try {
    const user = req.user; // user object that gets attached by the protect() middleware
    res.status(200).send({ user: user });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const updateOne = (model) => async (req, res) => {
  try {
    const user = req.user;
    const updateData = req.body;

    // check if the <theme> value is legitimate
    if (updateData.settings.theme) {
      if (!THEME_ENUM.includes(updateData.settings.theme)) {
        return res.status(400).json({
          message: `<theme> value has to be one of the following: ${THEME_ENUM}`,
        });
      }
    }

    // check if the <notifications> value is legitimate
    if (updateData.settings.notifications) {
      if (!NOTIFICATIONS_ENUM.includes(updateData.settings.notifications)) {
        return res.status(400).json({
          message: `<notifications> value has to be one of the following: ${NOTIFICATIONS_ENUM}`,
        });
      }
    }

    const updatedDoc = await model
      .findOneAndUpdate(user, updateData, { new: true })
      .select('-password -googleToken -tokenVersion -__v')
      .lean()
      .exec();

    if (!updatedDoc) {
      return res.status(400).end();
    }

    res.status(200).json({ data: updatedDoc });
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const removeOne = (model) => async (req, res) => {
  try {
    const user = req.user;

    const removed = await model
      .findOneAndRemove(user)
      .select('-password -googleToken -tokenVersion -__v')
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

export const getInvites = () => async (req, res) => {
  try {
    const response = { notebookInvites: null, noteInvites: null };

    const notebookInvites = await NotebookInvite.find({
      receiver: req.user._id,
    })
      .lean()
      .exec();

    if (notebookInvites) {
      response.notebookInvites = notebookInvites;
    }

    const noteInvites = await NoteInvite.find({
      receiver: req.user._id,
    })
      .lean()
      .exec();

    if (noteInvites) {
      response.noteInvites = noteInvites;
    }

    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

const crudControllers = (model) => ({
  getOne: getOne(model),
  updateOne: updateOne(model),
  removeOne: removeOne(model),
  getInvites: getInvites(),
});

export default crudControllers(User);
