"use strict";
const form = require('express-form');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = form(form.field('reserve_tickets').trim().required(), form.field('mvtk').trim());
