import form = require('express-form');

export default form(
    form.field('reserve_tickets').trim().required(),
    form.field('mvtk').trim()
);
