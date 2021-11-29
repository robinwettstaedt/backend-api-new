import { Todo } from './todo.model';

const PRIORITY_ENUM = ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'];
const REPEATING_ENUM = ['MAYBE', 'NOT', 'NEEDED'];

const getOne = (model) => async (req, res) => {
    try {
        const doc = await model
            .findOne({ _id: req.params.id })
            .select('-__v')
            .lean()
            .exec();

        if (!doc) {
            return res.status(404).end();
        }

        if (!doc.createdBy.equals(req.user._id)) {
            return res.status(403).end();
        }

        return res.status(200).json(doc);
    } catch (e) {
        console.error(e);
        return res.status(400).end();
    }
};

const getMany = (model) => async (req, res) => {
    try {
        const docs = await model
            .find({ createdBy: req.user._id })
            .lean()
            .select('-__v')
            .exec();

        if (!docs) {
            return res.status(404).end();
        }

        return res.status(200).json(docs);
    } catch (e) {
        console.error(e);
        return res.status(400).end();
    }
};

const createOne = (model) => async (req, res) => {
    try {
        const todo = req.body;

        // check if the <property> value is legitimate
        if (todo.priority) {
            if (!PRIORITY_ENUM.includes(todo.priority)) {
                return res.status(400).json({
                    message: `<priority> value has to be one of the following: ${PRIORITY_ENUM}`,
                });
            }
        }

        // check if the <repeating> value is legitimate
        if (todo.repeating) {
            if (!REPEATING_ENUM.includes(todo.repeating)) {
                return res.status(400).json({
                    message: `<repeating> value has to be one of the following: ${REPEATING_ENUM}`,
                });
            }
        }

        // changing the <deletedAt> field if the value of the <deleted> field changes
        if (todo.deleted === true) {
            todo.deletedAt = Date.now();
        } else if (todo.deleted === false) {
            todo.deletedAt = null;
        }

        todo.createdBy = req.user._id;

        const createdDoc = await model.create(todo);

        const doc = await model
            .findOne({ _id: createdDoc._id })
            .select('-__v')
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
        const todoUpdates = req.body;

        // check if the <propertu> value is legitimate
        if (todoUpdates.priority) {
            if (!PRIORITY_ENUM.includes(todoUpdates.priority)) {
                return res.status(400).json({
                    message: `<priority> value has to be one of the following: ${PRIORITY_ENUM}`,
                });
            }
        }

        // check if the <repeating> value is legitimate
        if (todoUpdates.repeating) {
            if (!REPEATING_ENUM.includes(todoUpdates.repeating)) {
                return res.status(400).json({
                    message: `<repeating> value has to be one of the following: ${REPEATING_ENUM}`,
                });
            }
        }

        // changing the <deletedAt> field if the value of the <deleted> field changes
        if (todoUpdates.deleted === true) {
            todoUpdates.deletedAt = Date.now();
        } else if (todoUpdates.deleted === false) {
            todoUpdates.deletedAt = null;
        }

        const updatedDoc = await model
            .findOneAndUpdate(
                { _id: req.params.id, createdBy: req.user._id },
                todoUpdates,
                { new: true }
            )
            .select('-__v')
            .exec();

        if (!updatedDoc) {
            const doc = await model
                .findOne({ _id: req.params.id })
                .select('-__v')
                .lean()
                .exec();

            if (!doc) {
                return res.status(404).end();
            }

            if (!doc.createdBy.equals(req.user._id)) {
                return res.status(403).end();
            }

            return res.status(404).end();
        }

        return res.status(200).json(updatedDoc);
    } catch (e) {
        console.error(e);
        return res.status(400).end();
    }
};

const removeOne = (model) => async (req, res) => {
    try {
        const removedDoc = await model
            .findOneAndRemove({ _id: req.params.id, createdBy: req.user._id })
            .select('-__v')
            .exec();

        if (!removedDoc) {
            const doc = await model
                .findOne({ _id: req.params.id })
                .lean()
                .exec();

            if (!doc) {
                return res.status(404).end();
            }

            if (!doc.createdBy.equals(req.user._id)) {
                return res.status(403).end();
            }

            return res.status(404).end();
        }

        return res.status(200).json(removedDoc);
    } catch (e) {
        console.error(e);
        return res.status(400).end();
    }
};

// REMOVES ALL TODOS with a dueDate older than 48 hrs
// used locally on the server at timed intervals to clear up db space
const removeMany = (model) => async (req, res) => {
    try {
        const docs = await model
            .deleteMany({
                dueDate: {
                    $lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                },
            })
            .lean()
            .exec();

        if (!docs) {
            return res.status(404).end();
        }

        return res.status(200).json(docs);
    } catch (e) {
        console.error(e);
        return res.status(400).end();
    }
};

const crudControllers = (model) => ({
    getOne: getOne(model),
    getMany: getMany(model),
    createOne: createOne(model),
    updateOne: updateOne(model),
    removeOne: removeOne(model),
    removeMany: removeMany(model),
});

export default crudControllers(Todo);
