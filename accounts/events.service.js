const db = require('_helpers/db');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    create,
    getAll,
    getById,
    update,
    delete: _delete
};

async function create(eventData) {
    const { image, ...eventDetails } = eventData;

    try {
        // Validate if the event name already exists
        const existingEvent = await db.Event.findOne({ where: { name: eventData.name } });
        if (existingEvent) {
            throw 'Event with the same name already exists';
        }

        // Create a new event object
        const event = await db.Event.create(eventDetails);

        // If image is provided, store it
        if (image) {
            await saveImage(event.id, image);
        }

        return basicDetails(event);
    } catch (error) {
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
            await saveImage(event.id, image);
        }

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
        const extension = path.extname(imageData.originalname).toLowerCase();
        if (!allowedExtensions.includes(extension)) {
            throw 'Only JPG, JPEG, PNG, and GIF files are allowed';
        }

        // Define file path
        const imagePath = path.join(__dirname, `../assets/${eventId}${extension}`);

        // Write image data to file
        await fs.writeFile(imagePath, imageData.buffer);
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
    const { id, name, date, location, description, category, price } = event;
    return { id, name, date, location, description, category, price };
}
