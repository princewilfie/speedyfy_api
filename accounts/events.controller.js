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
        image: Joi.any().optional() // Optional for create, as multer handles it
    });
    validateRequest(req, next, schema);
}


function create(req, res, next) {
    // Extract image file path from req.file
    const image = req.file ? req.file : null;

    // Log the file details for debugging
    console.log('Uploaded file:', req.file);

    notifyUsersForNewEvent(req.body);
    
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
        price: Joi.number().empty(''),
        image: Joi.any().optional() // Optional for update, as multer handles it
    });
    validateRequest(req, next, schema); 
}

function update(req, res, next) {
    // Extract image file path from req.file
    const image = req.file ? req.file : null;

    // Log the file details for debugging
    console.log('Uploaded file:', req.file);

    eventService.update(req.params.id, { ...req.body, image }) // Pass image path to service
        .then(() => res.json({ message: 'Event updated successfully' }))
        .catch(next);
}

function _delete(req, res, next) {
    eventService.delete(req.params.id)
        .then(() => res.json({ message: 'Event deleted successfully' }))
        .catch(next);
}



async function sendRegistrationConfirmation(req, res, next) {
    try {
        // Assuming you pass user email and origin in the request body
        const { userEmail, origin } = req.body;

        // Fetch user details based on the email from eventService
        const user = await eventService.getUserByEmail(userEmail);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Send event registration confirmation email
        await sendEventRegistrationConfirmation(user, origin);

        return res.status(200).json({ message: 'Event registration confirmation email sent successfully.' });
    } catch (error) {
        console.error('Error sending event registration confirmation email:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}


async function notifyUsersForNewEvent(event) {
    try {
        // Fetch all registered users from the database
        const users = await eventService.getAllUsers();

        // Filter users who are registered with Gmail accounts
        const gmailUsers = users.filter(user => user.email.endsWith('@gmail.com'));

        // Send notification email to Gmail users
        for (const user of gmailUsers) {
            await sendEventNotificationEmail(user.email, event);
        }

        console.log('Notification emails sent to Gmail users for the new event.');
    } catch (error) {
        console.error('Error sending notification emails for new event:', error);
    }
}
