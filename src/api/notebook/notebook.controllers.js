import { Notebook } from './notebook.model.js';
import { Note } from '../note/note.model.js';

const userHasAccess = (doc, user_id) => {
  const matchingUserID = doc.hasAccess.filter((docUserObj) => {
    return docUserObj._id.equals(user_id);
  });

  if (matchingUserID.length > 0) {
    return true;
  }
  return false;
};

export const getOne = (model) => async (req, res) => {
  try {
    const doc = await model
      .findOne({ _id: req.params.id, hasAccess: req.user._id })
      .select('-__v')
      .populate('notes', '_id title emoji deleted deletedAt visible')
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

    res.status(200).json(doc);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const createOne = (model) => async (req, res) => {
  try {
    const notebook = req.body;

    notebook.hasAccess = [req.user._id];
    notebook.createdBy = req.user._id;

    const createdDoc = await model.create(notebook);

    const doc = await model
      .findOne({ _id: createdDoc._id })
      .select('-__v')
      .populate('notes', '_id title emoji deleted deletedAt visible')
      .populate('hasAccess', '_id email firstName picture')
      .lean()
      .exec();

    if (!doc) {
      return res.status(404).end();
    }

    res.status(201).json(doc);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const updateOne = (model) => async (req, res) => {
  try {
    const notebookUpdates = req.body;

    // check for deletion status
    if (notebookUpdates.deleted === true) {
      notebookUpdates.deletedAt = Date.now();
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
      .populate('notes', '_id title emoji deleted deletedAt visible')
      .populate('hasAccess', '_id email firstName picture')
      .exec();

    // check for the cause of the non existent updated document and return correct error status code
    if (!updatedDoc) {
      const doc = await model.findOne({ _id: req.params.id }).lean().exec();

      if (!doc) {
        return res.status(404).end();
      }

      return res.status(403).end();
    }

    return res.status(200).json(updatedDoc);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

export const removeOne = (model) => async (req, res) => {
  try {
    const removed = await model
      .findOneAndRemove({ _id: req.params.id, hasAccess: req.user._id })
      .select('-__v')
      .populate('notes', '_id title emoji deleted deletedAt visible')
      .populate('hasAccess', '_id email firstName picture')
      .exec();

    if (!removed) {
      const doc = await model.findOne({ _id: req.params.id }).lean().exec();

      if (!doc) {
        return res.status(404).end();
      }

      return res.status(403).end();
    }

    return res.status(200).json(removed);
  } catch (e) {
    console.error(e);
    res.status(400).end();
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

//     const updatedDoc = await model
//       .findOneAndUpdate(
//         { _id: req.params.id, hasAccess: req.user._id },
//         { $addToSet: { hasAccess: userToAdd } },
//         {
//           new: true,
//         }
//       )
//       .select('-__v')
//       .populate('notes', '_id title emoji deleted deletedAt visible')
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

//     // iterate over the Note ids that are given on the Notebook and update their hasAccess field
//     for (const noteID of updatedDoc.notes) {
//       await Note.updateOne(
//         { _id: noteID },
//         { $addToSet: { hasAccess: userToAdd } }
//       );
//     }

//     res.status(200).json(updatedDoc);
//   } catch (e) {
//     console.error(e);
//     res.status(400).end();
//   }
// };

export const removeFromHasAccess = (model) => async (req, res) => {
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
      .populate('notes', '_id title emoji deleted deletedAt visible')
      .populate('hasAccess', '_id email firstName picture')
      .exec();

    if (!updatedDoc) {
      return res.status(404).json({ message: 'Notebook not found' });
    }

    // iterate over the note ids that are given on the Notebook doc and update their hasAccess field
    for (const noteID of updatedDoc.notes) {
      await Note.updateOne(
        { _id: noteID },
        { $pullAll: { hasAccess: [req.body._id] } }
      );
    }

    res.status(200).json(updatedDoc);
  } catch (e) {
    console.error(e);
    res.status(400).end();
  }
};

const crudControllers = (model) => ({
  getOne: getOne(model),
  createOne: createOne(model),
  updateOne: updateOne(model),
  removeOne: removeOne(model),
  addToHasAccess: addToHasAccess(model),
  removeFromHasAccess: removeFromHasAccess(model),
});

export default crudControllers(Notebook);
