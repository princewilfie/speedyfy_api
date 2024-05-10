const express = require('express'); 
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request'); 
const authorize = require('_middleware/authorize');
const eventService = require('./events.service');
const upload = require('_middleware/multer-config'); // Import multer configuration

// routes
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', upload.single('image'), createSchema, create); // Handle image upload for create
router.put('/:id', upload.single('image'), updateSchema, update); // Handle image upload for update
router.delete('/:id', _delete);

module.exports = router;

function createSchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().required(),
        date: Joi.date().required(),
        location: Joi.string().required(),
        description: Joi.string().required(),
        category: Joi.string().required(),
        price: Joi.number().required(),
        image: Joi.any().required() // Validate as a file upload
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    // Extract image file path from req.file
    const image = req.file ? req.file.path : null;

    eventService.create({ ...req.body, image }) // Pass image path to service
        .then(event => res.status(201).json(event))
        .catch(next);
}

function getAll(req, res, next) {
    eventService.getAll()
        .then(events => res.json(events))
        .catch(next);
}

function getById(req, res, next) {
    eventService.getById(req.params.id)
        .then(event => event ? res.json(event) : res.sendStatus(404))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().empty(''),
        date: Joi.date().empty(''),
        location: Joi.string().empty(''),
        description: Joi.string().empty(''),
        category: Joi.string().empty(''),
        price: Joi.number().empty('')
    });
    validateRequest(req, next, schema); 
}

function update(req, res, next) {
    // Extract image file path from req.file
    const image = req.file ? req.file.path : null;

    eventService.update(req.params.id, { ...req.body, image }) // Pass image path to service
        .then(() => res.json({ message: 'Event updated successfully' }))
        .catch(next);
}

function _delete(req, res, next) {
    eventService.delete(req.params.id)
        .then(() => res.json({ message: 'Event deleted successfully' }))
        .catch(next);
}
