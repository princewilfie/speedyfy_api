const db = require('_helpers/db');

module.exports = {
    create,
    getAll,
    getById,
    update,
    delete: _delete
};

async function create(eventData) {
    // Validate if the event name already exists
    const existingEvent = await db.Event.findOne({ where: { name: eventData.name } });
    if (existingEvent) {
        throw 'Event with the same name already exists';
    }

    // Create a new event object
    const event = new db.Event(eventData);

    // Save the event
    await event.save();

    return basicDetails(event);
}

async function getAll() {
    const events = await db.Event.findAll();
    return events.map(event => basicDetails(event));
}

async function getById(id) {
    const event = await getEvent(id);
    return basicDetails(event);
}

async function update(id, eventData) {
    const event = await getEvent(id);

    // Update event data
    Object.assign(event, eventData);
    await event.save();

    return basicDetails(event);
}

async function _delete(id) {
    const event = await getEvent(id);
    await event.destroy();
}

// Helper function to get an event by its ID
async function getEvent(id) {
    const event = await db.Event.findByPk(id);
    if (!event) throw 'Event not found';
    return event;
}

// Helper function to extract basic details from an event object
function basicDetails(event) {
    const { id, name, date, location, description, category, price } = event;
    return { id, name, date, location, description, category, price };
}
