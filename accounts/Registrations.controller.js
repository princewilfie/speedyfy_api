const express = require('express'); 
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request'); 
const authorize = require('_middleware/authorize');
const registrationService = require('./Registrations.service');

// routes
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);

module.exports = router;

function createSchema(req, res, next) {
    const schema = Joi.object({
        event_id: Joi.number().required(),
        acc_id: Joi.number().required(),
        acc_name: Joi.string().required(),
        date_registered: Joi.date().required(),
        payment_status: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    registrationService.create(req.body)
        .then(registration => res.status(201).json(registration))
        .catch(next);
}

function getAll(req, res, next) {
    registrationService.getAll()
        .then(registrations => res.json(registrations))
        .catch(next);
}

function getById(req, res, next) {
    registrationService.getById(req.params.id)
        .then(registration => registration ? res.json(registration) : res.sendStatus(404))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schema = Joi.object({
        event_id: Joi.number().empty(''),
        acc_id: Joi.number().empty(''),
        acc_name: Joi.string().empty(''),
        date_registered: Joi.date().empty(''),
        payment_status: Joi.string().empty('')
    });
    validateRequest(req, next, schema); 
}

function update(req, res, next) {
    registrationService.update(req.params.id, req.body)
        .then(() => res.json({ message: 'Registration updated successfully' }))
        .catch(next);
}

function _delete(req, res, next) {
    registrationService.delete(req.params.id)
        .then(() => res.json({ message: 'Registration deleted successfully' }))
        .catch(next);
}
