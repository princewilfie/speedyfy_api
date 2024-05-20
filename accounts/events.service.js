const db = require('../_helpers/db');
const fs = require('fs').promises;
const path = require('path');
const sendEmail = require('../_helpers/send-email');
const accountService = require('../accounts/account.service'); // Import the account service


module.exports = {
    create,
    getAll,
    getById,
    update,
    delete: _delete
};


// events.service.js
async function create(eventData) {
    const { image, ...eventDetails } = eventData;

    try {
        const existingEvent = await db.Event.findOne({ where: { name: eventDetails.name } });
        if (existingEvent) {
            throw 'Event with the same name already exists';
        }

        const event = await db.Event.create(eventDetails);

        if (image) {
            const imagePath = await saveImage(event.id, image);
            console.log('Saved image path:', imagePath); // Add this line

            await event.update({ image: imagePath });
        }

        // Notify all registered users
        await accountService.notifyUsers(event);

        return basicDetails(event);
    } catch (error) {
        throw error;
    }
}

async function saveImage(eventId, imageData) {
    try {
        console.log('Image data:', imageData); // Log imageData for debugging

        // Validate image file extension
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const extension = path.extname(imageData.originalname);
        if (!allowedExtensions.includes(extension)) {
            throw 'Only JPG, JPEG, PNG, and GIF files are allowed';
        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
        // Define file path
        const relativeImagePath = path.join('assets', imageData.filename);

        console.log('Image path:', relativeImagePath);

        // Write image data to file
       // await fs.writeFile(imagePath, imageData.buffer);

        // Return the relative path of the image
        return relativeImagePath;
    } catch (error) {
        console.error('Error saving image:', error);
        throw error;
    }
}


async function update(id, eventData) {
    const { image, ...eventDetails } = eventData;

    try {
        // Get the event object from the database
        const event = await getEvent(id);

        // Update event data
        await event.update(eventDetails);

        // If image is provided, update it
        if (image) {
            const imagePath = await saveImage(event.id, image);
            await event.update({ image: imagePath });
        }

        return basicDetails(event);
    } catch (error) {
        throw error;
    }
}



async function getAll() {
    try {
        const events = await db.Event.findAll();
        return events.map(event => basicDetails(event));
    } catch (error) {
        throw error;
    }
}

async function getById(id) {
    try {
        const event = await getEvent(id);
        return basicDetails(event);
    } catch (error) {
        throw error;
    }
}

async function _delete(id) {
    try {
        const event = await getEvent(id);
        await event.destroy();
    } catch (error) {
        throw error;
    }
}

async function getEvent(id) {
    try {
        const event = await db.Event.findByPk(id);
        if (!event) throw 'Event not found';
        return event;
    } catch (error) {
        throw error;
    }
}

function basicDetails(event) {
    const { id, name, date, location, description, category, price, image } = event;
    return { id, name, date, location, description, category, price, image };
}
