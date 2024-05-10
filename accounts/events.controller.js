const express = require('express'); 
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request'); 
const authorize = require('_middleware/authorize')
const eventService = require('./events.service');

// routes
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);

module.exports = router;

function createSchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().required(),
        date: Joi.date().required(),
        location: Joi.string().required(),
        description: Joi.string().required(),
        category: Joi.string().required(),
        price: Joi.number().required()
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    eventService.create(req.body)
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
    eventService.update(req.params.id, req.body)
        .then(() => res.json({ message: 'Event updated successfully' }))
        .catch(next);
}

function _delete(req, res, next) {
    eventService.delete(req.params.id)
        .then(() => res.json({ message: 'Event deleted successfully' }))
        .catch(next);
}
