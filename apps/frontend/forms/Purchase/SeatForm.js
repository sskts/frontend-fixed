"use strict";
const form = require("express-form");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = form(form.field('seat_codes').trim().required());
