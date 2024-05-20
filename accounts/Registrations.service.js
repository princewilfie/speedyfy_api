const db = require('_helpers/db');

module.exports = {
    create,
    getAll,
    getById,
    update,
    delete: _delete
};


async function create(registrationData) {
    try {
        const registration = await db.Registration.create(registrationData);
        return basicDetails(registration);
    } catch (error) {
        throw error;
    }
}

async function getAll() {
    try {
        const registrations = await db.Registration.findAll();
        return registrations.map(registration => basicDetails(registration));
    } catch (error) {
        throw error;
    }
}

async function getById(id) {
    try {
        const registration = await getRegistration(id);
        return basicDetails(registration);
    } catch (error) {
        throw error;
    }
}

async function update(id, registrationData) {
    try {
        const registration = await getRegistration(id);
        await registration.update(registrationData);
        return basicDetails(registration);
    } catch (error) {
        throw error;
    }
}

async function _delete(id) {
    try {
        const registration = await getRegistration(id);
        await registration.destroy();
    } catch (error) {
        throw error;
    }
}

async function getRegistration(id) {
    try {
        const registration = await db.Registration.findByPk(id);
        if (!registration) throw 'Registration not found';
        return registration;
    } catch (error) {
        throw error;
    }
}

function basicDetails(registration) {
    const { reg_id, event_id, acc_id, acc_name, date_registered, payment_status } = registration;
    return { reg_id, event_id, acc_id, acc_name, date_registered, payment_status };
}
