const db = require('_helpers/db');
const fs = require('fs').promises;
const path = require('path');
const sendEmail = require('../_helpers/send-email');

module.exports = {
    create,
    getAll,
    getById,
    update,
    delete: _delete,
    sendUpcomingEventNotifications,
    notifyUsersForNewEvent
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





async function sendEventRegistrationConfirmation(account, origin) {
    let message;
    if (origin) {
        message = `<p>Thank you for joining the event at Speedyfy. We're excited to have you!</p>`;
    } else {
        message = `<p>Thank you for joining the event at Speedyfy. We're excited to have you!</p>`;
    }

    await sendEmail({
        from: {
            name: 'Speedyfy',
            address: 'speedyfyteam.info@gmail.com'
        },
        to: account.email,
        subject: 'Event Registration Confirmation - Speedyfy',
        html: `<h4>Event Registration Confirmation</h4>
               ${message}
               <p>If you have any questions or need assistance, feel free to contact us.</p>
               <p>Thank you,<br> The Speedyfy Team</p>`
    });
}



async function sendUpcomingEventNotifications() {
    try {
        // Fetch upcoming events from the database (events happening in the next 7 days)
        const upcomingEvents = await db.Event.findAll({
            where: {
                date: {
                    [db.Sequelize.Op.between]: [new Date(), moment().add(7, 'days').toDate()]
                }
            }
        });

        if (upcomingEvents.length === 0) {
            console.log('No upcoming events found.');
            return;
        }

        // Fetch all user accounts from the database
        const users = await db.User.findAll();

        // Iterate through each user and send them an email for each upcoming event
        for (const user of users) {
            for (const event of upcomingEvents) {
                const message = `<p>Hi ${user.username},</p>
                                 <p>We would like to remind you about the upcoming event:</p>
                                 <p><strong>${event.name}</strong></p>
                                 <p>Date: ${moment(event.date).format('MMMM Do YYYY, h:mm:ss a')}</p>
                                 <p>Location: ${event.location}</p>
                                 <p>Description: ${event.description}</p>
                                 <p>Category: ${event.category}</p>
                                 <p>Price: ${event.price}</p>
                                 <p>We look forward to seeing you there!</p>
                                 <p>Best regards,<br>The Speedyfy Team</p>`;

                await sendEmail({
                    from: {
                        name: 'Speedyfy',
                        address: 'speedyfyteam.info@gmail.com'
                    },
                    to: user.email,
                    subject: 'Upcoming Event Reminder - Speedyfy',
                    html: message
                });
            }
        }

        console.log('Upcoming event notifications sent successfully.');
    } catch (error) {
        console.error('Error sending upcoming event notifications:', error);
        throw error;
    }
}



async function notifyUsersForNewEvent(event) {
    try {
        const users = await db.User.findAll({ attributes: ['email'] });

        const emailPromises = users.map(user => {
            return sendEmail({
                from: {
                    name: 'Speedyfy',
                    address: 'speedyfyteam.info@gmail.com'
                },
                to: user.email,
                subject: 'New Event Added - Speedyfy',
                html: `<h4>New Event: ${event.name}</h4>
                       <p>Date: ${event.date}</p>
                       <p>Location: ${event.location}</p>
                       <p>Description: ${event.description}</p>
                       <p>Category: ${event.category}</p>
                       <p>Price: ${event.price}</p>
                       <p>Check out the new event on Speedyfy!</p>
                       <p>Thank you,<br> The Speedyfy Team</p>`
            });
        });

        await Promise.all(emailPromises);
        console.log('Emails sent to all users');
    } catch (error) {
        console.error('Error sending emails to users:', error);
    }
}