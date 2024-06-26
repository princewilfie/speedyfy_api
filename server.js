require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('_middleware/error-handler');
const path = require('path'); // Import the path module



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// allow cors request from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

// api routes
app.use('/accounts', require('./accounts/accounts.controller'));
app.use('/events', require('./accounts/events.controller')); // Mount the events controller router
app.use('/registrations', require('./accounts/Registrations.controller')); // Mount the registrations controller router



// swagger docs route
app.use('/api-docs', require('_helpers/swagger'));

//global error handler
app.use(errorHandler);

app.use('/assets', express.static(path.join(__dirname, 'assets')));



// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => console.log('Server listening on port ' + port));