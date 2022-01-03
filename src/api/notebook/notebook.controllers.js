import { Notebook } from './notebook.model';
import { Note } from '../note/note.model';

const userHasAccess = (doc, userID) => {
    const matchingUserID = doc.hasAccess.filter((docUserObj) =>
        docUserObj._id.equals(userID)
    );

    if (matchingUserID.length > 0) {
        return true;
    }
    return false;
};

const getOne = (model) => async (req, res) => {
    try {
        const doc = await model
            .findOne({ _id: req.params.id, hasAccess: req.user._id })
            .select('-__v')
            .populate(
                'notes',
                '_id title emoji deleted deletedAt archived archivedAt visible'
            )
            .populate('hasAccess', '_id email firstName picture')
            .lean()
            .exec();

        if (!doc) {
            const docWithoutAccess = await model
                .findOne({ _id: req.params.id })
                .lean()
                .exec();

            if (!docWithoutAccess) {
                return res.status(404).end();
            }

            return res.status(403).end();
        }

        return res.status(200).json(doc);
    } catch (e) {
        return res.status(400).end();
    }
};

const getMany = (model) => async (req, res) => {
    try {
        const docs = await model
            .find({ hasAccess: req.user._id })
            .select('-__v')
            .populate(
                'notes',
                '_id title emoji deleted deletedAt archived archivedAt visible'
            )
            .populate('hasAccess', '_id email firstName picture')
            .populate('emoji')
            .lean()
            .exec();

        console.log(docs);

        if (!docs) {
            return res.status(404).end();
        }

        return res.status(200).json(docs);
    } catch (e) {
        return res.status(400).end();
    }
};

const createOne = (model) => async (req, res) => {
    try {
        const notebook = req.body;

        notebook.hasAccess = [req.user._id];
        notebook.createdBy = req.user._id;

        console.log(notebook.emoji);

        const createdDoc = await model.create(notebook);

        const doc = await model
            .findById(createdDoc._id)
            .select('-__v')
            .populate(
                'notes',
                '_id title emoji deleted deletedAt archived archivedAt visible'
            )
            .populate('hasAccess', '_id email firstName picture')
            .lean()
            .exec();

        if (!doc) {
            return res.status(404).end();
        }

        return res.status(201).json(doc);
    } catch (e) {
        return res.status(400).end();
    }
};

const updateOne = (model) => async (req, res) => {
    try {
        const notebookUpdates = req.body;

        // check for archived status
        if (notebookUpdates.archived === true) {
            notebookUpdates.archivedAt = Date.now();
            notebookUpdates.deleted = false;
            notebookUpdates.deletedAt = null;
        }
        if (notebookUpdates.archived === false) {
            notebookUpdates.archivedAt = null;
        }

        // check for deletion status
        if (notebookUpdates.deleted === true) {
            notebookUpdates.deletedAt = Date.now();
            notebookUpdates.archived = false;
            notebookUpdates.archivedAt = null;
        }
        if (notebookUpdates.deleted === false) {
            notebookUpdates.deletedAt = null;
        }

        // updates to the hasAccess fields are handled by different routes
        if (notebookUpdates.hasAccess) {
            delete notebookUpdates.hasAccess;
        }

        // update the document
        const updatedDoc = await model
            .findOneAndUpdate(
                { _id: req.params.id, hasAccess: req.user._id },
                notebookUpdates,
                {
                    new: true,
                }
            )
            .select('-__v')
            .populate(
                'notes',
                '_id title emoji deleted deletedAt archived archivedAt visible'
            )
            .populate('hasAccess', '_id email firstName picture')
            .exec();

        // check for the cause of the non existent updated document and return correct error status code
        if (!updatedDoc) {
            const doc = await model.findById(req.params.id).lean().exec();

            if (!doc) {
                return res.status(404).end();
            }

            return res.status(403).end();
        }

        return res.status(200).json(updatedDoc);
    } catch (e) {
        return res.status(400).end();
    }
};

const removeOne = (model) => async (req, res) => {
    try {
        const removed = await model
            .findOneAndRemove({ _id: req.params.id, hasAccess: req.user._id })
            .select('-__v')
            .populate(
                'notes',
                '_id title emoji deleted deletedAt archived archivedAt visible'
            )
            .populate('hasAccess', '_id email firstName picture')
            .exec();

        if (!removed) {
            const doc = await model.findById(req.params.id).lean().exec();

            if (!doc) {
                return res.status(404).end();
            }

            return res.status(403).end();
        }

        return res.status(200).json(removed);
    } catch (e) {
        return res.status(400).end();
    }
};

const removeFromHasAccess = (model) => async (req, res) => {
    try {
        const doc = await model.findById(req.params.id).lean().exec();

        if (!doc.createdBy.equals(req.user._id)) {
            return res.status(403).end();
        }

        if (!userHasAccess(doc, req.body._id)) {
            return res
                .status(400)
                .json({ message: 'User to be removed has no access.' });
        }

        const updatedDoc = await model
            .findOneAndUpdate(
                { _id: req.params.id },
                { $pullAll: { hasAccess: [req.body._id] } },
                {
                    new: true,
                }
            )
            .select('-__v')
            .populate(
                'notes',
                '_id title emoji deleted deletedAt archived archivedAt visible'
            )
            .populate('hasAccess', '_id email firstName picture')
            .exec();

        if (!updatedDoc) {
            return res.status(404).json({ message: 'Notebook not found' });
        }

        // iterate over the note ids that are given on the Notebook doc and update their hasAccess field
        const noteUpdates = [];

        updatedDoc.notes.forEach((noteID) => {
            noteUpdates.push(
                Note.updateOne(
                    { _id: noteID },
                    { $pullAll: { hasAccess: [req.body._id] } }
                )
            );
        });

        await Promise.all(noteUpdates);

        return res.status(200).json(updatedDoc);
    } catch (e) {
        return res.status(400).end();
    }
};

const crudControllers = (model) => ({
    getOne: getOne(model),
    getMany: getMany(model),
    createOne: createOne(model),
    updateOne: updateOne(model),
    removeOne: removeOne(model),
    removeFromHasAccess: removeFromHasAccess(model),
});

export default crudControllers(Notebook);
