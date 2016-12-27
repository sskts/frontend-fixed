import form = require('express-form');

export default form(
    form.field('seat_codes').trim().required(),
    form.field('mvtk').trim()
);
