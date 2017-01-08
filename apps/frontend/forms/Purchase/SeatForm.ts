import form = require('express-form');

export default form(
    form.field('seats').trim().required()
);
