import { Notebook } from '../notebook/notebook.model';
import { Note } from './note.model';

const userHasAccess = (doc, userID) => {
    const matchingUserID = doc.hasAccess.filter((docUserObj) =>
        docUserObj._id.equals(userID)
    );

    if (matchingUserID.length > 0) {
        return true;
    }
    return false;
};

// have to insert queries for each particular controller

const getOne = (model) => async (req, res) => {
    try {
        // .lean() gets back POJO instead of mongoose object
        // If you're executing a query and sending the results without modification to, say, an Express response, you should use lean.
        // In general, if you do not modify the query results and do not use custom getters, you should use lean()
        const doc = await model
            .findOne({ _id: req.params.id, hasAccess: req.user._id })
            .select('-__v')
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
        console.error(e);
        return res.status(400).end();
    }
};

// maybe for getting all the notes in a specific notebook
// only question is about the users access
// should have access if able to send a request for that notebook though
// export const getMany = (model) => async (req, res) => {
//   try {
//     const docs = await model.find().lean().exec();

//     res.status(200).json(docs);
//   } catch (e) {
//     console.error(e);
//     res.status(400).end();
//   }
// };

const createOne = (model) => async (req, res) => {
    try {
        const note = req.body;

        note.hasAccess = [req.user._id];
        note.createdBy = req.user._id;
        note.lastUpdatedBy = req.user._id;

        const createdDoc = await model.create(note);

        // updating the notebook entry so that it featues this note's id
        const updatedNotebook = await Notebook.findOneAndUpdate(
            { _id: createdDoc.notebook, hasAccess: req.user._id },
            { $push: { notes: createdDoc._id } }
        ).exec();

        // update the note's hasAccess to feature everyone in the notebooks hasAccess
        createdDoc.hasAccess = updatedNotebook.hasAccess;
        await createdDoc.save();

        const doc = await model
            .findOne({ _id: createdDoc._id })
            .select('-__v')
            .populate('hasAccess', '_id email firstName picture')
            .lean()
            .exec();

        if (!doc) {
            return res.status(404).end();
        }

        return res.status(201).json(doc);
    } catch (e) {
        console.error(e);
        return res.status(400).end();
    }
};

const updateOne = (model) => async (req, res) => {
    try {
        const noteUpdates = req.body;
        noteUpdates.lastUpdatedBy = req.user._id;

        // check for deletion status
        if (noteUpdates.deleted === true) {
            noteUpdates.deletedAt = Date.now();
        }
        if (noteUpdates.deleted === false) {
            noteUpdates.deletedAt = null;
        }

        // updates to the hasAccess fields are handled by different routes
        if (noteUpdates.hasAccess) {
            delete noteUpdates.hasAccess;
        }

        // update the document
        const updatedDoc = await model
            .findOneAndUpdate(
                { _id: req.params.id, hasAccess: req.user._id },
                noteUpdates,
                { new: true }
            )
            .select('-__v')
            .populate('hasAccess', '_id email firstName picture')
            .exec();

        if (!updatedDoc) {
            const doc = await model
                .findOne({ _id: req.params.id })
                .lean()
                .exec();

            if (!doc) {
                return res.status(404).end();
            }

            return res.status(403).end();
        }

        return res.status(200).json(updatedDoc);
    } catch (e) {
        console.error(e);
        return res.status(400).end();
    }
};

const removeOne = (model) => async (req, res) => {
    try {
        const removed = await model
            .findOneAndRemove({ _id: req.params.id, hasAccess: req.user._id })
            .select('-__v')
            .populate('hasAccess', '_id email firstName picture')
            .exec();

        if (!removed) {
            const doc = await model
                .findOne({ _id: req.params.id })
                .lean()
                .exec();

            if (!doc) {
                return res.status(404).end();
            }

            return res.status(403).end();
        }

        return res.status(200).json(removed);
    } catch (e) {
        console.error(e);
        return res.status(400).end();
    }
};

// adding users to the hasAccess field is handled by the invite system
// export const addToHasAccess = (model) => async (req, res) => {
//   try {
//     const userToAdd = req.body._id;

//     if (!userToAdd) {
//       return res.status(400).json({
//         message: 'No valid user to remove was given in the request body',
//       });
//     }

//     // update the document
//     const updatedDoc = await model
//       .findOneAndUpdate(
//         { _id: req.params.id, hasAccess: req.user._id },
//         { $addToSet: { hasAccess: userToAdd } },
//         {
//           new: true,
//         }
//       )
//       .select('-__v')
//       .populate('hasAccess', '_id email firstName picture')
//       .exec();

//     if (!updatedDoc) {
//       const doc = await model.findOne({ _id: req.params.id }).lean().exec();

//       if (!doc) {
//         return res.status(404).end();
//       }

//       if (!userHasAccess(doc, req.user._id)) {
//         return res.status(403).end();
//       }

//       return res.status(404).end();
//     }

//     res.status(200).json(updatedDoc);
//   } catch (e) {
//     console.error(e);
//     res.status(400).end();
//   }
// };

const removeFromHasAccess = (model) => async (req, res) => {
    try {
        const doc = await model.findOne({ _id: req.params.id }).lean().exec();

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
            .populate('hasAccess', '_id email firstName picture')
            .exec();

        if (!updatedDoc) {
            return res.status(404).json({ message: 'Notebook not found' });
        }

        return res.status(200).json(updatedDoc);
    } catch (e) {
        console.error(e);
        return res.status(400).end();
    }
};

const crudControllers = (model) => ({
    getOne: getOne(model),
    //   getMany: getMany(model),
    createOne: createOne(model),
    updateOne: updateOne(model),
    removeOne: removeOne(model),
    //   addToHasAccess: addToHasAccess(model),
    removeFromHasAccess: removeFromHasAccess(model),
});

export default crudControllers(Note);
