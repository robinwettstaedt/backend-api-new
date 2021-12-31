import User from './user.model';
import { Note } from '../note/note.model';
import { NoteInvite } from '../noteInvite/noteInvite.model';
import { Notebook } from '../notebook/notebook.model';
import { NotebookInvite } from '../notebookInvite/notebookInvite.model';
import { Todo } from '../todo/todo.model';

const NOTIFICATIONS_ENUM = ['ALL', 'TODOS', 'INVITES', 'NONE'];
const THEME_ENUM = ['LIGHT', 'DARK', 'AUTO'];

const getOne = () => async (req, res) => {
    try {
        const { user } = req; // user object that gets attached by the protect() middleware
        return res.status(200).send({ user });
    } catch (e) {
        return res.status(400).end();
    }
};

const updateOne = (model) => async (req, res) => {
    try {
        const { user } = req;
        const updateData = req.body;

        // check if the <theme> value is legitimate
        if (updateData.settings) {
            if (updateData.settings.notifications) {
                if (!THEME_ENUM.includes(updateData.settings.theme)) {
                    return res.status(400).json({
                        message: `<theme> value has to be one of the following: ${THEME_ENUM}`,
                    });
                }
            }
        }

        // check if the <notifications> value is legitimate
        if (updateData.settings) {
            if (updateData.settings.theme) {
                if (
                    !NOTIFICATIONS_ENUM.includes(
                        updateData.settings.notifications
                    )
                ) {
                    return res.status(400).json({
                        message: `<notifications> value has to be one of the following: ${NOTIFICATIONS_ENUM}`,
                    });
                }
            }
        }

        if (updateData.email) {
            return res
                .status(400)
                .json({ message: 'email can not be changed' });
        }

        if (updateData.googleToken) {
            const userToBeUpdated = await model.findOne(user).lean().exec();

            if (userToBeUpdated.password) {
                return res.status(400).end();
            }
        }

        if (updateData.password) {
            const userToBeUpdated = await model.findOne(user).lean().exec();

            if (userToBeUpdated.googleToken) {
                return res.status(400).end();
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

        return res.status(200).json({ data: updatedDoc });
    } catch (e) {
        return res.status(400).end();
    }
};

const removeOne = (model) => async (req, res) => {
    try {
        const userToBeDeleted = req.user._id;

        // necessary to wipe user out of all hasAccess fields?
        await Todo.deleteMany({ createdBy: userToBeDeleted }).exec();

        await NoteInvite.deleteMany({
            $or: [{ inviter: userToBeDeleted }, { receiver: userToBeDeleted }],
        }).exec();

        await NotebookInvite.deleteMany({
            $or: [{ inviter: userToBeDeleted }, { receiver: userToBeDeleted }],
        }).exec();

        await Note.deleteMany({ createdBy: userToBeDeleted }).exec();

        await Notebook.deleteMany({ createdBy: userToBeDeleted }).exec();

        // remove the user
        const deletedUser = await model
            .findOneAndRemove({ _id: userToBeDeleted })
            .select('-password -googleToken -tokenVersion -__v')
            .lean()
            .exec();

        if (!deletedUser) {
            return res.status(404).end();
        }

        return res.status(200).json({
            message:
                'Successfully deleted all user information and terminated the account',
        });
    } catch (e) {
        return res.status(400).end();
    }
};

const getInvites = () => async (req, res) => {
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
        return res.status(400).end();
    }
};

const crudControllers = (model) => ({
    getOne: getOne(),
    updateOne: updateOne(model),
    removeOne: removeOne(model),
    getInvites: getInvites(),
});

export default crudControllers(User);
